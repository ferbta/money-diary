"use client";

import React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";
import Modal from "./Modal";
import Calendar from "../Calendar";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DatePickerProps {
    label?: string;
    value: string; // ISO date string (YYYY-MM-DD)
    onChange: (date: string) => void;
    error?: string;
    required?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({ label, value, onChange, error }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const selectedDate = value ? new Date(value) : new Date();

    const handleDateSelect = (date: Date) => {
        onChange(format(date, "yyyy-MM-dd"));
        setIsOpen(false);
    };

    return (
        <div className="w-full space-y-2">
            {label && (
                <label className="block text-sm font-medium text-slate-300 ml-1">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className={cn(
                    "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-left text-white flex items-center justify-between transition-all hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 box-border",
                    error && "border-rose-500 focus:ring-rose-500",
                    !value && "text-slate-500"
                )}
            >
                <span className="font-medium">
                    {value ? format(selectedDate, "dd MMMM, yyyy", { locale: vi }) : "Chọn ngày"}
                </span>
                <CalendarIcon size={18} className="text-slate-500" />
            </button>

            {error && (
                <p className="text-rose-500 text-xs ml-1 font-medium">{error}</p>
            )}

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                maxWidth="sm"
            >
                <div className="relative pt-12 pb-2">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm"
                    >
                        <X size={20} />
                    </button>
                    <Calendar
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                        className="bg-transparent border-none shadow-none p-4"
                    />
                </div>
            </Modal>
        </div>
    );
};

export default DatePicker;
