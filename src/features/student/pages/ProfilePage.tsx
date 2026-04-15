import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { User, Mail, Phone, Calendar, BookOpen, Hash, CheckCircle, Edit2, Save, X, Bell, Lock, AlertCircle, Beaker, Users, ArrowRight } from 'lucide-react';
import { studentService } from '@/services/api/studentService';
import type { StudentProfile } from '../types';

export function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit mode states
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editedEmail, setEditedEmail] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Modal states
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Notification preferences
  const [notifications, setNotifications] = useState({
    grades: true,
    announcements: true,
    events: true,
    messages: true,
    deadlines: true,
  });
  
  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await studentService.getProfile();
      setProfile(data);
      setEditedEmail(data.email);
      setEditedPhone(data.phone);
      setError(null);
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditContact = () => {
    setIsEditingContact(true);
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditedEmail(profile.email);
      setEditedPhone(profile.phone);
    }
    setIsEditingContact(false);
  };

  const handleSaveContact = async () => {
    if (!profile) return;
    
    try {
      setSaving(true);
      const updated = await studentService.updateProfile({
        email: editedEmail,
        phone: editedPhone,
      });
      setProfile(updated);
      setIsEditingContact(false);
      setError(null);
    } catch (err) {
      setError('Failed to update contact information');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    
    // Validate password
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      setPasswordError('Password must contain uppercase, lowercase, and number');
      return;
    }
    
    try {
      setSaving(true);
      // In a real app, this would call an API endpoint
      // await studentService.changePassword(passwordData);
      
      // Simulate success
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully');
    } catch (err) {
      setPasswordError('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      graduated: 'bg-blue-100 text-blue-800',
      dropped: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || styles.active}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <StudentLayout title="Profile">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </StudentLayout>
    );
  }

  if (error && !profile) {
    return (
      <StudentLayout title="Profile">
        <Card>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadProfile}>Retry</Button>
          </div>
        </Card>
      </StudentLayout>
    );
  }

  if (!profile) return null;

  return (
    <StudentLayout title="Profile">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-7 h-7 text-primary" />
            My Profile
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Personal Information */}
        <Card title="Personal Information" hover={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <p className="mt-1 text-gray-900 font-medium">{profile.firstName} {profile.lastName}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Student ID</label>
              <p className="mt-1 text-gray-900 font-medium flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-400" />
                {profile.studentId}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Program</label>
              <p className="mt-1 text-gray-900 font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-400" />
                {profile.program}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Year Level</label>
              <p className="mt-1 text-gray-900 font-medium">Year {profile.yearLevel}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Section</label>
              <p className="mt-1 text-gray-900 font-medium">{profile.section}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Enrollment Date</label>
              <p className="mt-1 text-gray-900 font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                {new Date(profile.enrollmentDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                {getStatusBadge(profile.status)}
              </div>
            </div>
          </div>
        </Card>

        {/* Activity Summary */}
        <Card title="Activity Summary" hover={false}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => navigate('/student/schedule')}
            >
              <BookOpen className="w-8 h-8 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Enrolled Courses</p>
                <p className="text-xl font-bold text-gray-900">View Schedule</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>

            <div
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => navigate('/student/participation')}
            >
              <Users className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Events & Affiliations</p>
                <p className="text-xl font-bold text-gray-900">Participation</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>

            <div
              className="flex items-center gap-3 p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
              onClick={() => navigate('/student/research')}
            >
              <Beaker className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Thesis / Capstone</p>
                <p className="text-xl font-bold text-gray-900">Research</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </Card>

        {/* Contact Information */}        <Card title="Contact Information" hover={false}>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">Update your contact details</p>
              {!isEditingContact ? (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Edit2 className="w-4 h-4" />}
                  onClick={handleEditContact}
                >
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<X className="w-4 h-4" />}
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    icon={<Save className="w-4 h-4" />}
                    onClick={handleSaveContact}
                    loading={saving}
                  >
                    Save
                  </Button>
                </div>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              {isEditingContact ? (
                <input
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="mt-1 text-gray-900 font-medium">{profile.email}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone
              </label>
              {isEditingContact ? (
                <input
                  type="tel"
                  value={editedPhone}
                  onChange={(e) => setEditedPhone(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="mt-1 text-gray-900 font-medium">{profile.phone}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Account Settings */}
        <Card title="Account Settings" hover={false}>
          <div className="space-y-4">
            {/* Notification Preferences */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-gray-400" />
                    Notification Preferences
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">Choose what notifications you want to receive</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNotificationModal(true)}
                >
                  Manage
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-400" />
                    Password
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">Change your account password</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Notification Preferences Modal */}
        <Modal
          isOpen={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
          title="Notification Preferences"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowNotificationModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowNotificationModal(false)}>
                Save Preferences
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Select which notifications you want to receive
            </p>
            
            {Object.entries(notifications).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center gap-3">
                  <CheckCircle className={`w-5 h-5 ${value ? 'text-primary' : 'text-gray-300'}`} />
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{key}</p>
                    <p className="text-sm text-gray-600">
                      Receive notifications about {key.toLowerCase()}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                  className="w-5 h-5 text-primary rounded focus:ring-primary"
                />
              </label>
            ))}
          </div>
        </Modal>

        {/* Password Change Modal */}
        <Modal
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setPasswordError('');
          }}
          title="Change Password"
          footer={
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordError('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handlePasswordChange} loading={saving}>
                Change Password
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {passwordError}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </Modal>
      </div>
    </StudentLayout>
  );
}
