import { getServerSession } from "next-auth/next";
import type { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const session = await getServerSession(req, res, authOptions as any);
  if (!session?.user?.email) return res.status(401).json({ error: "Not authenticated" });

  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me || me.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });

  if (req.method === "POST") {
    const { action } = req.body;
    const report = await prisma.report.findUnique({ where: { id: id as string }, include: { post: true } });
    if (!report) return res.status(404).json({ error: "Report not found" });

    if (action === "dismiss") {
      await prisma.report.update({ where: { id: report.id }, data: { status: "dismissed" } });
      return res.json({ ok: true });
    } else if (action === "remove_post" && report.postId) {
      await prisma.post.delete({ where: { id: report.postId } });
      await prisma.report.update({ where: { id: report.id }, data: { status: "reviewed" } });
      return res.json({ ok: true });
    } else if (action === "ban_author" && report.post) {
      await prisma.user.update({ where: { id: report.post.authorId }, data: { isBanned: true } });
      await prisma.report.update({ where: { id: report.id }, data: { status: "reviewed" } });
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: "Unknown action or missing data" });
  }

  return res.status(405).end();
}
