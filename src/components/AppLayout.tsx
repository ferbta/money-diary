import React from "react";
import Navigation from "./Navigation";

interface AppLayoutProps {
    children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 overflow-x-hidden">
            <Navigation />
            <main className="w-full p-4 lg:p-8 pb-32 lg:pb-8">
                <div className="max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AppLayout;
