import { MainLayout } from '@/components/layout';

export function Instructions() {
  return (
    <MainLayout title="Instructions">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Instructions</h1>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-primary mb-2">Curriculum</h3>
            <p className="text-gray-600 text-sm">Manage curriculum data</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-primary mb-2">Subjects</h3>
            <p className="text-gray-600 text-sm">Manage subject information</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-primary mb-2">Syllabus</h3>
            <p className="text-gray-600 text-sm">Manage syllabus content</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
