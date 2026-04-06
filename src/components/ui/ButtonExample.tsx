import { Button } from './Button';
import { Plus, Download, Edit, Trash2, Save, Search } from 'lucide-react';
import { useState } from 'react';

export function ButtonExample() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Button Component Examples</h2>
        <p className="text-gray-600 mb-6">Reusable button component with multiple variants and sizes</p>
      </div>

      {/* Variants */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Variants</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
        </div>
      </div>

      {/* Sizes */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Sizes</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>

      {/* With Icons */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">With Icons</h3>
        <div className="flex flex-wrap gap-3">
          <Button icon={<Plus className="w-4 h-4" />}>
            Add New
          </Button>
          <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
            Download
          </Button>
          <Button variant="outline" icon={<Edit className="w-4 h-4" />}>
            Edit
          </Button>
          <Button variant="ghost" icon={<Search className="w-4 h-4" />}>
            Search
          </Button>
        </div>
      </div>

      {/* Icon Position */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Icon Position</h3>
        <div className="flex flex-wrap gap-3">
          <Button icon={<Save className="w-4 h-4" />} iconPosition="left">
            Save Changes
          </Button>
          <Button icon={<Download className="w-4 h-4" />} iconPosition="right">
            Export Data
          </Button>
        </div>
      </div>

      {/* Loading State */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Loading State</h3>
        <div className="flex flex-wrap gap-3">
          <Button loading={loading} onClick={handleClick}>
            {loading ? 'Processing...' : 'Click to Load'}
          </Button>
          <Button variant="secondary" loading>
            Loading...
          </Button>
        </div>
      </div>

      {/* Disabled State */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Disabled State</h3>
        <div className="flex flex-wrap gap-3">
          <Button disabled>Disabled Primary</Button>
          <Button variant="secondary" disabled>Disabled Secondary</Button>
          <Button variant="outline" disabled>Disabled Outline</Button>
        </div>
      </div>

      {/* Full Width */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Full Width</h3>
        <div className="space-y-3">
          <Button fullWidth icon={<Plus className="w-4 h-4" />}>
            Full Width Primary
          </Button>
          <Button variant="secondary" fullWidth icon={<Download className="w-4 h-4" />}>
            Full Width Secondary
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Common Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button icon={<Plus className="w-4 h-4" />}>
            Create
          </Button>
          <Button variant="outline" icon={<Edit className="w-4 h-4" />}>
            Edit
          </Button>
          <Button variant="secondary" icon={<Trash2 className="w-4 h-4" />}>
            Delete
          </Button>
          <Button variant="ghost" icon={<Download className="w-4 h-4" />}>
            Download
          </Button>
        </div>
      </div>

      {/* Button Groups */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Button Groups</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Cancel</Button>
          <Button size="sm">Save</Button>
        </div>
      </div>
    </div>
  );
}
