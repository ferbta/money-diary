import React from "react";
import Navigation from "./Navigation";

interface AppLayoutProps {
    children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
            <Navigation />
            <main className="flex-1 p-4 lg:p-8 overflow-hidden h-screen flex flex-col">
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AppLayout;
