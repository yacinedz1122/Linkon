import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const q = (req.query.q as string) || "";
  if (!q) return res.status(400).json({ error: "Query missing" });

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } }
      ]
    },
    select: { id: true, name: true, email: true, isMuted: true, isBanned: true }
  });

  const posts = await prisma.post.findMany({
    where: { caption: { contains: q, mode: "insensitive" } },
    include: { author: true }
  });

  return res.json({ users, posts });
}
