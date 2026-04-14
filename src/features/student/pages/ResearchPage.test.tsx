import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ResearchPage } from './ResearchPage';

// Mock the research service
vi.mock('@/services/api/researchService', () => ({
  researchService: {
    getOpportunities: vi.fn().mockResolvedValue([]),
    applyForOpportunity: vi.fn().mockResolvedValue({}),
  },
}));

describe('ResearchPage', () => {
  it('renders the research opportunities page', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ResearchPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getAllByText('Research Opportunities').length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText(/search by title/i)).toBeInTheDocument();
  });

  it('displays filter button', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ResearchPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
  });

  it('displays explore and apply message', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ResearchPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/explore and apply for ccs research projects/i)).toBeInTheDocument();
  });
});
