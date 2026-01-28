"use client";

import React from "react";
import { Category, BudgetTemplateWithCategory } from "@/lib/types";
import { Settings, Save, CheckCircle2, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { numberToVietnameseWords } from "@/lib/vietnamese-words";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { IconRenderer } from "@/components/ui/IconPicker";

const BudgetTemplatesPage = () => {
    const router = useRouter();
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [templates, setTemplates] = React.useState<Map<string, number>>(new Map());
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [savedCategories, setSavedCategories] = React.useState<Set<string>>(new Set());

    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [catRes, templatesRes] = await Promise.all([
                fetch("/api/categories?type=EXPENSE"),
                fetch("/api/budget-templates")
            ]);

            if (!catRes.ok) throw new Error("Failed to fetch categories");
            if (!templatesRes.ok) throw new Error("Failed to fetch templates");

            const categoriesData: Category[] = await catRes.json();
            const templatesData: BudgetTemplateWithCategory[] = await templatesRes.json();

            setCategories(categoriesData);

            // Load existing templates into map
            const templatesMap = new Map<string, number>();
            templatesData.forEach(template => {
                templatesMap.set(template.categoryId, template.amount);
            });
            setTemplates(templatesMap);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            alert("Lỗi khi tải dữ liệu");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAmountChange = (categoryId: string, value: string) => {
        const numValue = parseFloat(value.replace(/\D/g, ""));
        if (isNaN(numValue)) {
            const newTemplates = new Map(templates);
            newTemplates.delete(categoryId);
            setTemplates(newTemplates);
        } else {
            setTemplates(new Map(templates.set(categoryId, numValue)));
        }
        // Remove from saved set when editing
        setSavedCategories(prev => {
            const newSet = new Set(prev);
            newSet.delete(categoryId);
            return newSet;
        });
    };

    const handleSaveOne = async (categoryId: string) => {
        const amount = templates.get(categoryId);
        if (!amount || amount <= 0) {
            alert("Vui lòng nhập số tiền hợp lệ");
            return;
        }

        try {
            setIsSaving(true);
            const response = await fetch("/api/budget-templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    templates: [{ categoryId, amount }]
                })
            });

            if (!response.ok) throw new Error("Failed to save template");

            setSavedCategories(prev => new Set(prev).add(categoryId));
        } catch (err) {
            console.error(err);
            alert("Lỗi khi lưu thiết lập");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAll = async () => {
        const templatesArray = Array.from(templates.entries())
            .filter(([_, amount]) => amount > 0)
            .map(([categoryId, amount]) => ({ categoryId, amount }));

        if (templatesArray.length === 0) {
            alert("Vui lòng nhập ít nhất một ngân sách");
            return;
        }

        try {
            setIsSaving(true);
            const response = await fetch("/api/budget-templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ templates: templatesArray })
            });

            if (!response.ok) throw new Error("Failed to save templates");

            alert("Đã lưu tất cả thiết lập ngân sách mặc định!");
            templatesArray.forEach(t => {
                setSavedCategories(prev => new Set(prev).add(t.categoryId));
            });
        } catch (err) {
            console.error(err);
            alert("Lỗi khi lưu thiết lập");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto w-full space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <button
                            onClick={() => router.push("/budgets")}
                            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                            Thiết Lập Ngân Sách Mặc Định
                        </h1>
                    </div>
                    <p className="text-slate-400 text-sm md:text-base ml-14 italic">
                        Đặt ngân sách tự động cho mỗi tháng
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <LoadingSpinner size={40} />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Info Card */}
                    <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-none shadow-2xl shadow-blue-900/20">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-white/10 rounded-xl text-white">
                                <Settings size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-2">Hướng dẫn</h3>
                                <p className="text-blue-100 text-sm leading-relaxed">
                                    Nhập số tiền ngân sách mặc định cho từng danh mục. Hệ thống sẽ tự động tạo ngân sách
                                    cho tháng mới dựa trên các thiết lập này.
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Categories List */}
                    <div className="space-y-3">
                        {categories.map((category) => {
                            const amount = templates.get(category.id) || 0;
                            const isSaved = savedCategories.has(category.id);

                            return (
                                <Card key={category.id} className="hover:border-blue-500/30 transition-all">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        {/* Category Info */}
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="p-2 bg-slate-800/50 rounded-xl text-blue-400">
                                                <IconRenderer name={category.icon || "Tag"} size={24} />
                                            </div>
                                            <span className="font-semibold text-white truncate">
                                                {category.name}
                                            </span>
                                        </div>

                                        {/* Amount Input */}
                                        <div className="flex-1 min-w-0">
                                            <Input
                                                type="text"
                                                placeholder="0"
                                                value={amount ? amount.toLocaleString("vi-VN") : ""}
                                                onChange={(e) => handleAmountChange(category.id, e.target.value)}
                                                className="text-right"
                                            />
                                            {amount > 0 && (
                                                <p className="text-blue-400 text-xs font-medium mt-1 bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                                                    {numberToVietnameseWords(amount)}
                                                </p>
                                            )}
                                        </div>

                                        {/* Save Button */}
                                        <Button
                                            onClick={() => handleSaveOne(category.id)}
                                            disabled={!amount || amount <= 0 || isSaving}
                                            className="sm:w-auto w-full"
                                        >
                                            {isSaved ? (
                                                <>
                                                    <CheckCircle2 size={18} className="mr-2" />
                                                    Đã lưu
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={18} className="mr-2" />
                                                    Lưu
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Save All Button */}
                    <Card className="bg-gradient-to-br from-green-600 to-emerald-700 border-none shadow-2xl shadow-green-900/20">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-white mb-1">Hoàn tất thiết lập</h3>
                                <p className="text-green-100 text-sm">
                                    Lưu tất cả ngân sách mặc định đã nhập
                                </p>
                            </div>
                            <Button
                                onClick={handleSaveAll}
                                isLoading={isSaving}
                                className="bg-white text-green-700 hover:bg-green-50 sm:w-auto w-full font-bold"
                            >
                                <Settings size={18} className="mr-2" />
                                Đặt thiết lập
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default BudgetTemplatesPage;
