import { useState, useEffect, useRef } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { User, Mail, Phone, MapPin, Clock, Send, Calendar, CheckCircle } from 'lucide-react';
import { advisorService } from '@/services/api/advisorService';
import type { Advisor, Message, Appointment } from '@/features/student/types';

export function AdvisorPage() {
  const [advisor, setAdvisor] = useState<Advisor | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [bookingAppointment, setBookingAppointment] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    } catch (error) {
      console.error('Failed to load advisor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || sendingMessage) return;

    setSendingMessage(true);
    try {
      await advisorService.sendMessage(messageContent);
      const updatedMessages = await advisorService.getMessages();
      setMessages(updatedMessages);
      setMessageContent('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot || bookingAppointment) return;

    setBookingAppointment(true);
    try {
      await advisorService.bookAppointment(
        selectedSlot.date,
        selectedSlot.startTime,
        selectedSlot.endTime
      );
      const updatedAppointments = await advisorService.getAppointments();
      const updatedSlots = await advisorService.getAvailableSlots();
      setAppointments(updatedAppointments);
      setAvailableSlots(updatedSlots);
      setShowBookingModal(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Failed to book appointment:', error);
    } finally {
      setBookingAppointment(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <StudentLayout title="Academic Advisor">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </StudentLayout>
    );
  }

  if (!advisor) {
    return (
      <StudentLayout title="Academic Advisor">
        <Card>
          <p className="text-gray-600">No advisor assigned yet.</p>
        </Card>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Academic Advisor">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-7 h-7 text-primary" />
          My Advisor
        </h1>

        {/* Advisor Information Card */}
        <Card title="Advisor Information">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  {advisor.firstName} {advisor.lastName}
                </h2>
                <p className="text-sm text-gray-500">Academic Advisor</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{advisor.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{advisor.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Office Location</p>
                  <p className="text-sm text-gray-900">{advisor.officeLocation}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Consultation Schedule</p>
                  <div className="space-y-1">
                    {advisor.officeHours.map((hours, index) => (
                      <p key={index} className="text-sm text-gray-900">
                        {hours.day}: {formatTime(hours.startTime)} - {formatTime(hours.endTime)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Messaging Interface */}
          <Card title="Messages" className="lg:col-span-1">
            <div className="space-y-4">
              {/* Messages List */}
              <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No messages yet. Start a conversation!</p>
                ) : (
                  messages.map((message) => {
                    const isFromStudent = message.senderId !== advisor.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isFromStudent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            isFromStudent
                              ? 'bg-primary text-white'
                              : 'bg-white border border-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isFromStudent ? 'text-primary-light' : 'text-gray-500'
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={sendingMessage}
                />
                <Button
                  type="submit"
                  variant="primary"
                  icon={<Send className="w-4 h-4" />}
                  loading={sendingMessage}
                  disabled={!messageContent.trim()}
                >
                  Send
                </Button>
              </form>
            </div>
          </Card>

          {/* Appointments */}
          <Card title="Appointments" className="lg:col-span-1">
            <div className="space-y-4">
              <Button
                variant="primary"
                icon={<Calendar className="w-4 h-4" />}
                onClick={() => setShowBookingModal(true)}
                fullWidth
              >
                Book Appointment
              </Button>

              {/* Upcoming Appointments */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Upcoming Appointments</h3>
                {appointments.filter(apt => apt.status === 'scheduled').length === 0 ? (
                  <p className="text-sm text-gray-500 py-4">No upcoming appointments</p>
                ) : (
                  appointments
                    .filter(apt => apt.status === 'scheduled')
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {formatDate(appointment.date)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                              </p>
                            </div>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Appointment Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedSlot(null);
        }}
        title="Book Appointment"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowBookingModal(false);
                setSelectedSlot(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleBookAppointment}
              loading={bookingAppointment}
              disabled={!selectedSlot}
            >
              Confirm Booking
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select an available time slot for your consultation with {advisor.firstName} {advisor.lastName}
          </p>

          {availableSlots.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No available slots at the moment</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSlot(slot)}
                  className={`w-full p-4 border-2 rounded-lg text-left transition ${
                    selectedSlot === slot
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{formatDate(slot.date)}</p>
                      <p className="text-sm text-gray-600">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </p>
                    </div>
                    {selectedSlot === slot && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </StudentLayout>
  );
}
