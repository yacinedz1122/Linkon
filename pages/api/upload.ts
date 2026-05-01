import { uploadBase64Media } from "../../lib/cloudinary";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { dataUrl } = req.body;
  if (!dataUrl) return res.status(400).json({ error: "No dataUrl" });
  try {
    const result = await uploadBase64Media(dataUrl);
    return res.json({ url: result.secure_url, resource_type: result.resource_type });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Upload failed" });
  }
}
