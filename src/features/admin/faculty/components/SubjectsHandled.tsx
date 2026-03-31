import type { SubjectHandled } from '../types';

interface Props {
  subjects: SubjectHandled[];
}

export function SubjectsHandled({ subjects }: Props) {
  if (subjects.length === 0)
    return <p className="text-gray-500 text-sm">No subjects assigned.</p>;

  const totalUnits = subjects.reduce((sum, s) => sum + s.units, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
          Teaching Load: {totalUnits} units
        </span>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3">Code</th>
              <th className="text-left px-4 py-3">Subject</th>
              <th className="text-center px-4 py-3">Units</th>
              <th className="text-center px-4 py-3">Program</th>
              <th className="text-center px-4 py-3">Year</th>
              <th className="text-center px-4 py-3">Section</th>
              <th className="text-left px-4 py-3">Term</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-gray-700">{s.code}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                <td className="px-4 py-3 text-center text-gray-700">{s.units}</td>
                <td className="px-4 py-3 text-center text-gray-700">{s.program}</td>
                <td className="px-4 py-3 text-center text-gray-700">{s.yearLevel}</td>
                <td className="px-4 py-3 text-center text-gray-700">{s.section}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{s.semester} {s.schoolYear}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
