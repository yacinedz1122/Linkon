import { getServerSession } from "next-auth/next";
import type { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "./auth/[...nextauth]";
import { prisma } from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as any);
  if (!session?.user?.email) return res.status(401).json({ error: "Not authenticated" });

  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me || me.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });

  if (req.method === "POST") {
    const { action, userId } = req.body;
    if (!action || !userId) return res.status(400).json({ error: "Missing params" });

    if (action === "mute") {
      await prisma.user.update({ where: { id: userId }, data: { isMuted: true } });
      return res.json({ ok: true });
    } else if (action === "unmute") {
      await prisma.user.update({ where: { id: userId }, data: { isMuted: false } });
      return res.json({ ok: true });
    } else if (action === "ban") {
      await prisma.user.update({ where: { id: userId }, data: { isBanned: true } });
      return res.json({ ok: true });
    } else if (action === "unban") {
      await prisma.user.update({ where: { id: userId }, data: { isBanned: false } });
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: "Unknown action" });
  }

  return res.status(405).end();
}
