import type { FacultySkill, FacultyAffiliation } from '../types';

interface Props {
  skills: FacultySkill[];
  affiliations: FacultyAffiliation[];
}

export function SkillsAffiliations({ skills, affiliations }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-semibold text-gray-700 mb-3">Skills & Expertise</h4>
        {skills.length === 0 ? (
          <p className="text-gray-500 text-sm">No skills recorded.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s.id} className={`px-3 py-1 rounded-full text-sm font-medium ${
                s.category === 'technical' ? 'bg-blue-100 text-blue-700' :
                s.category === 'expertise' ? 'bg-primary/10 text-primary' :
                'bg-green-100 text-green-700'
              }`}>
                {s.name}
              </span>
            ))}
          </div>
        )}
      </div>
      <div>
        <h4 className="font-semibold text-gray-700 mb-3">Affiliations</h4>
        {affiliations.length === 0 ? (
          <p className="text-gray-500 text-sm">No affiliations recorded.</p>
        ) : (
          <div className="space-y-2">
            {affiliations.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">{a.name}</p>
                  {a.role && <p className="text-xs text-gray-500">{a.role}</p>}
                </div>
                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">{a.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
