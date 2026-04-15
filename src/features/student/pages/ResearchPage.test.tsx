import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ResearchPage } from './ResearchPage';

vi.mock('@/services/api/researchService', () => ({
  researchService: {
    getOpportunities: vi.fn().mockResolvedValue([]),
    applyForOpportunity: vi.fn().mockResolvedValue({}),
  },
}));

describe('ResearchPage', () => {
  it('renders the research involvement page heading', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ResearchPage />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Research Involvement')).toBeInTheDocument();
    });
  });

  it('displays the thesis/capstone section', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ResearchPage />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/my thesis \/ capstone project/i)).toBeInTheDocument();
    });
  });

  it('displays available research opportunities section when opportunities exist', async () => {
    const { researchService } = await import('@/services/api/researchService');
    vi.mocked(researchService.getOpportunities).mockResolvedValue([
      {
        id: '1',
        title: 'AI Research Project',
        description: 'A project on AI',
        faculty: 'Dr. Smith',
        facultyEmail: 'smith@ccs.edu',
        area: 'Machine Learning',
        requiredSkills: ['Python'],
        timeCommitment: '10 hrs/week',
        deadline: '2026-06-01',
        capacity: 5,
        applicants: 2,
        status: 'open',
      },
    ]);

    render(
      <BrowserRouter>
        <AuthProvider>
          <ResearchPage />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('AI Research Project')).toBeInTheDocument();
    });
  });
});
