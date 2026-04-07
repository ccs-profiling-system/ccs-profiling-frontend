import { Badge } from './Badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Star,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

export function BadgeExample() {
  return (
    <div className="p-8 space-y-8 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Badge Component Examples</h2>
        <p className="text-gray-600 mb-6">Status badges with various variants and styles</p>
      </div>

      {/* Variants */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Variants</h3>
        <div className="flex flex-wrap gap-3">
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Alert/Secondary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="gray">Default</Badge>
        </div>
      </div>

      {/* Sizes */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Sizes</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Badge size="sm">Small</Badge>
          <Badge size="md">Medium</Badge>
          <Badge size="lg">Large</Badge>
        </div>
      </div>

      {/* With Dots */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">With Status Dots</h3>
        <div className="flex flex-wrap gap-3">
          <Badge variant="success" dot>Active</Badge>
          <Badge variant="warning" dot>Pending</Badge>
          <Badge variant="secondary" dot>Critical</Badge>
          <Badge variant="gray" dot>Inactive</Badge>
          <Badge variant="info" dot>In Progress</Badge>
        </div>
      </div>

      {/* With Icons */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">With Icons</h3>
        <div className="flex flex-wrap gap-3">
          <Badge variant="success" icon={<CheckCircle className="w-3.5 h-3.5" />}>
            Completed
          </Badge>
          <Badge variant="secondary" icon={<XCircle className="w-3.5 h-3.5" />}>
            Failed
          </Badge>
          <Badge variant="warning" icon={<AlertCircle className="w-3.5 h-3.5" />}>
            Warning
          </Badge>
          <Badge variant="info" icon={<Clock className="w-3.5 h-3.5" />}>
            Scheduled
          </Badge>
          <Badge variant="primary" icon={<Star className="w-3.5 h-3.5" />}>
            Featured
          </Badge>
        </div>
      </div>

      {/* Status Examples */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Common Status Examples</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">User Status</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="success" dot>Active</Badge>
              <Badge variant="warning" dot>Away</Badge>
              <Badge variant="gray" dot>Offline</Badge>
              <Badge variant="secondary" dot>Banned</Badge>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Order Status</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="info" dot>Processing</Badge>
              <Badge variant="warning" dot>Pending</Badge>
              <Badge variant="success" dot>Delivered</Badge>
              <Badge variant="secondary" dot>Cancelled</Badge>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Task Priority</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">High Priority</Badge>
              <Badge variant="warning">Medium Priority</Badge>
              <Badge variant="info">Low Priority</Badge>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Curriculum Status</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="success" dot>Active</Badge>
              <Badge variant="gray" dot>Inactive</Badge>
              <Badge variant="secondary" dot>Archived</Badge>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Subject Types</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="info">Core</Badge>
              <Badge variant="primary">Major</Badge>
              <Badge variant="success">Elective</Badge>
              <Badge variant="gray">Minor</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Alert/Critical Badges (Secondary) */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Alert Badges (Secondary Color)</h3>
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary" icon={<AlertCircle className="w-3.5 h-3.5" />}>
            Critical Alert
          </Badge>
          <Badge variant="secondary" dot>
            Urgent
          </Badge>
          <Badge variant="secondary" icon={<XCircle className="w-3.5 h-3.5" />}>
            Error
          </Badge>
          <Badge variant="secondary" size="lg">
            High Risk
          </Badge>
        </div>
      </div>

      {/* Special Badges */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Special Badges</h3>
        <div className="flex flex-wrap gap-3">
          <Badge variant="primary" icon={<Star className="w-3.5 h-3.5" />} size="lg">
            Premium
          </Badge>
          <Badge variant="success" icon={<TrendingUp className="w-3.5 h-3.5" />}>
            Trending
          </Badge>
          <Badge variant="info" icon={<Shield className="w-3.5 h-3.5" />}>
            Verified
          </Badge>
          <Badge variant="warning" icon={<Zap className="w-3.5 h-3.5" />}>
            New
          </Badge>
        </div>
      </div>

      {/* In Context Examples */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">In Context</h3>
        <div className="space-y-4">
          {/* Student Card */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">John Doe</h4>
                <p className="text-sm text-gray-600">Student ID: 2024-001</p>
              </div>
              <Badge variant="success" dot>Enrolled</Badge>
            </div>
          </div>

          {/* Faculty Card */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Prof. Jane Smith</h4>
                <p className="text-sm text-gray-600">Computer Science Department</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="primary" size="sm">Full-time</Badge>
                <Badge variant="info" size="sm" icon={<Shield className="w-3 h-3" />}>
                  Verified
                </Badge>
              </div>
            </div>
          </div>

          {/* Event Card */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Tech Conference 2024</h4>
                <p className="text-sm text-gray-600">March 15, 2024</p>
              </div>
              <Badge variant="warning" dot>Upcoming</Badge>
            </div>
          </div>

          {/* System Alert */}
          <div className="border border-secondary rounded-lg p-4 bg-secondary/5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">System Maintenance</h4>
                <p className="text-sm text-gray-600">Scheduled downtime in 2 hours</p>
              </div>
              <Badge variant="secondary" icon={<AlertCircle className="w-3.5 h-3.5" />}>
                Critical
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
