import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          fontFamily: 'system-ui, sans-serif',
          maxWidth: '600px',
          margin: '100px auto'
        }}>
          <h1 style={{ color: '#dc2626', marginBottom: '16px' }}>Something went wrong</h1>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            The application encountered an error. Please refresh the page or contact support if the problem persists.
          </p>
          <details style={{ 
            textAlign: 'left', 
            background: '#f3f4f6', 
            padding: '16px', 
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '8px' }}>
              Error Details
            </summary>
            <pre style={{ 
              fontSize: '12px', 
              overflow: 'auto',
              color: '#dc2626'
            }}>
              {this.state.error?.toString()}
              {'\n\n'}
              {this.state.error?.stack}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#ea580c',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
