export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        
        {/* Tailwind CSS Demo with Custom Colors */}
        <div className="grid gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Tailwind Custom Colors Test</h2>
            <div className="flex gap-4 flex-wrap">
              <button className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded transition">
                Primary Button
              </button>
              <button className="bg-secondary hover:bg-red-600 text-white px-6 py-2 rounded transition">
                Secondary Button
              </button>
              <button className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-6 py-2 rounded transition">
                Outlined Primary
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Color Palette</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="bg-primary h-20 rounded mb-2"></div>
                <p className="text-sm font-medium">Primary</p>
                <p className="text-xs text-gray-500">rgb(234 88 12)</p>
              </div>
              <div>
                <div className="bg-primary-dark h-20 rounded mb-2"></div>
                <p className="text-sm font-medium">Primary Dark</p>
                <p className="text-xs text-gray-500">rgb(194 65 12)</p>
              </div>
              <div>
                <div className="bg-secondary h-20 rounded mb-2"></div>
                <p className="text-sm font-medium">Secondary</p>
                <p className="text-xs text-gray-500">rgb(239 68 68)</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Responsive Grid</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-100 p-4 rounded text-center">Card 1</div>
              <div className="bg-gray-100 p-4 rounded text-center">Card 2</div>
              <div className="bg-gray-100 p-4 rounded text-center">Card 3</div>
              <div className="bg-gray-100 p-4 rounded text-center">Card 4</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
