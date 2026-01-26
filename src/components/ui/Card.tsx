import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
    footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className, title, subtitle, footer }) => {
    return (
        <div className={cn(
            "bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-xl",
            className
        )}>
            {(title || subtitle) && (
                <div className="px-6 py-5 border-b border-slate-800">
                    {title && <h3 className="text-xl font-semibold text-white">{title}</h3>}
                    {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
            {footer && (
                <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;
