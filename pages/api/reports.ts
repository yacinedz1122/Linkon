import { getServerSession } from "next-auth/next";
import type { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "./auth/[...nextauth]";
import { prisma } from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as any);
  if (!session?.user?.email) return res.status(401).json({ error: "Not authenticated" });

  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return res.status(401).json({ error: "User not found" });

  if (req.method === "POST") {
    const { postId, commentId, reason } = req.body;
    if (!reason) return res.status(400).json({ error: "Reason required" });

    const report = await prisma.report.create({
      data: { reporterId: me.id, postId: postId || null, commentId: commentId || null, reason }
    });
    return res.status(201).json(report);
  }

  if (req.method === "GET") {
    if (me.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: { reporter: true, post: { include: { author: true } }, comment: true }
    });
    return res.json(reports);
  }

  return res.status(405).end();
}
