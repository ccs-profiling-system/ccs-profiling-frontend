import { AppProviders } from './providers';
import { AppRoutes } from './routes';
import { Suspense } from 'react';
import { LoadingFallback } from './LoadingFallback';

function App() {
  return (
    <AppProviders>
      <Suspense fallback={<LoadingFallback />}>
        <AppRoutes />
      </Suspense>
    </AppProviders>
  );
}

export default App;
