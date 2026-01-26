import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (fileStr: string) => {
    try {
        const uploadResponse = await cloudinary.uploader.upload(fileStr, {
            upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
            folder: "finance-receipts",
        });
        return uploadResponse.public_id;
    } catch (error: any) {
        console.error("Cloudinary upload error:", error);
        throw new Error(error.message || "Failed to upload image to Cloudinary");
    }
};

export const deleteImage = async (publicId: string) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        throw new Error("Failed to delete image from Cloudinary");
    }
};

export default cloudinary;
