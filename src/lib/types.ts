import { Category, Transaction, Budget, Receipt, CategoryType, TransactionType } from "@prisma/client";

export type { Category, Transaction, Budget, Receipt };
export { CategoryType, TransactionType };

export type TransactionWithCategoryAndReceipts = Transaction & {
    category: Category;
    receipts: Receipt[];
};

export type CategoryWithTransactions = Category & {
    transactions: Transaction[];
};

export type BudgetWithCategory = Budget & {
    category: Category;
};

export type BudgetTemplate = {
    id: string;
    amount: number;
    categoryId: string;
    createdAt: Date;
    updatedAt: Date;
};

export type BudgetTemplateWithCategory = BudgetTemplate & {
    category: Category;
};

export type DashboardSummary = {
    totalIncome: number;
    totalExpense: number;
    balance: number;
};

export type ReportData = {
    monthlyData: {
        month: string;
        income: number;
        expense: number;
    }[];
    categoryBreakdown: {
        category: string;
        amount: number;
        color: string;
    }[];
};
