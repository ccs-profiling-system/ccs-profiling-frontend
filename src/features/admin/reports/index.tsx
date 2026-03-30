import { MainLayout } from '@/components/layout';

export function Reports() {
  return (
    <MainLayout title="Reports">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
          <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition">
            Generate Report
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Reports module - Coming soon</p>
        </div>
      </div>
    </MainLayout>
  );
}
