"use client";

import React from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    isSameMonth
} from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CalendarProps {
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
    highlightedDates?: Date[];
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, highlightedDates = [] }) => {
    const [currentMonth, setCurrentMonth] = React.useState(new Date());

    const days = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth)),
        end: endOfWeek(endOfMonth(currentMonth)),
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    return (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white px-2 capitalize">
                    {format(currentMonth, "MMMM yyyy", { locale: vi })}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors border border-slate-800"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors border border-slate-800"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider py-2">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                    const isHighlighted = highlightedDates.some((d) => isSameDay(d, day));
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, currentMonth);

                    return (
                        <button
                            key={idx}
                            onClick={() => onDateSelect(day)}
                            className={cn(
                                "relative aspect-square flex flex-col items-center justify-center rounded-2xl transition-all duration-200 group",
                                !isCurrentMonth ? "text-slate-700 hover:text-slate-600" : "text-slate-300 hover:bg-slate-800",
                                isSelected && "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/40 scale-105 z-10",
                                !isSelected && isHighlighted && "bg-blue-600/10 text-blue-400 font-bold"
                            )}
                        >
                            <span className="text-sm z-10">{format(day, "d")}</span>
                            {isHighlighted && !isSelected && (
                                <div className="absolute bottom-2 w-1 h-1 bg-blue-500 rounded-full" />
                            )}
                            {isSameDay(day, new Date()) && !isSelected && (
                                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full" title="Hôm nay" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Calendar;
