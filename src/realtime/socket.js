import { Server } from "socket.io";
import { verifyJwt } from "../utils/jwt.util.js";
import { getCompatibilityScore } from "../services/saju.service.js";
import { suggestTopics } from "../services/topic.service.js";
import { saveReport } from "../services/report.service.js";
import { prisma } from "../configs/db.config.js";

// In-memory state (single instance server)
const userIdToSocket = new Map();
const socketIdToUser = new Map();
const waitingQueue = []; // array of userIds
const rooms = new Map(); // roomId -> { a: userId, b: userId, topicsSuggested?: boolean }

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
    // Remove from queue
    const idx = waitingQueue.indexOf(userId);
    if (idx >= 0) waitingQueue.splice(idx, 1);
    // End rooms containing this user
    for (const [roomId, pair] of rooms) {
      if (pair.a === userId || pair.b === userId) {
        io.to(roomId).emit("chat:ended", { reason: "disconnect" });
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

    // Debug: log incoming event names to trace wires
    socket.onAny((event) => {
      if (event !== "message:send") {
        console.log(`[onAny] user=${userId} event=${event}`);
      }
    });

    socket.on("queue:join", async () => {
      console.log(`[queue] join user=${userId}`);
      if (!waitingQueue.includes(userId)) waitingQueue.push(userId);
      // Try match
      if (waitingQueue.length >= 2) {
        const a = waitingQueue.shift();
        const b = waitingQueue.shift();
        const roomId = makeRoomId(a, b);
        rooms.set(roomId, { a, b });
        console.log(`[match] room=${roomId} a=${a} b=${b}`);
        const saju = await getCompatibilityScore({ userIdA: a, userIdB: b });
        // Load usernames to store in room metadata for reporting convenience
        let aUser = null, bUser = null;
        try {
          aUser = await prisma.user.findUnique({ where: { id: a }, select: { username: true } });
          bUser = await prisma.user.findUnique({ where: { id: b }, select: { username: true } });
        } catch {}

        const sa = userIdToSocket.get(a);
        const sb = userIdToSocket.get(b);
        sa?.join(roomId);
        sb?.join(roomId);
        const payloadA = { roomId, partnerId: b, partnerUsername: bUser?.username || null, compatibility: saju };
        const payloadB = { roomId, partnerId: a, partnerUsername: aUser?.username || null, compatibility: saju };
        sa?.emit("match:found", payloadA);
        sb?.emit("match:found", payloadB);
      } else {
        socket.emit("queue:waiting", { position: waitingQueue.indexOf(userId) + 1 });
      }
    });

    socket.on("message:send", ({ roomId, text }) => {
      if (!rooms.has(roomId)) return;
      io.to(roomId).emit("message:new", { userId, text, ts: Date.now() });
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
      // Last-resort: derive room from socket.rooms (excluding its own id)
      if (!pair) {
        for (const r of socket.rooms) {
          if (r !== socket.id && rooms.has(r)) { pair = rooms.get(r); rid = r; break; }
        }
      }
      if (!pair) { cb && cb({ ok: false, error: "room_not_found" }); return; }
      // Notify first, then remove participants from the room, then clean state
      io.to(rid).emit("chat:ended", { reason: reason || "ended" });
      const socketsInRoom = new Set(io.of("/").adapter.rooms.get(rid) || []);
      for (const s of socketsInRoom) {
        const client = io.sockets.sockets.get(s);
        client?.leave(rid);
      }
      rooms.delete(rid);
      console.log(`[end] closed room=${rid}`);
      cb && cb({ ok: true });
    });

    socket.on("user:report", async ({ roomId, reason }) => {
      try {
        console.log(`[report] by user=${userId} roomId=${roomId||"?"}`);
        if (!reason) {
          socket.emit("user:reported", { ok: false, error: "신고 사유가 필요합니다." });
          return;
        }
        // find room and partner to restrict reporting to the other participant
        let rid = roomId;
        let pair = rooms.get(rid) || null;
        if (!pair) {
          for (const [r, p] of rooms) {
            if (p.a === userId || p.b === userId) { pair = p; rid = r; break; }
          }
        }
        if (!pair) { socket.emit("user:reported", { ok:false, error:"방 정보를 찾을 수 없습니다."}); return; }
        const targetUserId = pair.a === userId ? pair.b : pair.a;
        const target = await prisma.user.findUnique({ where: { id: targetUserId } });
        const targetUsername = target?.username || null;

        await saveReport({
          reporterUserId: userId,
          targetUserId,
          targetUsername,
          roomId: rid,
          reason: reason || null,
        });
        socket.emit("user:reported", { ok: true });
        console.log(`[report] saved against user=${targetUserId}`);
      } catch (e) {
        console.error("user:report error", e?.message || e);
        socket.emit("user:reported", { ok: false, error: String(e?.message || e) });
      }
    });

    socket.on("topics:suggest", async ({ roomId, context }) => {
      try {
        let rid = roomId;
        let pair = rooms.get(rid) || null;
        if (!pair) {
          for (const [r, p] of rooms) {
            if (p.a === userId || p.b === userId) { pair = p; rid = r; break; }
          }
        }
        if (!pair) return;
        if (pair.topicsSuggested) {
          socket.emit("topics:already", { message: "이미 대화 주제를 추천했습니다." });
          return;
        }
        const partnerId = pair.a === userId ? pair.b : pair.a;
        const topics = await suggestTopics({ userId, partnerUserId: partnerId, context });
        pair.topicsSuggested = true;
        rooms.set(rid, pair);
        io.to(rid).emit("topics:list", { topics });
      } catch (e) {
        console.error("topics:suggest error", e?.message || e);
        socket.emit("topics:list", { topics: [] });
      }
    });

    socket.on("disconnect", () => {
      cleanupUser(userId);
    });
  });

  return io;
};


