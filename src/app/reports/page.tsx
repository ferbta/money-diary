"use client";

import React from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import Card from "@/components/ui/Card";
import { BarChart3, PieChart as PieChartIcon, TrendingUp, TrendingDown, Layers, ChevronLeft, ChevronRight, Calendar, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import CategoryReportModal from "@/components/CategoryReportModal";
import TransactionList from "@/components/TransactionList";
import { TransactionWithCategoryAndReceipts } from "@/lib/types";
import { Chart as ChartEvent, getElementAtEvent } from "react-chartjs-2";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const ReportsPage = () => {
    const [reportData, setReportData] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [viewMode, setViewMode] = React.useState<"month" | "year">("month");
    const [month, setMonth] = React.useState(new Date().getMonth() + 1);
    const [year, setYear] = React.useState(new Date().getFullYear());

    // Drill-down Modal State
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [modalTitle, setModalTitle] = React.useState("");
    const [drilledTransactions, setDrilledTransactions] = React.useState<TransactionWithCategoryAndReceipts[]>([]);
    const [isFetchingDrill, setIsFetchingDrill] = React.useState(false);

    const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);

    const barChartRef = React.useRef<any>(null);
    const pieChartRef = React.useRef<any>(null);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    React.useEffect(() => {
        const fetchReport = async () => {
            try {
                setIsLoading(true);
                const queryParams = new URLSearchParams();
                if (viewMode === "month") queryParams.append("month", month.toString());
                queryParams.append("year", year.toString());

                const response = await fetch(`/api/reports?${queryParams.toString()}`);
                const data = await response.json();
                setReportData(data);
            } catch (err) {
                console.error("Failed to fetch report:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReport();
    }, [month, year, viewMode]);

    const handlePrev = () => {
        if (viewMode === "month") {
            if (month === 1) {
                setMonth(12);
                setYear(prev => prev - 1);
            } else {
                setMonth(prev => prev - 1);
            }
        } else {
            setYear(prev => prev - 1);
        }
    };

    const handleNext = () => {
        if (viewMode === "month") {
            if (month === 12) {
                setMonth(1);
                setYear(prev => prev + 1);
            } else {
                setMonth(prev => prev + 1);
            }
        } else {
            setYear(prev => prev + 1);
        }
    };

    const handleDrillDown = async (params: { type?: string, categoryId?: string, month?: number, title: string }) => {
        setModalTitle(params.title);
        setIsModalOpen(true);
        setIsFetchingDrill(true);
        try {
            const queryParams = new URLSearchParams();
            if (params.type) queryParams.append("type", params.type);
            if (params.categoryId) queryParams.append("categoryId", params.categoryId);

            // If drilling by month in a yearly view, use the clicked month
            const drillMonth = params.month || (viewMode === "month" ? month : undefined);
            const drillYear = year;

            if (drillMonth) queryParams.append("month", drillMonth.toString());
            queryParams.append("year", drillYear.toString());

            const response = await fetch(`/api/transactions?${queryParams.toString()}`);
            const data = await response.json();
            setDrilledTransactions(data);
        } catch (err) {
            console.error("Drill-down failed:", err);
        } finally {
            setIsFetchingDrill(false);
        }
    };

    const onBarClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const { current: chart } = barChartRef;
        if (!chart) return;

        const element = getElementAtEvent(chart, event);
        if (!element.length) return;

        const { index } = element[0];
        const dataPoint = reportData.monthlyTrend[index];

        handleDrillDown({
            month: parseInt(dataPoint.month),
            title: `Giao dịch Tháng ${dataPoint.month} năm ${year}`
        });
    };

    const onPieClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const { current: chart } = pieChartRef;
        if (!chart) return;

        const element = getElementAtEvent(chart, event);
        if (!element.length) return;

        const { index } = element[0];
        const category = reportData.categoryBreakdown[index];

        handleDrillDown({
            type: "EXPENSE",
            categoryId: category.id,
            title: `Chi tiêu: ${category.category}`
        });
    };

    const barChartData = {
        labels: reportData?.monthlyTrend?.map((d: any) => `Tháng ${d.month}`) || [],
        datasets: [
            {
                label: "Thu nhập",
                data: reportData?.monthlyTrend?.map((d: any) => d.income) || [],
                backgroundColor: "rgba(16, 185, 129, 0.6)",
                borderColor: "rgb(16, 185, 129)",
                borderWidth: 1,
                borderRadius: 8,
            },
            {
                label: "Chi phí",
                data: reportData?.monthlyTrend?.map((d: any) => d.expense) || [],
                backgroundColor: "rgba(244, 63, 94, 0.6)",
                borderColor: "rgb(244, 63, 94)",
                borderWidth: 1,
                borderRadius: 8,
            },
        ],
    };

    const pieChartData = {
        labels: reportData?.categoryBreakdown?.map((c: any) => c.category) || [],
        datasets: [
            {
                data: reportData?.categoryBreakdown?.map((c: any) => c.amount) || [],
                backgroundColor: [
                    "rgba(59, 130, 246, 0.8)",
                    "rgba(139, 92, 246, 0.8)",
                    "rgba(236, 72, 153, 0.8)",
                    "rgba(245, 158, 11, 0.8)",
                    "rgba(16, 185, 129, 0.8)",
                    "rgba(107, 114, 128, 0.8)",
                ],
                borderColor: "rgba(15, 23, 42, 1)",
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom" as const,
                labels: { color: "#94a3b8", font: { weight: "bold" as any, size: 10 } },
            },
        },
        scales: {
            y: { grid: { color: "rgba(30, 41, 59, 0.5)" }, ticks: { color: "#64748b" } },
            x: { grid: { display: false }, ticks: { color: "#64748b" } },
        },
    };

    const totalIncome = reportData?.monthlyTrend?.reduce((sum: number, d: any) => sum + d.income, 0) || 0;
    const totalExpense = reportData?.monthlyTrend?.reduce((sum: number, d: any) => sum + d.expense, 0) || 0;

    return (
        <div className="max-w-7xl mx-auto w-full space-y-8 pb-20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Báo Cáo Tài Chính</h1>
                    <p className="text-slate-400 text-sm md:text-base mt-1 italic">Phân tích thói quen chi tiêu và thu nhập của bạn</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* View Mode Toggle */}
                        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-2xl">
                            <button
                                onClick={() => setViewMode("month")}
                                className={cn(
                                    "px-4 py-2 text-xs font-bold rounded-xl transition-all",
                                    viewMode === "month" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-slate-500 hover:text-slate-400"
                                )}
                            >
                                Tháng
                            </button>
                            <button
                                onClick={() => setViewMode("year")}
                                className={cn(
                                    "px-4 py-2 text-xs font-bold rounded-xl transition-all",
                                    viewMode === "year" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-slate-500 hover:text-slate-400"
                                )}
                            >
                                Năm
                            </button>
                        </div>

                        <button
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-xs font-bold whitespace-nowrap"
                        >
                            <Layers size={16} className="text-blue-500" />
                            Theo danh mục
                        </button>
                    </div>

                    {/* Period Navigator */}
                    <div className="flex items-center justify-between w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-2 py-1">
                        <button
                            onClick={handlePrev}
                            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all border border-transparent hover:border-slate-700"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center gap-2 px-2">
                            <Calendar size={18} className="text-blue-500" />
                            <span className="text-lg font-black text-white min-w-[140px] text-center">
                                {viewMode === "month" ? `Tháng ${month.toString().padStart(2, '0')} ${year}` : `Năm ${year}`}
                            </span>
                        </div>
                        <button
                            onClick={handleNext}
                            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all border border-transparent hover:border-slate-700"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <button
                    onClick={() => handleDrillDown({ type: "INCOME", title: `Thu nhập: ${viewMode === "month" ? `Tháng ${month}/${year}` : `Năm ${year}`}` })}
                    className="text-left w-full h-full"
                >
                    <Card className="h-full border-none bg-emerald-500/10 hover:bg-emerald-500/20 transition-all group cursor-pointer active:scale-95">
                        <TrendingUp size={32} className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-600 mb-1">Thu nhập giai đoạn</p>
                        <p className="text-2xl md:text-3xl font-black text-white">{totalIncome.toLocaleString("vi-VN")}₫</p>
                    </Card>
                </button>
                <button
                    onClick={() => handleDrillDown({ type: "EXPENSE", title: `Chi phí: ${viewMode === "month" ? `Tháng ${month}/${year}` : `Năm ${year}`}` })}
                    className="text-left w-full h-full"
                >
                    <Card className="h-full border-none bg-rose-500/10 hover:bg-rose-500/20 transition-all group cursor-pointer active:scale-95">
                        <TrendingDown size={32} className="text-rose-500 mb-4 group-hover:scale-110 transition-transform" />
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-rose-600 mb-1">Chi phí giai đoạn</p>
                        <p className="text-2xl md:text-3xl font-black text-white">{totalExpense.toLocaleString("vi-VN")}₫</p>
                    </Card>
                </button>
                <Card className="border-none bg-blue-500/10 hover:bg-blue-500/20 transition-all group">
                    <BarChart3 size={32} className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-blue-600 mb-1">Tiền tiết kiệm</p>
                    <p className="text-2xl md:text-3xl font-black text-white">{(totalIncome - totalExpense).toLocaleString("vi-VN")}₫</p>
                </Card>
                <Card className="border-none bg-indigo-500/10 hover:bg-indigo-500/20 transition-all group">
                    <Layers size={32} className="text-indigo-500 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-indigo-600 mb-1">Tỷ lệ tiết kiệm</p>
                    <p className="text-2xl md:text-3xl font-black text-white">
                        {totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0}%
                    </p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                <div className="lg:col-span-8">
                    <Card className="h-[500px] md:h-[600px] flex flex-col p-4 md:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                                <BarChart3 size={20} className="text-blue-500" />
                                Xu hướng hàng tháng
                            </h3>
                            <span className="w-fit text-[10px] font-bold text-slate-500 px-3 py-1 bg-slate-900 rounded-full border border-slate-800 italic">Thu nhập vs Chi phí</span>
                        </div>
                        <div className="flex-1 w-full relative">
                            {isLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <LoadingSpinner size={32} />
                                </div>
                            ) : (
                                <Bar
                                    ref={barChartRef}
                                    data={barChartData}
                                    options={chartOptions}
                                    onClick={onBarClick}
                                />
                            )}
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-4">
                    <Card className="h-[500px] md:h-[600px] flex flex-col p-4 md:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                                <PieChartIcon size={20} className="text-indigo-500" />
                                Phân bổ chi tiêu
                            </h3>
                            <span className="w-fit text-[10px] font-bold text-slate-500 px-3 py-1 bg-slate-900 rounded-full border border-slate-800 italic">Theo danh mục</span>
                        </div>
                        <div className="flex-1 w-full relative">
                            {isLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <LoadingSpinner size={32} />
                                </div>
                            ) : (
                                <Pie
                                    ref={pieChartRef}
                                    data={pieChartData}
                                    options={{
                                        ...chartOptions,
                                        scales: undefined,
                                        plugins: {
                                            ...chartOptions.plugins,
                                            legend: {
                                                ...chartOptions.plugins?.legend,
                                                display: !isMobile
                                            }
                                        }
                                    }}
                                    onClick={onPieClick}
                                />
                            )}
                        </div>

                        {/* Custom Legend for Mobile */}
                        {isMobile && reportData?.categoryBreakdown && (
                            <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-3 max-h-[160px] overflow-y-auto px-2 custom-scrollbar border-t border-slate-800/50 pt-4">
                                {reportData.categoryBreakdown.map((category: any, index: number) => (
                                    <button
                                        key={category.id}
                                        onClick={() => handleDrillDown({
                                            type: "EXPENSE",
                                            categoryId: category.id,
                                            title: `Chi tiêu: ${category.category}`
                                        })}
                                        className="flex items-center gap-2 group transition-all active:scale-95 bg-slate-900/40 px-2 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700"
                                    >
                                        <div
                                            className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm"
                                            style={{ backgroundColor: pieChartData.datasets[0].backgroundColor[index % pieChartData.datasets[0].backgroundColor.length] }}
                                        />
                                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors">
                                            {category.category}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Drill-down Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalTitle}
                maxWidth="3xl"
            >
                {isFetchingDrill ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <div className="w-12 h-12 bg-slate-800 rounded-full mb-4" />
                        <div className="h-4 w-32 bg-slate-800 rounded mb-2" />
                    </div>
                ) : (
                    <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {drilledTransactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-500 italic">
                                <Info size={48} className="opacity-20 mb-4" />
                                <p>Không có giao dịch nào trong giai đoạn này</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
                                            <TrendingUp size={16} />
                                        </div>
                                        <span className="text-sm font-bold text-blue-400 uppercase tracking-tight">Tổng cộng</span>
                                    </div>
                                    <span className="text-xl md:text-2xl font-black text-white">
                                        {drilledTransactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString("vi-VN")}₫
                                    </span>
                                </div>
                                <TransactionList transactions={drilledTransactions} isMobile={isMobile} />
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Category Report Modal */}
            <CategoryReportModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
            />
        </div>
    );
};

export default ReportsPage;
