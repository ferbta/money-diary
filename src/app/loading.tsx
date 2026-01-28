import React from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function Loading() {
    return (
        <div className="flex items-center justify-center h-screen w-full bg-slate-950">
            <div className="flex flex-col items-center gap-4">
                <LoadingSpinner size={48} />
                <p className="text-slate-400 text-sm animate-pulse">Đang tải...</p>
            </div>
        </div>
    );
}
