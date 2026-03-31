import type { ResearchRecord, EventParticipation } from '../types';

interface Props {
  research: ResearchRecord[];
  events: EventParticipation[];
}

export function ResearchEvents({ research, events }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-gray-700 mb-3">Research</h4>
        {research.length === 0 ? (
          <p className="text-gray-500 text-sm">No research records.</p>
        ) : (
          <div className="space-y-3">
            {research.map((r) => (
              <div key={r.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start justify-between mb-1">
                  <p className="font-medium text-gray-800">{r.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    r.status === 'published' ? 'bg-green-100 text-green-700' :
                    r.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{r.status}</span>
                </div>
                <p className="text-xs text-gray-500">{r.year}</p>
                {r.description && <p className="text-sm text-gray-600 mt-1">{r.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 mb-3">Event Participation</h4>
        {events.length === 0 ? (
          <p className="text-gray-500 text-sm">No event participation recorded.</p>
        ) : (
          <div className="space-y-2">
            {events.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{e.name}</p>
                  <p className="text-xs text-gray-500">{e.date}</p>
                </div>
                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">{e.role}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
