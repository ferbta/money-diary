"use client";

import React from "react";
import { FileText, FileJson, ChevronDown } from "lucide-react";
import Button from "./ui/Button";

interface DownloadDropdownProps {
    onDownloadCSV: () => void;
    onDownloadJSON: () => void;
}

const DownloadDropdown: React.FC<DownloadDropdownProps> = ({ onDownloadCSV, onDownloadJSON }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    const handleDownload = (type: "csv" | "json") => {
        if (type === "csv") {
            onDownloadCSV();
        } else {
            onDownloadJSON();
        }
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="outline"
                className="shrink-0 p-3 flex items-center gap-2"
                onClick={() => setIsOpen(!isOpen)}
            >
                <FileText size={18} />
                <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden z-10">
                    <button
                        onClick={() => handleDownload("csv")}
                        className="w-full px-4 py-3 text-left text-white hover:bg-slate-800 transition-colors flex items-center gap-3"
                    >
                        <FileText size={18} className="text-green-400" />
                        <span>Xuất CSV</span>
                    </button>
                    <button
                        onClick={() => handleDownload("json")}
                        className="w-full px-4 py-3 text-left text-white hover:bg-slate-800 transition-colors flex items-center gap-3"
                    >
                        <FileJson size={18} className="text-blue-400" />
                        <span>Xuất JSON</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default DownloadDropdown;
