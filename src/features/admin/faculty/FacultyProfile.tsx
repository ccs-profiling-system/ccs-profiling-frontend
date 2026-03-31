import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, User } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import type { Faculty, SubjectHandled, FacultySkill, FacultyAffiliation, ResearchRecord, EventParticipation } from './types';
import { SubjectsHandled } from './components/SubjectsHandled';
import { SkillsAffiliations } from './components/SkillsAffiliations';
import { ResearchEvents } from './components/ResearchEvents';

const SAMPLE_FACULTY: Faculty = {
  id: '1', facultyId: 'FAC-001', firstName: 'Maria', lastName: 'Santos', middleName: 'Dela Cruz',
  email: 'msantos@ccs.edu.ph', phone: '09181234567', address: 'Cabuyao, Laguna',
  birthDate: '1985-03-20', gender: 'Female', position: 'Associate Professor',
  specialization: 'Software Engineering', department: 'CCS', employmentStatus: 'full_time',
};

const SAMPLE_SUBJECTS: SubjectHandled[] = [
  { id: '1', code: 'CS301', name: 'Data Structures', units: 3, program: 'BSCS', yearLevel: 2, section: 'A', semester: '1st Semester', schoolYear: '2023-2024' },
  { id: '2', code: 'CS401', name: 'Software Engineering', units: 3, program: 'BSCS', yearLevel: 3, section: 'B', semester: '1st Semester', schoolYear: '2023-2024' },
];

const SAMPLE_SKILLS: FacultySkill[] = [
  { id: '1', name: 'Software Architecture', category: 'expertise' },
  { id: '2', name: 'React', category: 'technical' },
  { id: '3', name: 'Leadership', category: 'soft' },
];

const SAMPLE_AFFILIATIONS: FacultyAffiliation[] = [
  { id: '1', name: 'Philippine Society of IT Educators', type: 'organization', role: 'Member' },
  { id: '2', name: 'Curriculum Committee', type: 'committee', role: 'Chair' },
];

const SAMPLE_RESEARCH: ResearchRecord[] = [
  { id: '1', title: 'AI in Education: A Philippine Perspective', status: 'published', year: '2023', description: 'Published in CHED-accredited journal.' },
];

const SAMPLE_EVENTS: EventParticipation[] = [
  { id: '1', name: 'Research Symposium 2024', role: 'Speaker', date: 'March 15, 2024' },
];

const STATUS_STYLES: Record<string, string> = {
  full_time: 'bg-green-100 text-green-700',
  part_time: 'bg-blue-100 text-blue-700',
  on_leave: 'bg-yellow-100 text-yellow-700',
  resigned: 'bg-red-100 text-red-700',
};

const TABS = ['Personal Info', 'Subjects Handled', 'Research & Events', 'Skills & Affiliations'];

export function FacultyProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const faculty = SAMPLE_FACULTY;

  return (
    <MainLayout title="Faculty">
      <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faculty Profile</h1>
          <p className="text-sm text-gray-500">{faculty.facultyId}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/faculty/${faculty.id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition text-sm"
          >
            <Edit className="w-4 h-4" /> Edit
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition text-sm">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-10 h-10 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {faculty.lastName}, {faculty.firstName} {faculty.middleName ?? ''}
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[faculty.employmentStatus]}`}>
              {faculty.employmentStatus.replace('_', ' ')}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>{faculty.position}</span>
            <span>{faculty.specialization}</span>
            <span>{faculty.department}</span>
            <span>{faculty.email}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 ${
                activeTab === i ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {[
                ['Faculty ID', faculty.facultyId],
                ['Full Name', `${faculty.firstName} ${faculty.middleName ?? ''} ${faculty.lastName}`],
                ['Email', faculty.email],
                ['Phone', faculty.phone ?? '—'],
                ['Gender', faculty.gender ?? '—'],
                ['Birth Date', faculty.birthDate ?? '—'],
                ['Address', faculty.address ?? '—'],
                ['Position', faculty.position],
                ['Specialization', faculty.specialization],
                ['Department', faculty.department],
              ].map(([label, value]) => (
                <div key={label} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="font-medium text-gray-800">{value}</p>
                </div>
              ))}
            </div>
          )}
          {activeTab === 1 && <SubjectsHandled subjects={SAMPLE_SUBJECTS} />}
          {activeTab === 2 && <ResearchEvents research={SAMPLE_RESEARCH} events={SAMPLE_EVENTS} />}
          {activeTab === 3 && <SkillsAffiliations skills={SAMPLE_SKILLS} affiliations={SAMPLE_AFFILIATIONS} />}
        </div>
      </div>
      </div>
    </MainLayout>
  );
}
