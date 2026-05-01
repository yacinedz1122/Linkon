import { getServerSession } from "next-auth/next";
import type { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "./auth/[...nextauth]";
import { prisma } from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: true, likes: true, comments: { include: { author: true } } }
    });
    return res.json(posts);
  }

  if (req.method === "POST") {
    const session = await getServerSession(req, res, authOptions as any);
    if (!session?.user?.email) return res.status(401).json({ error: "Not authenticated" });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return res.status(401).json({ error: "User not found" });
    if (user.isBanned) return res.status(403).json({ error: "You are banned" });
    if (user.isMuted) return res.status(403).json({ error: "You are muted" });

    const { imageUrl, caption, mediaType } = req.body;
    if (!imageUrl) return res.status(400).json({ error: "Missing imageUrl" });

    const post = await prisma.post.create({
      data: { imageUrl, caption, mediaType: mediaType || "IMAGE", authorId: user.id }
    });
    return res.status(201).json(post);
  }

  return res.status(405).end();
}
