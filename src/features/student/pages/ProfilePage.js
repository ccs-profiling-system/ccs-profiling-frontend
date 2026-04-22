import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { User, Mail, Phone, Calendar, BookOpen, Hash, CheckCircle, Edit2, Save, X, Bell, Lock, AlertCircle, Beaker, Users, ArrowRight } from 'lucide-react';
import { studentService } from '@/services/api/studentService';
export function ProfilePage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
        }
        catch (err) {
            setError('Failed to load profile');
        }
        finally {
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
        if (!profile)
            return;
        try {
            setSaving(true);
            const updated = await studentService.updateProfile({
                email: editedEmail,
                phone: editedPhone,
            });
            setProfile(updated);
            setIsEditingContact(false);
            setError(null);
        }
        catch (err) {
            setError('Failed to update contact information');
        }
        finally {
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
        }
        catch (err) {
            setPasswordError('Failed to change password');
        }
        finally {
            setSaving(false);
        }
    };
    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-green-100 text-green-800',
            graduated: 'bg-blue-100 text-blue-800',
            dropped: 'bg-gray-100 text-gray-800',
            suspended: 'bg-red-100 text-red-800',
        };
        return (_jsx("span", { className: `px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.active}`, children: status.charAt(0).toUpperCase() + status.slice(1) }));
    };
    if (loading) {
        return (_jsx(StudentLayout, { title: "Profile", children: _jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary" }) }) }));
    }
    if (error && !profile) {
        return (_jsx(StudentLayout, { title: "Profile", children: _jsx(Card, { children: _jsxs("div", { className: "text-center py-8", children: [_jsx(AlertCircle, { className: "w-12 h-12 text-red-500 mx-auto mb-4" }), _jsx("p", { className: "text-red-600 mb-4", children: error }), _jsx(Button, { onClick: loadProfile, children: "Retry" })] }) }) }));
    }
    if (!profile)
        return null;
    return (_jsx(StudentLayout, { title: "Profile", children: _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center gap-2", children: [_jsx(User, { className: "w-7 h-7 text-primary" }), "My Profile"] }) }), error && (_jsxs("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-5 h-5" }), error] })), _jsx(Card, { title: "Personal Information", hover: false, children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Full Name" }), _jsxs("p", { className: "mt-1 text-gray-900 font-medium", children: [profile.firstName, " ", profile.lastName] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Student ID" }), _jsxs("p", { className: "mt-1 text-gray-900 font-medium flex items-center gap-2", children: [_jsx(Hash, { className: "w-4 h-4 text-gray-400" }), profile.studentId] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Program" }), _jsxs("p", { className: "mt-1 text-gray-900 font-medium flex items-center gap-2", children: [_jsx(BookOpen, { className: "w-4 h-4 text-gray-400" }), profile.program] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Year Level" }), _jsxs("p", { className: "mt-1 text-gray-900 font-medium", children: ["Year ", profile.yearLevel] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Section" }), _jsx("p", { className: "mt-1 text-gray-900 font-medium", children: profile.section })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Enrollment Date" }), _jsxs("p", { className: "mt-1 text-gray-900 font-medium flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-gray-400" }), new Date(profile.enrollmentDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Status" }), _jsx("div", { className: "mt-1", children: getStatusBadge(profile.status) })] })] }) }), _jsx(Card, { title: "Activity Summary", hover: false, children: _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs("div", { className: "flex items-center gap-3 p-4 bg-primary/5 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors", onClick: () => navigate('/student/schedule'), children: [_jsx(BookOpen, { className: "w-8 h-8 text-primary flex-shrink-0" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Enrolled Courses" }), _jsx("p", { className: "text-xl font-bold text-gray-900", children: "View Schedule" })] }), _jsx(ArrowRight, { className: "w-4 h-4 text-gray-400" })] }), _jsxs("div", { className: "flex items-center gap-3 p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors", onClick: () => navigate('/student/participation'), children: [_jsx(Users, { className: "w-8 h-8 text-blue-600 flex-shrink-0" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Events & Affiliations" }), _jsx("p", { className: "text-xl font-bold text-gray-900", children: "Participation" })] }), _jsx(ArrowRight, { className: "w-4 h-4 text-gray-400" })] }), _jsxs("div", { className: "flex items-center gap-3 p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors", onClick: () => navigate('/student/research'), children: [_jsx(Beaker, { className: "w-8 h-8 text-green-600 flex-shrink-0" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Thesis / Capstone" }), _jsx("p", { className: "text-xl font-bold text-gray-900", children: "Research" })] }), _jsx(ArrowRight, { className: "w-4 h-4 text-gray-400" })] })] }) }), "        ", _jsx(Card, { title: "Contact Information", hover: false, children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Update your contact details" }), !isEditingContact ? (_jsx(Button, { variant: "outline", size: "sm", icon: _jsx(Edit2, { className: "w-4 h-4" }), onClick: handleEditContact, children: "Edit" })) : (_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", icon: _jsx(X, { className: "w-4 h-4" }), onClick: handleCancelEdit, disabled: saving, children: "Cancel" }), _jsx(Button, { size: "sm", icon: _jsx(Save, { className: "w-4 h-4" }), onClick: handleSaveContact, loading: saving, children: "Save" })] }))] }), _jsxs("div", { children: [_jsxs("label", { className: "text-sm font-medium text-gray-500 flex items-center gap-2", children: [_jsx(Mail, { className: "w-4 h-4" }), "Email"] }), isEditingContact ? (_jsx("input", { type: "email", value: editedEmail, onChange: (e) => setEditedEmail(e.target.value), className: "mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" })) : (_jsx("p", { className: "mt-1 text-gray-900 font-medium", children: profile.email }))] }), _jsxs("div", { children: [_jsxs("label", { className: "text-sm font-medium text-gray-500 flex items-center gap-2", children: [_jsx(Phone, { className: "w-4 h-4" }), "Phone"] }), isEditingContact ? (_jsx("input", { type: "tel", value: editedPhone, onChange: (e) => setEditedPhone(e.target.value), className: "mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" })) : (_jsx("p", { className: "mt-1 text-gray-900 font-medium", children: profile.phone }))] })] }) }), _jsx(Card, { title: "Account Settings", hover: false, children: _jsxs("div", { className: "space-y-4", children: [_jsx("div", { children: _jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { children: [_jsxs("h4", { className: "font-medium text-gray-900 flex items-center gap-2", children: [_jsx(Bell, { className: "w-4 h-4 text-gray-400" }), "Notification Preferences"] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Choose what notifications you want to receive" })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setShowNotificationModal(true), children: "Manage" })] }) }), _jsx("div", { className: "border-t border-gray-200 pt-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h4", { className: "font-medium text-gray-900 flex items-center gap-2", children: [_jsx(Lock, { className: "w-4 h-4 text-gray-400" }), "Password"] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Change your account password" })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setShowPasswordModal(true), children: "Change Password" })] }) })] }) }), _jsx(Modal, { isOpen: showNotificationModal, onClose: () => setShowNotificationModal(false), title: "Notification Preferences", footer: _jsxs(_Fragment, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowNotificationModal(false), children: "Cancel" }), _jsx(Button, { onClick: () => setShowNotificationModal(false), children: "Save Preferences" })] }), children: _jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Select which notifications you want to receive" }), Object.entries(notifications).map(([key, value]) => (_jsxs("label", { className: "flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(CheckCircle, { className: `w-5 h-5 ${value ? 'text-primary' : 'text-gray-300'}` }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900 capitalize", children: key }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Receive notifications about ", key.toLowerCase()] })] })] }), _jsx("input", { type: "checkbox", checked: value, onChange: (e) => setNotifications({ ...notifications, [key]: e.target.checked }), className: "w-5 h-5 text-primary rounded focus:ring-primary" })] }, key)))] }) }), _jsx(Modal, { isOpen: showPasswordModal, onClose: () => {
                        setShowPasswordModal(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        setPasswordError('');
                    }, title: "Change Password", footer: _jsxs(_Fragment, { children: [_jsx(Button, { variant: "outline", onClick: () => {
                                    setShowPasswordModal(false);
                                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                    setPasswordError('');
                                }, children: "Cancel" }), _jsx(Button, { onClick: handlePasswordChange, loading: saving, children: "Change Password" })] }), children: _jsxs("div", { className: "space-y-4", children: [passwordError && (_jsxs("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-5 h-5" }), passwordError] })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Current Password" }), _jsx("input", { type: "password", value: passwordData.currentPassword, onChange: (e) => setPasswordData({ ...passwordData, currentPassword: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "New Password" }), _jsx("input", { type: "password", value: passwordData.newPassword, onChange: (e) => setPasswordData({ ...passwordData, newPassword: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Must be at least 8 characters with uppercase, lowercase, and number" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Confirm New Password" }), _jsx("input", { type: "password", value: passwordData.confirmPassword, onChange: (e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" })] })] }) })] }) }));
}
