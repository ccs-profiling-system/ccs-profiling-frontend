import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// Mock the shared api instance BEFORE importing the service
vi.mock('@/services/api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import api from '@/services/api/axios';
import facultyPortalService from './facultyPortalService';

const mockGet = vi.mocked(api.get);
const mockPost = vi.mocked(api.post);

/** Creates an Axios-compatible network error (no response, isAxiosError = true) */
function makeNetworkError(): Error {
  const err = new Error('Network Error') as Error & { isAxiosError: boolean };
  err.isAxiosError = true;
  // Patch axios.isAxiosError to recognise our fake error
  vi.spyOn(axios, 'isAxiosError').mockImplementation((e) => (e as typeof err).isAxiosError === true);
  return err;
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

// ── login ─────────────────────────────────────────────────────────────────────

describe('login', () => {
  it('calls /auth/login with email and password', async () => {
    const mockData = { token: 'tok', user: { id: '1' } };
    mockPost.mockResolvedValueOnce({ data: mockData });

    await facultyPortalService.login('a@b.com', 'pass');

    expect(mockPost).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'pass' });
  });

  it('returns mock data when Axios throws a network error', async () => {
    mockPost.mockRejectedValueOnce(makeNetworkError());

    const result = await facultyPortalService.login('a@b.com', 'pass');

    expect(result.token).toBe('mock-faculty-token');
    expect(result.user.email).toBe('a@b.com');
  });
});

// ── getProfile ────────────────────────────────────────────────────────────────

describe('getProfile', () => {
  it('calls /faculty/profile', async () => {
    mockGet.mockResolvedValueOnce({ data: { id: '1' } });

    await facultyPortalService.getProfile();

    expect(mockGet).toHaveBeenCalledWith('/faculty/profile', expect.any(Object));
    const [url] = mockGet.mock.calls[0];
    expect(url).toBe('/faculty/profile');
  });

  it('sends Authorization header with facultyToken', async () => {
    localStorage.setItem('facultyToken', 'test-token');
    mockGet.mockResolvedValueOnce({ data: { id: '1' } });

    await facultyPortalService.getProfile();

    const config = mockGet.mock.calls[0][1] as { headers: Record<string, string> };
    expect(config.headers.Authorization).toBe('Bearer test-token');
  });

  it('returns mock data when Axios throws a network error', async () => {
    mockGet.mockRejectedValueOnce(makeNetworkError());

    const result = await facultyPortalService.getProfile();

    expect(result.facultyId).toBe('FAC-001');
  });
});

// ── getCourses ────────────────────────────────────────────────────────────────

describe('getCourses', () => {
  it('calls /admin/faculty/:facultyId/subjects', async () => {
    mockGet.mockResolvedValueOnce({ data: [] });

    await facultyPortalService.getCourses('FAC-001');

    const [url] = mockGet.mock.calls[0];
    expect(url).toBe('/admin/faculty/FAC-001/subjects');
  });

  it('sends Authorization header with facultyToken', async () => {
    localStorage.setItem('facultyToken', 'test-token');
    mockGet.mockResolvedValueOnce({ data: [] });

    await facultyPortalService.getCourses('FAC-001');

    const config = mockGet.mock.calls[0][1] as { headers: Record<string, string> };
    expect(config.headers.Authorization).toBe('Bearer test-token');
  });

  it('returns mock courses when Axios throws a network error', async () => {
    mockGet.mockRejectedValueOnce(makeNetworkError());

    const result = await facultyPortalService.getCourses('FAC-001');

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].subjectCode).toBeDefined();
  });
});

// ── getTeachingLoad ───────────────────────────────────────────────────────────

describe('getTeachingLoad', () => {
  it('calls /admin/faculty/:facultyId/teaching-load', async () => {
    mockGet.mockResolvedValueOnce({ data: { totalUnits: 18, totalClasses: 3, currentSemester: '1st' } });

    await facultyPortalService.getTeachingLoad('FAC-001');

    const [url] = mockGet.mock.calls[0];
    expect(url).toBe('/admin/faculty/FAC-001/teaching-load');
  });

  it('sends Authorization header with facultyToken', async () => {
    localStorage.setItem('facultyToken', 'test-token');
    mockGet.mockResolvedValueOnce({ data: { totalUnits: 18, totalClasses: 3, currentSemester: '1st' } });

    await facultyPortalService.getTeachingLoad('FAC-001');

    const config = mockGet.mock.calls[0][1] as { headers: Record<string, string> };
    expect(config.headers.Authorization).toBe('Bearer test-token');
  });

  it('returns mock teaching load when Axios throws a network error', async () => {
    mockGet.mockRejectedValueOnce(makeNetworkError());

    const result = await facultyPortalService.getTeachingLoad('FAC-001');

    expect(result.totalUnits).toBe(18);
  });
});

// ── getRoster ─────────────────────────────────────────────────────────────────

describe('getRoster', () => {
  it('calls /faculty/courses/:subjectId/roster', async () => {
    mockGet.mockResolvedValueOnce({ data: [] });

    await facultyPortalService.getRoster('FAC-001', 'subj-1');

    const [url] = mockGet.mock.calls[0];
    expect(url).toBe('/faculty/courses/subj-1/roster');
  });

  it('sends Authorization header with facultyToken', async () => {
    localStorage.setItem('facultyToken', 'test-token');
    mockGet.mockResolvedValueOnce({ data: [] });

    await facultyPortalService.getRoster('FAC-001', 'subj-1');

    const config = mockGet.mock.calls[0][1] as { headers: Record<string, string> };
    expect(config.headers.Authorization).toBe('Bearer test-token');
  });

  it('returns mock roster when Axios throws a network error', async () => {
    mockGet.mockRejectedValueOnce(makeNetworkError());

    const result = await facultyPortalService.getRoster('FAC-001', 'subj-1');

    expect(result.length).toBeGreaterThan(0);
  });
});

// ── getAttendance ─────────────────────────────────────────────────────────────

describe('getAttendance', () => {
  it('calls /faculty/attendance with courseId and date params', async () => {
    mockGet.mockResolvedValueOnce({ data: [] });

    await facultyPortalService.getAttendance('subj-1', '2024-08-01');

    const [url, config] = mockGet.mock.calls[0] as [string, { params: Record<string, string> }];
    expect(url).toBe('/faculty/attendance');
    expect(config.params).toEqual({ courseId: 'subj-1', date: '2024-08-01' });
  });

  it('sends Authorization header with facultyToken', async () => {
    localStorage.setItem('facultyToken', 'test-token');
    mockGet.mockResolvedValueOnce({ data: [] });

    await facultyPortalService.getAttendance('subj-1', '2024-08-01');

    const config = mockGet.mock.calls[0][1] as { headers: Record<string, string> };
    expect(config.headers.Authorization).toBe('Bearer test-token');
  });

  it('returns empty array mock when Axios throws a network error', async () => {
    mockGet.mockRejectedValueOnce(makeNetworkError());

    const result = await facultyPortalService.getAttendance('subj-1', '2024-08-01');

    expect(result).toEqual([]);
  });
});

// ── submitAttendance ──────────────────────────────────────────────────────────

describe('submitAttendance', () => {
  const payload = { courseId: 'subj-1', date: '2024-08-01', records: [] };

  it('calls /faculty/attendance with the payload', async () => {
    mockPost.mockResolvedValueOnce({ data: {} });

    await facultyPortalService.submitAttendance(payload);

    const [url, body] = mockPost.mock.calls[0];
    expect(url).toBe('/faculty/attendance');
    expect(body).toEqual(payload);
  });

  it('sends Authorization header with facultyToken', async () => {
    localStorage.setItem('facultyToken', 'test-token');
    mockPost.mockResolvedValueOnce({ data: {} });

    await facultyPortalService.submitAttendance(payload);

    const config = mockPost.mock.calls[0][2] as { headers: Record<string, string> };
    expect(config.headers.Authorization).toBe('Bearer test-token');
  });

  it('resolves without throwing when Axios throws a network error', async () => {
    mockPost.mockRejectedValueOnce(makeNetworkError());

    await expect(facultyPortalService.submitAttendance(payload)).resolves.toBeUndefined();
  });
});

// ── getResearchProjects ───────────────────────────────────────────────────────

describe('getResearchProjects', () => {
  it('calls /admin/faculty/:facultyId/research', async () => {
    mockGet.mockResolvedValueOnce({ data: [] });

    await facultyPortalService.getResearchProjects('FAC-001');

    const [url] = mockGet.mock.calls[0];
    expect(url).toBe('/admin/faculty/FAC-001/research');
  });

  it('sends Authorization header with facultyToken', async () => {
    localStorage.setItem('facultyToken', 'test-token');
    mockGet.mockResolvedValueOnce({ data: [] });

    await facultyPortalService.getResearchProjects('FAC-001');

    const config = mockGet.mock.calls[0][1] as { headers: Record<string, string> };
    expect(config.headers.Authorization).toBe('Bearer test-token');
  });

  it('returns mock projects when Axios throws a network error', async () => {
    mockGet.mockRejectedValueOnce(makeNetworkError());

    const result = await facultyPortalService.getResearchProjects('FAC-001');

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].title).toBeDefined();
  });
});

// ── getEvents ─────────────────────────────────────────────────────────────────

describe('getEvents', () => {
  it('calls /admin/events', async () => {
    mockGet.mockResolvedValueOnce({ data: [] });

    await facultyPortalService.getEvents();

    const [url] = mockGet.mock.calls[0];
    expect(url).toBe('/admin/events');
  });

  it('sends Authorization header with facultyToken', async () => {
    localStorage.setItem('facultyToken', 'test-token');
    mockGet.mockResolvedValueOnce({ data: [] });

    await facultyPortalService.getEvents();

    const config = mockGet.mock.calls[0][1] as { headers: Record<string, string> };
    expect(config.headers.Authorization).toBe('Bearer test-token');
  });

  it('returns mock events when Axios throws a network error', async () => {
    mockGet.mockRejectedValueOnce(makeNetworkError());

    const result = await facultyPortalService.getEvents();

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].title).toBeDefined();
  });
});
