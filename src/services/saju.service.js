import { prisma } from "../configs/db.config.js";

// Fetch compatibility score from external Python microservice
export const getCompatibilityScore = async ({ userIdA, userIdB }) => {
  const a = await prisma.user.findUnique({ where: { id: userIdA } });
  const b = await prisma.user.findUnique({ where: { id: userIdB } });
  if (!a || !b) return { score: null, verdict: null };

  const url = process.env.SAJU_API_URL?.replace(/\/$/, "");
  if (!url) return { score: null, verdict: null };

  try {
    const payload = {
      a: {
        gender: a.gender || null,
        birthdate: a.birthdate ? new Date(a.birthdate).toISOString() : null,
        sajuKeywords: a.sajuKeywords || null,
      },
      b: {
        gender: b.gender || null,
        birthdate: b.birthdate ? new Date(b.birthdate).toISOString() : null,
        sajuKeywords: b.sajuKeywords || null,
      },
    };
    const res = await fetch(`${url}/compatibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`saju api ${res.status}`);
    const data = await res.json();
    // Expect: { score: number(0-100), verdict: string }
    return { score: data.score ?? null, verdict: data.verdict ?? null };
  } catch (e) {
    console.error("saju api error", e.message);
    return { score: null, verdict: null };
  }
};

// Placeholder: later call external Python API, then persist result
export const saveSajuKeywords = async ({ userId, sajuKeywords }) => {
  await prisma.user.update({ where: { id: userId }, data: { sajuKeywords } });
  return {};
};


