import React from "react";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const ICON_OPTIONS = [
    "Tag", "ShoppingCart", "Utensils", "Bus", "Home", "Wine", "Coffee", "Gamepad",
    "GraduationCap", "Hospital", "Briefcase", "Dumbbell", "Plug", "Tv", "Smartphone",
    "Umbrella", "Smile", "Heart", "Star", "Flame", "Zap", "Music", "Camera", "Languages", "Fuel",
    "Wallet", "CreditCard", "PiggyBank", "Banknote", "TrendingUp", "Trophy", "Gift", "Plane", "Baby",
    "Zap", "Droplet", "HouseWifi", "Signal", "ShoppingBag"
];

interface IconPickerProps {
    value: string;
    onChange: (value: string) => void;
}

export const IconRenderer = ({ name, className, size = 18 }: { name: string, className?: string, size?: number }) => {
    const IconComponent = (Icons as any)[name] as LucideIcon | undefined;
    const props = {
        className: cn(className, "flex-shrink-0"),
        size,
        style: { minWidth: size, minHeight: size }
    };
    if (!IconComponent) return <Icons.Tag {...props} />;
    return <IconComponent {...props} />;
};

const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Chọn biểu tượng</label>
            <div className="grid grid-cols-5 gap-2 p-3 bg-slate-900/50 border border-slate-800 rounded-xl max-h-48 overflow-y-auto custom-scrollbar">
                {ICON_OPTIONS.map((iconName) => (
                    <button
                        key={iconName}
                        type="button"
                        onClick={() => onChange(iconName)}
                        className={cn(
                            "p-2 rounded-lg transition-all flex items-center justify-center hover:scale-110 active:scale-95",
                            value === iconName
                                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        )}
                    >
                        <IconRenderer name={iconName} size={24} />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default IconPicker;
