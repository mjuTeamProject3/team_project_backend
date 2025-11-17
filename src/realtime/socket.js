import { Server } from "socket.io";
import { verifyJwt } from "../utils/jwt.util.js";
import { getCompatibilityScore } from "../services/saju.service.js";
import { getSajuTopics } from "../services/fortune.service.js";
import { saveReport } from "../services/report.service.js";
import { prisma } from "../configs/db.config.js";

// In-memory state (single instance server)
const userIdToSocket = new Map();
const socketIdToUser = new Map();
const waitingQueues = {
  text: [],  // 텍스트 채팅 대기열
  video: []  // 영상 통화 대기열
};
const rooms = new Map(); // roomId -> { a: userId, b: userId, type: 'text' | 'video', topicsSuggested?: boolean, compatibilityVisible?: boolean }

const makeRoomId = (a, b) => `room_${[a, b].sort().join("_")}`;

export const initSocket = (httpServer, { corsOptions }) => {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOptions?.origin || "*",
      credentials: true,
    },
  });

  const cleanupUser = (userId) => {
    const socket = userIdToSocket.get(userId);
    if (socket) {
      userIdToSocket.delete(userId);
      socketIdToUser.delete(socket.id);
    }
    // Remove from both queues
    const textIdx = waitingQueues.text.indexOf(userId);
    if (textIdx >= 0) waitingQueues.text.splice(textIdx, 1);
    const videoIdx = waitingQueues.video.indexOf(userId);
    if (videoIdx >= 0) waitingQueues.video.splice(videoIdx, 1);
    // End rooms containing this user
    for (const [roomId, pair] of rooms) {
      if (pair.a === userId || pair.b === userId) {
        // 타입에 따라 다른 이벤트 전송
        const endEvent = pair.type === 'video' ? "video:ended" : "chat:ended";
        io.to(roomId).emit(endEvent, { reason: "disconnect" });
        rooms.delete(roomId);
        for (const s of io.of("/").adapter.rooms.get(roomId) || []) {
          const client = io.sockets.sockets.get(s);
          client?.leave(roomId);
        }
      }
    }
  };

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error("no_token"));
      const decoded = verifyJwt(token);
      const userId = decoded?.payload?.userId;
      if (!userId) return next(new Error("invalid_token"));
      socket.data.userId = userId;
      console.log(`[socket] auth ok user=${userId}`);
      return next();
    } catch (e) {
      console.error(`[socket] auth fail: ${e?.message||e}`);
      return next(e);
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    userIdToSocket.set(userId, socket);
    socketIdToUser.set(socket.id, userId);
    console.log(`[socket] connected user=${userId} sid=${socket.id}`);

    // Debug any events
    socket.onAny((event) => { if (event !== "message:send") console.log(`[onAny] user=${userId} event=${event}`); });

    socket.on("queue:join", async ({ type = 'text' } = {}) => {
      const queueType = type === 'video' ? 'video' : 'text';
      const queue = waitingQueues[queueType];
      console.log(`[queue] join user=${userId} type=${queueType}`);
      
      if (!queue.includes(userId)) queue.push(userId);
      
      // Try match
      if (queue.length >= 2) {
        const a = queue.shift();
        const b = queue.shift();
        const roomId = makeRoomId(a, b);
        rooms.set(roomId, { 
          a, 
          b, 
          type: queueType,
          compatibilityVisible: true 
        });
        console.log(`[match] room=${roomId} a=${a} b=${b} type=${queueType}`);
        
        const saju = await getCompatibilityScore({ userIdA: a, userIdB: b });
        let aUser = null, bUser = null;
        try {
          aUser = await prisma.user.findUnique({ where: { id: a }, select: { username: true } });
          bUser = await prisma.user.findUnique({ where: { id: b }, select: { username: true } });
        } catch {}

        // rooms에 전체 궁합 분석 결과 저장 (대화 주제 추천에 사용)
        const roomData = rooms.get(roomId);
        if (roomData && saju.fullAnalysis) {
          roomData.fullAnalysis = saju.fullAnalysis;
          rooms.set(roomId, roomData);
        }

        const sa = userIdToSocket.get(a);
        const sb = userIdToSocket.get(b);
        sa?.join(roomId);
        sb?.join(roomId);
        // initiator 결정: userId가 작은 쪽이 initiator
        const isAInitiator = a < b;
        const payloadA = { 
          roomId, 
          userId: a,
          partnerId: b, 
          partnerUsername: bUser?.username || null, 
          compatibility: saju,
          type: queueType,
          compatibilityVisible: true,
          isInitiator: isAInitiator
        };
        const payloadB = { 
          roomId, 
          userId: b,
          partnerId: a, 
          partnerUsername: aUser?.username || null, 
          compatibility: saju,
          type: queueType,
          compatibilityVisible: true,
          isInitiator: !isAInitiator
        };
        sa?.emit("match:found", payloadA);
        sb?.emit("match:found", payloadB);
      } else {
        socket.emit("queue:waiting", { position: queue.indexOf(userId) + 1, type: queueType });
      }
    });

    socket.on("message:send", ({ roomId, text, imageUrl }) => {
      let rid = roomId;
      if (!rooms.has(rid)) {
        for (const [r, p] of rooms) { if (p.a === userId || p.b === userId) { rid = r; break; } }
      }
      if (!rooms.has(rid)) return;
      if (!text && !imageUrl) return;
      io.to(rid).emit("message:new", { userId, text: text || '', imageUrl: imageUrl || null, ts: Date.now() });
    });

    socket.on("chat:end", ({ roomId, reason }, cb) => {
      console.log(`[end] request by user=${userId} roomId=${roomId||"?"}`);
      let rid = roomId;
      let pair = rooms.get(rid) || null;
      if (!pair) {
        for (const [r, p] of rooms) {
          if (p.a === userId || p.b === userId) { pair = p; rid = r; break; }
        }
      }
      if (!pair) {
        for (const r of socket.rooms) { if (r !== socket.id && rooms.has(r)) { pair = rooms.get(r); rid = r; break; } }
      }
      if (!pair) { cb && cb({ ok: false, error: "room_not_found" }); return; }
      // Notify first, then remove participants from the room, then clean state
      // 타입에 따라 다른 이벤트 전송
      const endEvent = pair.type === 'video' ? "video:ended" : "chat:ended";
      io.to(rid).emit(endEvent, { reason: reason || "ended" });
      const socketsInRoom = new Set(io.of("/").adapter.rooms.get(rid) || []);
      for (const s of socketsInRoom) { const client = io.sockets.sockets.get(s); client?.leave(rid); }
      rooms.delete(rid);
      console.log(`[end] closed room=${rid} type=${pair.type}`);
      cb && cb({ ok: true });
    });

    socket.on("user:report", async ({ roomId, reason }) => {
      try {
        console.log(`[report] by user=${userId} roomId=${roomId||"?"}`);
        if (!reason) { socket.emit("user:reported", { ok: false, error: "신고 사유가 필요합니다." }); return; }
        let rid = roomId; let pair = rooms.get(rid) || null;
        if (!pair) { for (const [r, p] of rooms) { if (p.a === userId || p.b === userId) { pair = p; rid = r; break; } } }
        if (!pair) { socket.emit("user:reported", { ok:false, error:"방 정보를 찾을 수 없습니다."}); return; }
        const targetUserId = pair.a === userId ? pair.b : pair.a;
        const target = await prisma.user.findUnique({ where: { id: targetUserId } });
        const targetUsername = target?.username || null;
        await saveReport({ reporterUserId: userId, targetUserId, targetUsername, roomId: rid, reason: reason || null });
        socket.emit("user:reported", { ok: true });
        console.log(`[report] saved against user=${targetUserId}`);
      } catch (e) {
        console.error("user:report error", e?.message || e);
        socket.emit("user:reported", { ok: false, error: String(e?.message || e) });
      }
    });

    socket.on("topics:suggest", async ({ roomId, context }) => {
      try {
        let rid = roomId; let pair = rooms.get(rid) || null;
        if (!pair) { for (const [r, p] of rooms) { if (p.a === userId || p.b === userId) { pair = p; rid = r; break; } } }
        if (!pair) return;
        if (pair.topicsSuggested) { socket.emit("topics:already", { message: "이미 대화 주제를 추천했습니다." }); return; }
        
        // FortuneAPI를 사용한 대화 주제 추천
        let topics = [];
        if (pair.fullAnalysis) {
          // 궁합 분석 결과가 있으면 FortuneAPI 사용
          try {
            topics = await getSajuTopics(pair.fullAnalysis);
            console.log(`[topics] FortuneAPI 추천: ${topics.length}개 주제`);
          } catch (e) {
            console.error("[topics] FortuneAPI error:", e?.message || e);
            // FortuneAPI 실패 시 빈 배열 반환
            topics = [];
          }
        } else {
          console.warn(`[topics] No fullAnalysis for room=${rid}`);
        }
        
        pair.topicsSuggested = true; 
        rooms.set(rid, pair);
        io.to(rid).emit("topics:list", { topics });
      } catch (e) {
        console.error("topics:suggest error", e?.message || e);
        socket.emit("topics:list", { topics: [] });
      }
    });

    // WebRTC 시그널링 이벤트들
    socket.on("webrtc:offer", ({ roomId, offer }) => {
      const room = rooms.get(roomId);
      if (!room || (room.a !== userId && room.b !== userId)) {
        console.log(`[webrtc] offer rejected: user=${userId} roomId=${roomId}`);
        return;
      }
      console.log(`[webrtc] offer from user=${userId} roomId=${roomId}`);
      // 상대방에게 offer 전달
      io.to(roomId).except(socket.id).emit("webrtc:offer", { offer });
    });

    socket.on("webrtc:answer", ({ roomId, answer }) => {
      const room = rooms.get(roomId);
      if (!room || (room.a !== userId && room.b !== userId)) {
        console.log(`[webrtc] answer rejected: user=${userId} roomId=${roomId}`);
        return;
      }
      console.log(`[webrtc] answer from user=${userId} roomId=${roomId}`);
      // 상대방에게 answer 전달
      io.to(roomId).except(socket.id).emit("webrtc:answer", { answer });
    });

    socket.on("webrtc:ice-candidate", ({ roomId, candidate }) => {
      const room = rooms.get(roomId);
      if (!room || (room.a !== userId && room.b !== userId)) {
        return;
      }
      // 상대방에게 ICE candidate 전달
      io.to(roomId).except(socket.id).emit("webrtc:ice-candidate", { candidate });
    });

    // 궁합도 표시/숨김 토글
    socket.on("compatibility:toggle", ({ roomId, visible }, cb) => {
      let rid = roomId;
      let pair = rooms.get(rid) || null;
      if (!pair) {
        for (const [r, p] of rooms) {
          if (p.a === userId || p.b === userId) { pair = p; rid = r; break; }
        }
      }
      if (!pair || (pair.a !== userId && pair.b !== userId)) {
        return cb?.({ ok: false, error: "room_not_found" });
      }
      
      pair.compatibilityVisible = visible;
      rooms.set(rid, pair);
      
      // 양쪽 사용자에게 상태 동기화
      io.to(rid).emit("compatibility:visibility", { visible });
      console.log(`[compatibility] toggle user=${userId} roomId=${rid} visible=${visible}`);
      cb?.({ ok: true });
    });

    socket.on("disconnect", () => { cleanupUser(userId); });
  });

  return io;
};


