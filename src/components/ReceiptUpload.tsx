"use client";

import React from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";



interface ReceiptUploadProps {
    onUpload: (publicIds: string[]) => void;
    initialPublicIds?: string[];
}

const ReceiptUpload: React.FC<ReceiptUploadProps> = ({ onUpload, initialPublicIds = [] }) => {
    const [files, setFiles] = React.useState<{ file: File; preview: string }[]>([]);
    const [isUploading, setIsUploading] = React.useState(false);
    const [uploadedIds, setUploadedIds] = React.useState<string[]>(initialPublicIds);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map((file) => ({
                file,
                preview: URL.createObjectURL(file),
            }));
            setFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles((prev) => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[index].preview);
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const uploadFiles = async () => {
        if (files.length === 0) return;

        setIsUploading(true);
        try {
            const uploadPromises = files.map(async ({ file }) => {
                const reader = new FileReader();
                return new Promise<string>((resolve, reject) => {
                    reader.onload = async () => {
                        try {
                            // In a production app, we might upload to a specific API endpoint that uses the cloudinary utility
                            // For now, we'll mock the process or assume an API exists
                            const base64 = reader.result as string;
                            // Since we don't have a direct client-side cloudinary upload without a preset/signing, 
                            // we should send to our internal API
                            const resp = await fetch("/api/upload", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ file: base64 })
                            });
                            const data = await resp.json();
                            if (data.public_id) resolve(data.public_id);
                            else reject("Upload failed");
                        } catch (err) {
                            reject(err);
                        }
                    };
                    reader.readAsDataURL(file);
                });
            });

            const publicIds = await Promise.all(uploadPromises);
            const allIds = [...uploadedIds, ...publicIds];
            setUploadedIds(allIds);
            onUpload(allIds);
            setFiles([]); // Clear previews after success
        } catch (error) {
            console.error("Upload error:", error);
            alert("Tải ảnh lên thất bại");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
                {/* Existing / Uploaded Previews */}
                {uploadedIds.map((id, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 group">
                        <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                            <ImageIcon size={20} className="text-emerald-500" />
                        </div>
                        <div className="absolute top-1 right-1 p-1 bg-slate-950/80 rounded-full text-white cursor-pointer" onClick={() => {
                            const newIds = uploadedIds.filter((_, i) => i !== idx);
                            setUploadedIds(newIds);
                            onUpload(newIds);
                        }}>
                            <X size={12} />
                        </div>
                    </div>
                ))}

                {/* New Selected Previews */}
                {files.map((f, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-700 shadow-xl group">
                        <img src={f.preview} alt="preview" className="w-full h-full object-cover" />
                        <button
                            onClick={() => removeFile(idx)}
                            className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-rose-500 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}

                {/* Upload Trigger */}
                <label className="w-24 h-24 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer group">
                    <Upload size={24} className="text-slate-600 group-hover:text-blue-500 mb-2" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Đính kèm</span>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                </label>
            </div>

            {files.length > 0 && (
                <button
                    onClick={uploadFiles}
                    disabled={isUploading}
                    className="w-full py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-all disabled:opacity-50"
                >
                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                    {isUploading ? "Đang tải lên..." : `Tải lên ${files.length} hóa đơn`}
                </button>
            )}
        </div>
    );
};

export default ReceiptUpload;
