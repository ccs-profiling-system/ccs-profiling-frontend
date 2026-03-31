import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/layout';
import {
  Bell,
  Clock,
  AlertCircle,
  FileText,
  ArrowRight,
  Calendar,
  AlertTriangle,
  CheckCircle,
  ClipboardList,
  Users,
  TrendingUp,
} from 'lucide-react';

export function DashboardAside() {
  const navigate = useNavigate();

  return (
    <aside className="space-y-4 sm:space-y-6">
      {/* Priority Alerts */}
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900">Priority Alerts</h3>
          <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            3
          </span>
        </div>

        <div className="space-y-2">
          {/* Alert 1 - Urgent */}
          <button
            onClick={() => navigate('/faculty/approvals')}
            className="w-full bg-white rounded-lg p-3 border border-red-200 hover:border-red-300 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">5 Pending Approvals</p>
                <p className="text-xs text-gray-600 mt-0.5">Faculty applications need review</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-600 font-medium">Urgent</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          </button>

          {/* Alert 2 - Important */}
          <button
            onClick={() => navigate('/events')}
            className="w-full bg-white rounded-lg p-3 border border-orange-200 hover:border-orange-300 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Event Tomorrow</p>
                <p className="text-xs text-gray-600 mt-0.5">Faculty Meeting at 9:00 AM</p>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-orange-600 font-medium">Tomorrow</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          </button>

          {/* Alert 3 - Reminder */}
          <button
            onClick={() => navigate('/reports')}
            className="w-full bg-white rounded-lg p-3 border border-yellow-200 hover:border-yellow-300 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">3 Reports Due</p>
                <p className="text-xs text-gray-600 mt-0.5">Quarterly reports deadline Friday</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-yellow-600" />
                  <span className="text-xs text-yellow-700 font-medium">3 days left</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          </button>
        </div>

        <button
          onClick={() => navigate('/notifications')}
          className="w-full mt-3 text-sm text-primary hover:text-primary-dark font-medium flex items-center justify-center gap-1 py-2 hover:bg-white/50 rounded-lg transition-colors"
        >
          View All Notifications
          <ArrowRight className="w-4 h-4" />
        </button>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Upcoming Events</h3>
          </div>
          <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
            8
          </span>
        </div>

        <div className="space-y-2">
          {/* Event 1 - Urgent */}
          <button
            onClick={() => navigate('/events/1')}
            className="w-full p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors text-left"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">Faculty Meeting</p>
                <p className="text-xs text-gray-600 mt-0.5">Tomorrow, 9:00 AM</p>
                <span className="inline-block text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 mt-1">
                  Urgent
                </span>
              </div>
            </div>
          </button>

          {/* Event 2 - This Week */}
          <button
            onClick={() => navigate('/events/2')}
            className="w-full p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-left"
          >
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">Research Symposium</p>
                <p className="text-xs text-gray-600 mt-0.5">April 5, 2026 • 2:00 PM</p>
                <span className="inline-block text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 mt-1">
                  This Week
                </span>
              </div>
            </div>
          </button>

          {/* Event 3 - Scheduled */}
          <button
            onClick={() => navigate('/events/3')}
            className="w-full p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-left"
          >
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">Student Orientation</p>
                <p className="text-xs text-gray-600 mt-0.5">April 10, 2026 • 10:00 AM</p>
                <span className="inline-block text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 mt-1">
                  Scheduled
                </span>
              </div>
            </div>
          </button>

          {/* Event 4 - Scheduled */}
          <button
            onClick={() => navigate('/events/4')}
            className="w-full p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-left"
          >
            <div className="flex items-start gap-2">
              <ClipboardList className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">Department Review</p>
                <p className="text-xs text-gray-600 mt-0.5">April 15, 2026 • 3:00 PM</p>
                <span className="inline-block text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 mt-1">
                  Scheduled
                </span>
              </div>
            </div>
          </button>
        </div>

        <button
          onClick={() => navigate('/events')}
          className="w-full mt-3 text-sm text-primary hover:text-primary-dark font-medium flex items-center justify-center gap-1 py-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          View All Events
          <ArrowRight className="w-4 h-4" />
        </button>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">Quick Stats</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-700">Online Now</span>
            </div>
            <span className="font-semibold text-gray-900">247</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">Tasks Done</span>
            </div>
            <span className="font-semibold text-gray-900">18/25</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-gray-700">Pending</span>
            </div>
            <span className="font-semibold text-gray-900">7</span>
          </div>
        </div>
      </Card>
    </aside>
  );
}
