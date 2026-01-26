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
import Select from "@/components/ui/Select";
import { BarChart3, PieChart as PieChartIcon, TrendingUp, TrendingDown, Layers } from "lucide-react";

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
    const [month, setMonth] = React.useState(new Date().getMonth() + 1);
    const [year, setYear] = React.useState(new Date().getFullYear());

    React.useEffect(() => {
        const fetchReport = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/reports?month=${month}&year=${year}`);
                const data = await response.json();
                setReportData(data);
            } catch (err) {
                console.error("Failed to fetch report:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReport();
    }, [month, year]);

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Báo Cáo Tài Chính</h1>
                    <p className="text-slate-400 mt-1">Phân tích sâu về thói quen chi tiêu và tăng trưởng thu nhập của bạn</p>
                </div>
                <div className="flex gap-3">
                    <Select
                        value={month}
                        onChange={(e) => setMonth(parseInt(e.target.value))}
                        options={[
                            { label: "Tháng 1", value: 1 }, { label: "Tháng 2", value: 2 },
                            { label: "Tháng 3", value: 3 }, { label: "Tháng 4", value: 4 },
                            { label: "Tháng 5", value: 5 }, { label: "Tháng 6", value: 6 },
                            { label: "Tháng 7", value: 7 }, { label: "Tháng 8", value: 8 },
                            { label: "Tháng 9", value: 9 }, { label: "Tháng 10", value: 10 },
                            { label: "Tháng 11", value: 11 }, { label: "Tháng 12", value: 12 },
                        ]}
                        className="w-40"
                    />
                    <Select
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        options={[
                            { label: "2024", value: 2024 },
                            { label: "2025", value: 2025 },
                            { label: "2026", value: 2026 },
                        ]}
                        className="w-32"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="md:col-span-1 border-none bg-emerald-500/10 hover:bg-emerald-500/20 transition-all group">
                    <TrendingUp size={32} className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-1">Thu nhập giai đoạn</p>
                    <p className="text-3xl font-black text-white">{totalIncome.toLocaleString("vi-VN")}₫</p>
                </Card>
                <Card className="md:col-span-1 border-none bg-rose-500/10 hover:bg-rose-500/20 transition-all group">
                    <TrendingDown size={32} className="text-rose-500 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-black uppercase tracking-widest text-rose-600 mb-1">Chi phí giai đoạn</p>
                    <p className="text-3xl font-black text-white">{totalExpense.toLocaleString("vi-VN")}₫</p>
                </Card>
                <Card className="md:col-span-1 border-none bg-blue-500/10 hover:bg-blue-500/20 transition-all group">
                    <BarChart3 size={32} className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1">Tiền tiết kiệm</p>
                    <p className="text-3xl font-black text-white">{(totalIncome - totalExpense).toLocaleString("vi-VN")}₫</p>
                </Card>
                <Card className="md:col-span-1 border-none bg-indigo-500/10 hover:bg-indigo-500/20 transition-all group">
                    <Layers size={32} className="text-indigo-500 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-1">Tỷ lệ tiết kiệm</p>
                    <p className="text-3xl font-black text-white">
                        {totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0}%
                    </p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    <Card className="h-[500px] flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <BarChart3 size={20} className="text-blue-500" />
                                Xu hướng hàng tháng
                            </h3>
                            <span className="text-xs font-bold text-slate-500 px-3 py-1 bg-slate-900 rounded-full border border-slate-800 italic">Thu nhập vs Chi phí</span>
                        </div>
                        <div className="flex-1 w-full relative">
                            {isLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-600 italic">Đang tải dữ liệu biểu đồ...</div>
                            ) : (
                                <Bar data={barChartData} options={chartOptions} />
                            )}
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-4">
                    <Card className="h-[500px] flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <PieChartIcon size={20} className="text-indigo-500" />
                                Phân bổ chi tiêu
                            </h3>
                            <span className="text-xs font-bold text-slate-500 px-3 py-1 bg-slate-900 rounded-full border border-slate-800 italic">Theo danh mục</span>
                        </div>
                        <div className="flex-1 w-full relative">
                            {isLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-600 italic">Đang tải dữ liệu biểu đồ...</div>
                            ) : (
                                <Pie data={pieChartData} options={{ ...chartOptions, scales: undefined }} />
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
