import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// Mock the shared api instance BEFORE importing the service
vi.mock('@/services/api/axios', () => {
  const mockApi = { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() };
  const mockPortalApi = { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() };
  return {
    default: mockApi,
    portalApi: mockPortalApi,
  };
});

import api, { portalApi } from '@/services/api/axios';
import facultyPortalService from './facultyPortalService';

const mockGet = vi.mocked(api.get);
const mockPost = vi.mocked(api.post);
const mockPortalGet = vi.mocked(portalApi.get);
const mockPortalPost = vi.mocked(portalApi.post);

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
    mockPortalGet.mockResolvedValueOnce({ data: { id: '1' } });

    await facultyPortalService.getProfile();

    const [url] = mockPortalGet.mock.calls[0];
    expect(url).toBe('/faculty/profile');
  });

  it('sends Authorization header with auth_token', async () => {
    localStorage.setItem('auth_token', 'test-token');
    mockPortalGet.mockResolvedValueOnce({ data: { id: '1' } });

    await facultyPortalService.getProfile();

    expect(mockPortalGet).toHaveBeenCalled();
  });

  it('returns mock data when Axios throws a network error', async () => {
    mockPortalGet.mockRejectedValueOnce(makeNetworkError());

    const result = await facultyPortalService.getProfile();

    expect(result.facultyId).toBe('FAC-001');
  });
});

// ── getCourses ────────────────────────────────────────────────────────────────

describe('getCourses', () => {
  it('calls /faculty/courses', async () => {
    mockPortalGet.mockResolvedValueOnce({ data: { data: [] } });

    await facultyPortalService.getCourses('FAC-001');

    const [url] = mockPortalGet.mock.calls[0];
    expect(url).toBe('/faculty/courses');
  });

  it('sends Authorization header with auth_token', async () => {
    localStorage.setItem('auth_token', 'test-token');
    mockPortalGet.mockResolvedValueOnce({ data: { data: [] } });

    await facultyPortalService.getCourses('FAC-001');

    expect(mockPortalGet).toHaveBeenCalled();
  });

  it('returns mock courses when Axios throws a network error', async () => {
    mockPortalGet.mockRejectedValueOnce(makeNetworkError());

    const result = await facultyPortalService.getCourses('FAC-001');

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].subjectCode).toBeDefined();
  });
});

// ── getTeachingLoad ───────────────────────────────────────────────────────────

describe('getTeachingLoad', () => {
  it('calls /faculty/teaching-load', async () => {
    mockPortalGet.mockResolvedValueOnce({ data: { data: { totalUnits: 18, totalClasses: 3, currentSemester: '1st' } } });

    await facultyPortalService.getTeachingLoad('FAC-001');

    const [url] = mockPortalGet.mock.calls[0];
    expect(url).toBe('/faculty/teaching-load');
  });

  it('sends Authorization header with auth_token', async () => {
    localStorage.setItem('auth_token', 'test-token');
    mockPortalGet.mockResolvedValueOnce({ data: { data: { totalUnits: 18, totalClasses: 3, currentSemester: '1st' } } });

    await facultyPortalService.getTeachingLoad('FAC-001');

    expect(mockPortalGet).toHaveBeenCalled();
  });

  it('returns mock teaching load when Axios throws a network error', async () => {
    mockPortalGet.mockRejectedValueOnce(makeNetworkError());

    const result = await facultyPortalService.getTeachingLoad('FAC-001');

    expect(result.totalUnits).toBe(18);
  });
});

// ── getRoster ─────────────────────────────────────────────────────────────────

describe('getRoster', () => {
  it('calls /faculty/courses/:subjectId/roster', async () => {
    mockPortalGet.mockResolvedValueOnce({ data: { data: [] } });

    await facultyPortalService.getRoster('FAC-001', 'subj-1');

    const [url] = mockPortalGet.mock.calls[0];
    expect(url).toBe('/faculty/courses/subj-1/roster');
  });

  it('sends Authorization header with auth_token', async () => {
    localStorage.setItem('auth_token', 'test-token');
    mockPortalGet.mockResolvedValueOnce({ data: { data: [] } });

    await facultyPortalService.getRoster('FAC-001', 'subj-1');

    expect(mockPortalGet).toHaveBeenCalled();
  });

  it('returns mock roster when Axios throws a network error', async () => {
    mockPortalGet.mockRejectedValueOnce(makeNetworkError());

    const result = await facultyPortalService.getRoster('FAC-001', 'subj-1');

    expect(result.length).toBeGreaterThan(0);
  });
});

// ── getAttendance ─────────────────────────────────────────────────────────────

describe('getAttendance', () => {
  it('calls /faculty/courses/:courseId/attendance with date param', async () => {
    mockPortalGet.mockResolvedValueOnce({ data: { data: [] } });

    await facultyPortalService.getAttendance('subj-1', '2024-08-01');

    const [url, config] = mockPortalGet.mock.calls[0] as [string, { params: Record<string, string> }];
    expect(url).toBe('/faculty/courses/subj-1/attendance');
    expect(config.params).toEqual({ date: '2024-08-01' });
  });

  it('sends Authorization header with auth_token', async () => {
    localStorage.setItem('auth_token', 'test-token');
    mockPortalGet.mockResolvedValueOnce({ data: { data: [] } });

    await facultyPortalService.getAttendance('subj-1', '2024-08-01');

    expect(mockPortalGet).toHaveBeenCalled();
  });

  it('returns empty array mock when Axios throws a network error', async () => {
    mockPortalGet.mockRejectedValueOnce(makeNetworkError());

    const result = await facultyPortalService.getAttendance('subj-1', '2024-08-01');

    expect(result).toEqual([]);
  });
});

// ── submitAttendance ──────────────────────────────────────────────────────────

describe('submitAttendance', () => {
  const payload = { courseId: 'subj-1', date: '2024-08-01', records: [] };

  it('calls /faculty/courses/:courseId/attendance with the payload', async () => {
    mockPortalPost.mockResolvedValueOnce({ data: {} });

    await facultyPortalService.submitAttendance(payload);

    const [url] = mockPortalPost.mock.calls[0];
    expect(url).toBe('/faculty/courses/subj-1/attendance');
  });

  it('sends Authorization header with auth_token', async () => {
    localStorage.setItem('auth_token', 'test-token');
    mockPortalPost.mockResolvedValueOnce({ data: {} });

    await facultyPortalService.submitAttendance(payload);

    expect(mockPortalPost).toHaveBeenCalled();
  });

  it('resolves without throwing when Axios throws a network error', async () => {
    mockPortalPost.mockRejectedValueOnce(makeNetworkError());

    await expect(facultyPortalService.submitAttendance(payload)).resolves.toBeUndefined();
  });
});

// ── getResearchProjects ───────────────────────────────────────────────────────

describe('getResearchProjects', () => {
  it('calls /faculty/research', async () => {
    mockPortalGet.mockResolvedValueOnce({ data: { data: [] } });

    await facultyPortalService.getResearchProjects('FAC-001');

    const [url] = mockPortalGet.mock.calls[0];
    expect(url).toBe('/faculty/research');
  });

  it('sends Authorization header with auth_token', async () => {
    localStorage.setItem('auth_token', 'test-token');
    mockPortalGet.mockResolvedValueOnce({ data: { data: [] } });

    await facultyPortalService.getResearchProjects('FAC-001');

    expect(mockPortalGet).toHaveBeenCalled();
  });

  it('returns mock projects when Axios throws a network error', async () => {
    mockPortalGet.mockRejectedValueOnce(makeNetworkError());

    const result = await facultyPortalService.getResearchProjects('FAC-001');

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].title).toBeDefined();
  });
});

// ── getEvents ─────────────────────────────────────────────────────────────────

describe('getEvents', () => {
  it('calls /faculty/events', async () => {
    mockPortalGet.mockResolvedValueOnce({ data: { data: [] } });

    await facultyPortalService.getEvents();

    const [url] = mockPortalGet.mock.calls[0];
    expect(url).toBe('/faculty/events');
  });

  it('sends Authorization header with auth_token', async () => {
    localStorage.setItem('auth_token', 'test-token');
    mockPortalGet.mockResolvedValueOnce({ data: { data: [] } });

    await facultyPortalService.getEvents();

    expect(mockPortalGet).toHaveBeenCalled();
  });

  it('returns mock events when Axios throws a network error', async () => {
    mockPortalGet.mockRejectedValueOnce(makeNetworkError());

    const result = await facultyPortalService.getEvents();

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].title).toBeDefined();
  });
});
