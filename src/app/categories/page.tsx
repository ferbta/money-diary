"use client";

import React from "react";
import { Category, CategoryType } from "@/lib/types";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Card from "@/components/ui/Card";
import IconPicker, { IconRenderer } from "@/components/ui/IconPicker";

const CategoriesPage = () => {
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Form state
    const [newName, setNewName] = React.useState("");
    const [newType, setNewType] = React.useState<CategoryType>("EXPENSE");
    const [newIcon, setNewIcon] = React.useState("Tag");

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/categories");
            const data = await response.json();
            setCategories(data);
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName) return;

        try {
            setIsSubmitting(true);
            setError(null);
            const response = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newName,
                    type: newType,
                    icon: newIcon
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to create category");
            }

            setNewName("");
            setNewIcon("Tag");
            fetchCategories();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa danh mục này không?")) return;

        try {
            const response = await fetch(`/api/categories/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to delete category");
            }

            fetchCategories();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const incomeCategories = categories.filter(c => c.type === "INCOME");
    const expenseCategories = categories.filter(c => c.type === "EXPENSE");

    return (
        <div className="max-w-4xl mx-auto w-full space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Quản Lý Danh Mục</h1>
                <p className="text-slate-400 mt-1">Sắp xếp các khoản thu nhập và chi phí của bạn để theo dõi tốt hơn</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Category Form */}
                <div className="md:col-span-1">
                    <Card title="Thêm danh mục" subtitle="Tạo phân loại mới">
                        <form onSubmit={handleCreate} className="space-y-4">
                            <Input
                                label="Tên danh mục"
                                placeholder="VD: Ăn uống, Lương"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                required
                            />
                            <Select
                                label="Loại"
                                value={newType}
                                onChange={(e) => setNewType(e.target.value as CategoryType)}
                                options={[
                                    { label: "Chi phí", value: "EXPENSE" },
                                    { label: "Thu nhập", value: "INCOME" },
                                ]}
                            />

                            <IconPicker value={newIcon} onChange={setNewIcon} />

                            {error && (
                                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-500 text-xs shadow-sm">
                                    <AlertCircle size={14} />
                                    {error}
                                </div>
                            )}
                            <Button type="submit" className="w-full" isLoading={isSubmitting}>
                                <Plus size={18} className="mr-2" />
                                Thêm danh mục
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Categories List */}
                <div className="lg:col-span-2 space-y-6">
                    <section>
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 ml-1">Danh mục chi phí</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {expenseCategories.map((cat) => (
                                <div key={cat.id} className="group flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                                            <IconRenderer name={cat.icon || "Tag"} size={24} />
                                        </div>
                                        <span className="font-semibold text-slate-200">{cat.name}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            {expenseCategories.length === 0 && !isLoading && (
                                <p className="text-sm text-slate-600 italic py-4">Chưa có danh mục chi phí nào</p>
                            )}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 ml-1">Danh mục thu nhập</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {incomeCategories.map((cat) => (
                                <div key={cat.id} className="group flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                            <IconRenderer name={cat.icon || "Tag"} size={24} />
                                        </div>
                                        <span className="font-semibold text-slate-200">{cat.name}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            {incomeCategories.length === 0 && !isLoading && (
                                <p className="text-sm text-slate-600 italic py-4">Chưa có danh mục thu nhập nào</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CategoriesPage;
