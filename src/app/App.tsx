import { AppProviders } from './providers';
import { AppRoutes } from './routes';

function App() {
  return (
    <AppProviders>
      {/* Tailwind CSS Test - Custom Colors */}
      <div className="hidden">
        <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded">
          Primary Button
        </button>
        <span className="text-secondary">Secondary Text</span>
      </div>
      <AppRoutes />
    </AppProviders>
  );
}

export default App;
