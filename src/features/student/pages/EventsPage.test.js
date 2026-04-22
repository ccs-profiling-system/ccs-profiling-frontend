import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { EventsPage } from './EventsPage';
import { eventService } from '@/services/api/eventService';
// Mock the event service
vi.mock('@/services/api/eventService', () => ({
    eventService: {
        getUpcomingEvents: vi.fn(),
        getRegisteredEvents: vi.fn(),
        registerForEvent: vi.fn(),
        unregisterFromEvent: vi.fn(),
    },
}));
// Mock the StudentLayout
vi.mock('../layout/StudentLayout', () => ({
    StudentLayout: ({ children, title }) => (_jsxs("div", { "data-testid": "student-layout", children: [_jsx("h1", { children: title }), children] })),
}));
const mockUpcomingEvents = [
    {
        id: '1',
        title: 'AI Workshop',
        description: 'Learn about artificial intelligence',
        date: '2026-05-01',
        startTime: '14:00',
        endTime: '16:00',
        location: 'Room 301',
        capacity: 50,
        registered: 30,
        category: 'Workshop',
        status: 'upcoming',
    },
    {
        id: '2',
        title: 'Cybersecurity Seminar',
        description: 'Introduction to cybersecurity',
        date: '2026-05-05',
        startTime: '10:00',
        endTime: '12:00',
        location: 'Auditorium',
        capacity: 100,
        registered: 100,
        category: 'Seminar',
        status: 'upcoming',
    },
];
const mockRegisteredEvents = [
    {
        id: '3',
        title: 'Web Development Bootcamp',
        description: 'Full-stack web development',
        date: '2026-05-10',
        startTime: '09:00',
        endTime: '17:00',
        location: 'Computer Lab',
        capacity: 30,
        registered: 25,
        category: 'Workshop',
        status: 'upcoming',
    },
];
describe('EventsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(eventService.getUpcomingEvents).mockResolvedValue(mockUpcomingEvents);
        vi.mocked(eventService.getRegisteredEvents).mockResolvedValue(mockRegisteredEvents);
    });
    it('displays upcoming events with details (Requirement 6.1, 6.2)', async () => {
        render(_jsx(EventsPage, {}));
        await waitFor(() => {
            expect(screen.getByText('AI Workshop')).toBeInTheDocument();
        });
        // Verify event details are shown
        expect(screen.getByText('AI Workshop')).toBeInTheDocument();
        expect(screen.getByText(/Learn about artificial intelligence/)).toBeInTheDocument();
        expect(screen.getByText(/Room 301/)).toBeInTheDocument();
        expect(screen.getByText(/20 \/ 50 slots available/)).toBeInTheDocument();
    });
    it('shows full badge when event capacity is reached', async () => {
        render(_jsx(EventsPage, {}));
        await waitFor(() => {
            expect(screen.getByText('Cybersecurity Seminar')).toBeInTheDocument();
        });
        // The full event should show "Full" badge
        expect(screen.getByText('Full')).toBeInTheDocument();
    });
    it('displays registered events in separate tab (Requirement 6.4)', async () => {
        render(_jsx(EventsPage, {}));
        await waitFor(() => {
            expect(screen.getByText('AI Workshop')).toBeInTheDocument();
        });
        // Click on registered tab
        const registeredTab = screen.getByText(/My Registrations/);
        fireEvent.click(registeredTab);
        await waitFor(() => {
            expect(screen.getByText('Web Development Bootcamp')).toBeInTheDocument();
        });
        // Verify registered badge is shown
        expect(screen.getByText('Registered')).toBeInTheDocument();
    });
    it('opens event detail modal when event is clicked', async () => {
        render(_jsx(EventsPage, {}));
        await waitFor(() => {
            expect(screen.getByText('AI Workshop')).toBeInTheDocument();
        });
        // Click on an event
        fireEvent.click(screen.getByText('AI Workshop'));
        // Modal should open with detailed information
        await waitFor(() => {
            expect(screen.getAllByText('AI Workshop')).toHaveLength(2); // One in list, one in modal
        });
    });
    it('allows registration for available events (Requirement 6.3)', async () => {
        vi.mocked(eventService.registerForEvent).mockResolvedValue({ success: true });
        render(_jsx(EventsPage, {}));
        await waitFor(() => {
            expect(screen.getByText('AI Workshop')).toBeInTheDocument();
        });
        // Click on an event to open modal
        fireEvent.click(screen.getByText('AI Workshop'));
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
        });
        // Click register button
        const registerButton = screen.getByRole('button', { name: /Register/i });
        fireEvent.click(registerButton);
        await waitFor(() => {
            expect(eventService.registerForEvent).toHaveBeenCalledWith('1');
        });
    });
    it('disables registration for full events', async () => {
        render(_jsx(EventsPage, {}));
        await waitFor(() => {
            expect(screen.getByText('Cybersecurity Seminar')).toBeInTheDocument();
        });
        // Click on full event
        fireEvent.click(screen.getByText('Cybersecurity Seminar'));
        await waitFor(() => {
            const registerButton = screen.getByRole('button', { name: /Event Full/i });
            expect(registerButton).toBeDisabled();
        });
    });
    it('shows empty state when no events are available', async () => {
        vi.mocked(eventService.getUpcomingEvents).mockResolvedValue([]);
        vi.mocked(eventService.getRegisteredEvents).mockResolvedValue([]);
        render(_jsx(EventsPage, {}));
        await waitFor(() => {
            expect(screen.getByText('No upcoming events at the moment')).toBeInTheDocument();
        });
    });
});
