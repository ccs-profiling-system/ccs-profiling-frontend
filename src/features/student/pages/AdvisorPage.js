import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/PageStates';
import { User, Mail, Phone, MapPin, Clock, Send, Calendar, CheckCircle } from 'lucide-react';
import { advisorService } from '@/services/api/advisorService';
export function AdvisorPage() {
    const [advisor, setAdvisor] = useState(null);
    const [messages, setMessages] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [bookingAppointment, setBookingAppointment] = useState(false);
    const [messageContent, setMessageContent] = useState('');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const messagesEndRef = useRef(null);
    useEffect(() => {
        loadAdvisorData();
    }, []);
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    const loadAdvisorData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [advisorData, messagesData, appointmentsData, slotsData] = await Promise.all([
                advisorService.getAdvisor(),
                advisorService.getMessages(),
                advisorService.getAppointments(),
                advisorService.getAvailableSlots(),
            ]);
            setAdvisor(advisorData);
            setMessages(messagesData);
            setAppointments(appointmentsData);
            setAvailableSlots(slotsData);
        }
        catch (error) {
            console.error('Failed to load advisor data:', error);
            setError('Failed to load advisor information. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageContent.trim() || sendingMessage)
            return;
        setSendingMessage(true);
        try {
            await advisorService.sendMessage(messageContent);
            const updatedMessages = await advisorService.getMessages();
            setMessages(updatedMessages);
            setMessageContent('');
        }
        catch (error) {
            console.error('Failed to send message:', error);
        }
        finally {
            setSendingMessage(false);
        }
    };
    const handleBookAppointment = async () => {
        if (!selectedSlot || bookingAppointment)
            return;
        setBookingAppointment(true);
        try {
            await advisorService.bookAppointment(selectedSlot.date, selectedSlot.startTime, selectedSlot.endTime);
            const updatedAppointments = await advisorService.getAppointments();
            const updatedSlots = await advisorService.getAvailableSlots();
            setAppointments(updatedAppointments);
            setAvailableSlots(updatedSlots);
            setShowBookingModal(false);
            setSelectedSlot(null);
        }
        catch (error) {
            console.error('Failed to book appointment:', error);
        }
        finally {
            setBookingAppointment(false);
        }
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };
    if (loading) {
        return (_jsx(StudentLayout, { title: "Academic Advisor", children: _jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Spinner, { size: "lg" }) }) }));
    }
    if (error) {
        return (_jsx(StudentLayout, { title: "Academic Advisor", children: _jsx(ErrorState, { message: error, onRetry: loadAdvisorData }) }));
    }
    if (!advisor) {
        return (_jsx(StudentLayout, { title: "Academic Advisor", children: _jsx(Card, { children: _jsx("p", { className: "text-gray-600", children: "No advisor assigned yet." }) }) }));
    }
    return (_jsxs(StudentLayout, { title: "Academic Advisor", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center gap-2", children: [_jsx(User, { className: "w-7 h-7 text-primary" }), "My Advisor"] }), _jsx(Card, { title: "Advisor Information", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center", children: _jsx(User, { className: "w-8 h-8 text-primary" }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900", children: [advisor.firstName, " ", advisor.lastName] }), _jsx("p", { className: "text-sm text-gray-500", children: "Academic Advisor" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Mail, { className: "w-5 h-5 text-gray-400" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "Email" }), _jsx("p", { className: "text-sm text-gray-900", children: advisor.email })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Phone, { className: "w-5 h-5 text-gray-400" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "Phone" }), _jsx("p", { className: "text-sm text-gray-900", children: advisor.phone })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(MapPin, { className: "w-5 h-5 text-gray-400" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "Office Location" }), _jsx("p", { className: "text-sm text-gray-900", children: advisor.officeLocation })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Clock, { className: "w-5 h-5 text-gray-400 mt-1" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "Consultation Schedule" }), _jsx("div", { className: "space-y-1", children: advisor.officeHours.map((hours, index) => (_jsxs("p", { className: "text-sm text-gray-900", children: [hours.day, ": ", formatTime(hours.startTime), " - ", formatTime(hours.endTime)] }, index))) })] })] })] })] }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(Card, { title: "Messages", className: "lg:col-span-1", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50", children: [messages.length === 0 ? (_jsx("p", { className: "text-center text-gray-500 py-8", children: "No messages yet. Start a conversation!" })) : (messages.map((message) => {
                                                    const isFromStudent = message.senderId !== advisor.id;
                                                    return (_jsx("div", { className: `flex ${isFromStudent ? 'justify-end' : 'justify-start'}`, children: _jsxs("div", { className: `max-w-[80%] rounded-lg p-3 ${isFromStudent
                                                                ? 'bg-primary text-white'
                                                                : 'bg-white border border-gray-200 text-gray-900'}`, children: [_jsx("p", { className: "text-sm", children: message.content }), _jsx("p", { className: `text-xs mt-1 ${isFromStudent ? 'text-primary-light' : 'text-gray-500'}`, children: new Date(message.createdAt).toLocaleString() })] }) }, message.id));
                                                })), _jsx("div", { ref: messagesEndRef })] }), _jsxs("form", { onSubmit: handleSendMessage, className: "flex gap-2", children: [_jsx("input", { type: "text", value: messageContent, onChange: (e) => setMessageContent(e.target.value), placeholder: "Type your message...", className: "flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base", disabled: sendingMessage }), _jsx(Button, { type: "submit", variant: "primary", icon: _jsx(Send, { className: "w-4 h-4" }), loading: sendingMessage, disabled: !messageContent.trim(), children: "Send" })] })] }) }), _jsx(Card, { title: "Appointments", className: "lg:col-span-1", children: _jsxs("div", { className: "space-y-4", children: [_jsx(Button, { variant: "primary", icon: _jsx(Calendar, { className: "w-4 h-4" }), onClick: () => setShowBookingModal(true), fullWidth: true, children: "Book Appointment" }), _jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-700", children: "Upcoming Appointments" }), appointments.filter(apt => apt.status === 'scheduled').length === 0 ? (_jsx("p", { className: "text-sm text-gray-500 py-4", children: "No upcoming appointments" })) : (appointments
                                                    .filter(apt => apt.status === 'scheduled')
                                                    .map((appointment) => (_jsx("div", { className: "p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Calendar, { className: "w-5 h-5 text-primary mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: formatDate(appointment.date) }), _jsxs("p", { className: "text-sm text-gray-600", children: [formatTime(appointment.startTime), " - ", formatTime(appointment.endTime)] })] })] }), _jsx(CheckCircle, { className: "w-5 h-5 text-green-500" })] }) }, appointment.id))))] })] }) })] })] }), _jsx(Modal, { isOpen: showBookingModal, onClose: () => {
                    setShowBookingModal(false);
                    setSelectedSlot(null);
                }, title: "Book Appointment", size: "md", footer: _jsxs(_Fragment, { children: [_jsx(Button, { variant: "outline", onClick: () => {
                                setShowBookingModal(false);
                                setSelectedSlot(null);
                            }, children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleBookAppointment, loading: bookingAppointment, disabled: !selectedSlot, children: "Confirm Booking" })] }), children: _jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "text-sm text-gray-600", children: ["Select an available time slot for your consultation with ", advisor.firstName, " ", advisor.lastName] }), availableSlots.length === 0 ? (_jsx("p", { className: "text-center text-gray-500 py-8", children: "No available slots at the moment" })) : (_jsx("div", { className: "space-y-2 max-h-96 overflow-y-auto", children: availableSlots.map((slot, index) => (_jsx("button", { onClick: () => setSelectedSlot(slot), className: `w-full p-4 border-2 rounded-lg text-left transition ${selectedSlot === slot
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-300'}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: formatDate(slot.date) }), _jsxs("p", { className: "text-sm text-gray-600", children: [formatTime(slot.startTime), " - ", formatTime(slot.endTime)] })] }), selectedSlot === slot && (_jsx(CheckCircle, { className: "w-5 h-5 text-primary" }))] }) }, index))) }))] }) })] }));
}
