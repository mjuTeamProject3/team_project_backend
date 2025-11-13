import { writeFile, readFile, mkdir } from "fs/promises";
import { dirname, join } from "path";

// Use public/ directly to avoid conflicts with an existing file named "temp"
const REPORTS_PATH = join(process.cwd(), "public", "reports.json");

async function ensureFile() {
  try {
    const txt = await readFile(REPORTS_PATH, "utf8");
    try { JSON.parse(txt || "[]"); } catch { await writeFile(REPORTS_PATH, "[]", "utf8"); }
  } catch {
    await mkdir(dirname(REPORTS_PATH), { recursive: true });
    await writeFile(REPORTS_PATH, "[]", "utf8");
  }
}

export const saveReport = async ({ reporterUserId, targetUserId, targetUsername, roomId, reason }) => {
  await ensureFile();
  let list = [];
  try {
    const raw = await readFile(REPORTS_PATH, "utf8");
    list = JSON.parse(raw || "[]");
    if (!Array.isArray(list)) list = [];
  } catch {
    list = [];
  }
  const item = {
    id: `r_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    reporterUserId,
    targetUserId,
    targetUsername,
    roomId,
    reason,
    createdAt: new Date().toISOString(),
  };
  list.push(item);
  await writeFile(REPORTS_PATH, JSON.stringify(list, null, 2), "utf8");
  return item;
};


