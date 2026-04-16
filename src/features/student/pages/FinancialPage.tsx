import { useState, useEffect } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import {
  DollarSign,
  CreditCard,
  AlertCircle,
  Calendar,
  Receipt,
  TrendingDown,
  CheckCircle,
} from 'lucide-react';
import { financialService } from '@/services/api/financialService';
import type { FinancialRecord } from '../types';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function isPastDue(dueDateString: string): boolean {
  return new Date(dueDateString) < new Date();
}

export function FinancialPage() {
  const [record, setRecord] = useState<FinancialRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await financialService.getFinancialRecord();
        setRecord(data);
      } catch {
        setError('Failed to load financial records. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <StudentLayout title="Financial">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </StudentLayout>
    );
  }

  if (error || !record) {
    return (
      <StudentLayout title="Financial">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error || 'No financial records found.'}
        </div>
      </StudentLayout>
    );
  }

  const totalFees = record.tuitionCharges + record.miscFees + record.labFees;
  const pastDue = isPastDue(record.dueDate);

  return (
    <StudentLayout title="Financial">
      <div className="space-y-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-7 h-7 text-primary" />
          Financial Account
        </h1>

        {/* Due date warning */}
        {record.outstandingAmount > 0 && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
            pastDue
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-yellow-50 border-yellow-200 text-yellow-700'
          }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">
              {pastDue
                ? `Payment was due on ${formatDate(record.dueDate)}. Please settle your balance.`
                : `Payment due on ${formatDate(record.dueDate)}.`}
            </span>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Charges</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalFees)}</p>
              </div>
              <Receipt className="w-10 h-10 text-primary opacity-40" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(record.balance)}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-700 opacity-40" />
            </div>
          </Card>

          <Card className={`bg-gradient-to-br ${
            record.outstandingAmount > 0
              ? 'from-red-50 to-red-100'
              : 'from-gray-50 to-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Outstanding Balance</p>
                <p className={`text-2xl font-bold ${
                  record.outstandingAmount > 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {formatCurrency(record.outstandingAmount)}
                </p>
              </div>
              <TrendingDown className={`w-10 h-10 opacity-40 ${
                record.outstandingAmount > 0 ? 'text-red-600' : 'text-gray-400'
              }`} />
            </div>
          </Card>
        </div>

        {/* Fee breakdown */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Fee Breakdown
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-700">Tuition Fee</span>
              <span className="font-semibold text-gray-900">{formatCurrency(record.tuitionCharges)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-700">Miscellaneous Fees</span>
              <span className="font-semibold text-gray-900">{formatCurrency(record.miscFees)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-700">Laboratory Fees</span>
              <span className="font-semibold text-gray-900">{formatCurrency(record.labFees)}</span>
            </div>
            <div className="flex items-center justify-between py-2 pt-1">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-primary text-lg">{formatCurrency(totalFees)}</span>
            </div>
          </div>
        </Card>

        {/* Payment due date */}
        <Card>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              pastDue ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Due Date</p>
              <p className={`font-semibold ${pastDue ? 'text-red-600' : 'text-gray-900'}`}>
                {formatDate(record.dueDate)}
                {pastDue && <span className="ml-2 text-sm font-normal text-red-500">(Past due)</span>}
              </p>
            </div>
          </div>
        </Card>

        {/* Payment history */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Payment History
          </h2>
          {record.payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No payments recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:-mx-0">
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reference No.</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Method</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {record.payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-700">{formatDate(payment.date)}</td>
                      <td className="py-3 px-4 text-sm font-mono text-gray-600">{payment.referenceNumber}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{payment.method}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-green-700 text-right">
                        {formatCurrency(payment.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200">
                    <td colSpan={3} className="py-3 px-4 text-sm font-semibold text-gray-900">
                      Total Paid
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-green-700 text-right">
                      {formatCurrency(record.balance)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </Card>

        <p className="text-xs text-gray-400 text-center">
          This is a view-only record. For payment concerns, please contact the CCS Registrar's Office.
        </p>
      </div>
    </StudentLayout>
  );
}
