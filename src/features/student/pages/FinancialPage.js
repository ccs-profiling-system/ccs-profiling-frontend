import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { DollarSign, CreditCard, AlertCircle, Calendar, Receipt, TrendingDown, CheckCircle, } from 'lucide-react';
import { financialService } from '@/services/api/financialService';
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(amount);
}
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
function isPastDue(dueDateString) {
    return new Date(dueDateString) < new Date();
}
export function FinancialPage() {
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await financialService.getFinancialRecord();
                setRecord(data);
            }
            catch {
                setError('Failed to load financial records. Please try again.');
            }
            finally {
                setLoading(false);
            }
        };
        load();
    }, []);
    if (loading) {
        return (_jsx(StudentLayout, { title: "Financial", children: _jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Spinner, { size: "lg" }) }) }));
    }
    if (error || !record) {
        return (_jsx(StudentLayout, { title: "Financial", children: _jsxs("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-5 h-5 flex-shrink-0" }), error || 'No financial records found.'] }) }));
    }
    const totalFees = record.tuitionCharges + record.miscFees + record.labFees;
    const pastDue = isPastDue(record.dueDate);
    return (_jsx(StudentLayout, { title: "Financial", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center gap-2", children: [_jsx(DollarSign, { className: "w-7 h-7 text-primary" }), "Financial Account"] }), record.outstandingAmount > 0 && (_jsxs("div", { className: `flex items-center gap-3 px-4 py-3 rounded-lg border ${pastDue
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`, children: [_jsx(AlertCircle, { className: "w-5 h-5 flex-shrink-0" }), _jsx("span", { className: "text-sm font-medium", children: pastDue
                                ? `Payment was due on ${formatDate(record.dueDate)}. Please settle your balance.`
                                : `Payment due on ${formatDate(record.dueDate)}.` })] })), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsx(Card, { className: "bg-gradient-to-br from-primary/10 to-primary/5", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Total Charges" }), _jsx("p", { className: "text-2xl font-bold text-primary", children: formatCurrency(totalFees) })] }), _jsx(Receipt, { className: "w-10 h-10 text-primary opacity-40" })] }) }), _jsx(Card, { className: "bg-gradient-to-br from-green-50 to-green-100", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Total Paid" }), _jsx("p", { className: "text-2xl font-bold text-green-700", children: formatCurrency(record.balance) })] }), _jsx(CheckCircle, { className: "w-10 h-10 text-green-700 opacity-40" })] }) }), _jsx(Card, { className: `bg-gradient-to-br ${record.outstandingAmount > 0
                                ? 'from-red-50 to-red-100'
                                : 'from-gray-50 to-gray-100'}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Outstanding Balance" }), _jsx("p", { className: `text-2xl font-bold ${record.outstandingAmount > 0 ? 'text-red-600' : 'text-gray-500'}`, children: formatCurrency(record.outstandingAmount) })] }), _jsx(TrendingDown, { className: `w-10 h-10 opacity-40 ${record.outstandingAmount > 0 ? 'text-red-600' : 'text-gray-400'}` })] }) })] }), _jsxs(Card, { children: [_jsxs("h2", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2", children: [_jsx(Receipt, { className: "w-5 h-5 text-primary" }), "Fee Breakdown"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between py-2 border-b border-gray-100", children: [_jsx("span", { className: "text-gray-700", children: "Tuition Fee" }), _jsx("span", { className: "font-semibold text-gray-900", children: formatCurrency(record.tuitionCharges) })] }), _jsxs("div", { className: "flex items-center justify-between py-2 border-b border-gray-100", children: [_jsx("span", { className: "text-gray-700", children: "Miscellaneous Fees" }), _jsx("span", { className: "font-semibold text-gray-900", children: formatCurrency(record.miscFees) })] }), _jsxs("div", { className: "flex items-center justify-between py-2 border-b border-gray-100", children: [_jsx("span", { className: "text-gray-700", children: "Laboratory Fees" }), _jsx("span", { className: "font-semibold text-gray-900", children: formatCurrency(record.labFees) })] }), _jsxs("div", { className: "flex items-center justify-between py-2 pt-1", children: [_jsx("span", { className: "font-semibold text-gray-900", children: "Total" }), _jsx("span", { className: "font-bold text-primary text-lg", children: formatCurrency(totalFees) })] })] })] }), _jsx(Card, { children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${pastDue ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`, children: _jsx(Calendar, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Payment Due Date" }), _jsxs("p", { className: `font-semibold ${pastDue ? 'text-red-600' : 'text-gray-900'}`, children: [formatDate(record.dueDate), pastDue && _jsx("span", { className: "ml-2 text-sm font-normal text-red-500", children: "(Past due)" })] })] })] }) }), _jsxs(Card, { children: [_jsxs("h2", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2", children: [_jsx(CreditCard, { className: "w-5 h-5 text-primary" }), "Payment History"] }), record.payments.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(CreditCard, { className: "w-10 h-10 text-gray-300 mx-auto mb-2" }), _jsx("p", { className: "text-gray-500", children: "No payments recorded yet." })] })) : (_jsx("div", { className: "overflow-x-auto -mx-4 sm:-mx-0", children: _jsxs("table", { className: "w-full min-w-[400px]", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-200", children: [_jsx("th", { className: "text-left py-3 px-4 text-sm font-semibold text-gray-700", children: "Date" }), _jsx("th", { className: "text-left py-3 px-4 text-sm font-semibold text-gray-700", children: "Reference No." }), _jsx("th", { className: "text-left py-3 px-4 text-sm font-semibold text-gray-700", children: "Method" }), _jsx("th", { className: "text-right py-3 px-4 text-sm font-semibold text-gray-700", children: "Amount" })] }) }), _jsx("tbody", { children: record.payments.map((payment) => (_jsxs("tr", { className: "border-b border-gray-100 hover:bg-gray-50", children: [_jsx("td", { className: "py-3 px-4 text-sm text-gray-700", children: formatDate(payment.date) }), _jsx("td", { className: "py-3 px-4 text-sm font-mono text-gray-600", children: payment.referenceNumber }), _jsx("td", { className: "py-3 px-4 text-sm text-gray-700", children: payment.method }), _jsx("td", { className: "py-3 px-4 text-sm font-semibold text-green-700 text-right", children: formatCurrency(payment.amount) })] }, payment.id))) }), _jsx("tfoot", { children: _jsxs("tr", { className: "border-t-2 border-gray-200", children: [_jsx("td", { colSpan: 3, className: "py-3 px-4 text-sm font-semibold text-gray-900", children: "Total Paid" }), _jsx("td", { className: "py-3 px-4 text-sm font-bold text-green-700 text-right", children: formatCurrency(record.balance) })] }) })] }) }))] }), _jsx("p", { className: "text-xs text-gray-400 text-center", children: "This is a view-only record. For payment concerns, please contact the CCS Registrar's Office." })] }) }));
}
