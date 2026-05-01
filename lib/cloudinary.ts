import cloudinary from "cloudinary";

const cfgUrl = process.env.CLOUDINARY_URL || "";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || (cfgUrl.split("@")[1] || ""),
  api_key: process.env.CLOUDINARY_API_KEY || undefined,
  api_secret: process.env.CLOUDINARY_API_SECRET || undefined,
  secure: true
});

export const uploadBase64Media = async (dataUrl: string) => {
  return cloudinary.v2.uploader.upload(dataUrl, {
    folder: "mini-instagram",
    resource_type: "auto"
  });
};
