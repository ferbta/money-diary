import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="block text-sm font-medium text-slate-300 ml-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50",
                        error ? "border-rose-500 focus:ring-rose-500" : "hover:border-slate-700",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-rose-500 text-xs ml-1 font-medium">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
