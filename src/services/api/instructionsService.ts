import axios from 'axios';
import api from './axios';
import type { 
  Curriculum, 
  Subject, 
  Syllabus,
  Lesson,
  CreateCurriculumDTO, 
  UpdateCurriculumDTO,
  CreateSubjectDTO,
  UpdateSubjectDTO,
  CreateSyllabusDTO,
  UpdateSyllabusDTO,
  CreateLessonDTO,
  UpdateLessonDTO,
  CurriculumFilters,
  SubjectFilters
} from '@/types/instructions';

/**
 * Instructions Service
 * Manages both Curriculum and Subjects
 * 
 * Backend endpoints:
 * - /api/v1/admin/instructions (legacy individual instructions)
 * - /api/v1/admin/curriculum (curriculum management)
 * - /api/v1/admin/subjects (detailed subject management)
 */

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

// Legacy instruction types (for backward compatibility)
export interface Instruction {
  id: string;
  subject_code: string;
  subject_name: string;
  description?: string;
  credits: number;
  curriculum_year: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface InstructionFilters {
  search?: string;
  subject_code?: string;
  curriculum_year?: string;
  page?: number;
  limit?: number;
}

export interface CreateInstructionDTO {
  subject_code: string;
  subject_name: string;
  description?: string;
  credits: number;
  curriculum_year: string;
}

export interface UpdateInstructionDTO {
  subject_code?: string;
  subject_name?: string;
  description?: string;
  credits?: number;
  curriculum_year?: string;
}

// Helper function to unwrap API responses
function unwrap<T>(raw: T | ApiResponse<T>): T {
  if (raw !== null && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as ApiResponse<T>).data;
  }
  return raw as T;
}

// Mock data for development - declared in correct order to avoid reference errors
const MOCK_CURRICULUM: Curriculum[] = [
  {
    id: '1',
    code: 'BSCS-2024',
    name: 'Bachelor of Science in Computer Science',
    description: 'A comprehensive program in computer science covering programming, algorithms, and software development.',
    program: 'Computer Science',
    year: '2024',
    totalUnits: 120,
    status: 'active',
    effectiveDate: '2024-08-01',
    subjects: [],
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    code: 'BSIT-2024',
    name: 'Bachelor of Science in Information Technology',
    description: 'A program focused on information systems, networking, and technology management.',
    program: 'Information Technology',
    year: '2024',
    totalUnits: 120,
    status: 'active',
    effectiveDate: '2024-08-01',
    subjects: [],
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
];

const MOCK_LESSONS: Lesson[] = [
  {
    id: '1',
    subject_id: '1',
    week: 1,
    title: 'Introduction to Programming Concepts',
    description: 'Overview of programming, algorithms, and problem-solving techniques',
    type: 'lecture',
    contentType: 'file',
    fileUrl: '/mock/lessons/cs101-week1.pdf',
    fileName: 'Week 1 - Introduction to Programming.pdf',
    fileSize: 2457600, // 2.4 MB
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    subject_id: '1',
    week: 2,
    title: 'Variables and Data Types',
    description: 'Understanding variables, data types, and basic operations in Python',
    type: 'lecture',
    contentType: 'link',
    externalLink: 'https://www.youtube.com/watch?v=example',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '3',
    subject_id: '2',
    week: 1,
    title: 'Introduction to Data Structures',
    description: 'Overview of data structures and their importance in programming',
    type: 'lecture',
    contentType: 'file',
    fileUrl: '/mock/lessons/cs102-week1.pptx',
    fileName: 'Week 1 - Data Structures Overview.pptx',
    fileSize: 3145728, // 3 MB
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  }
];

const MOCK_SYLLABUS: Syllabus[] = [
  {
    id: '1',
    subject_id: '1',
    title: 'CS101 - Introduction to Programming Syllabus',
    description: 'Comprehensive syllabus for Introduction to Programming course',
    contentType: 'file',
    fileUrl: '/mock/syllabus/cs101-syllabus.pdf',
    fileName: 'CS101 Syllabus - Fall 2024.pdf',
    fileSize: 524288, // 512 KB
    fileType: 'application/pdf',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  }
];

const MOCK_SUBJECTS: Subject[] = [
  {
    id: '1',
    code: 'CS101',
    name: 'Introduction to Programming',
    units: 3,
    semester: 1,
    yearLevel: 1,
    description: 'Fundamental concepts of programming using Python. Covers variables, control structures, functions, and basic data structures.',
    prerequisites: [],
    corequisites: [],
    type: 'core',
    hours: { lecture: 2, laboratory: 1 },
    objectives: [
      'Understand basic programming concepts and terminology',
      'Write simple programs using Python',
      'Apply problem-solving techniques to programming challenges',
      'Debug and test programs effectively'
    ],
    topics: [
      'Variables and Data Types',
      'Control Structures',
      'Functions',
      'Lists and Dictionaries',
      'File I/O',
      'Error Handling'
    ],
    curriculum_id: '1',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    code: 'CS102',
    name: 'Data Structures and Algorithms',
    units: 3,
    semester: 2,
    yearLevel: 1,
    description: 'Study of fundamental data structures and algorithms. Covers arrays, linked lists, stacks, queues, trees, and basic sorting algorithms.',
    prerequisites: ['CS101'],
    corequisites: [],
    type: 'core',
    hours: { lecture: 2, laboratory: 1 },
    objectives: [
      'Understand and implement basic data structures',
      'Analyze algorithm complexity using Big O notation',
      'Choose appropriate data structures for specific problems',
      'Implement common sorting and searching algorithms'
    ],
    topics: [
      'Arrays and Dynamic Arrays',
      'Linked Lists',
      'Stacks and Queues',
      'Trees and Binary Search Trees',
      'Hash Tables',
      'Sorting Algorithms',
      'Algorithm Analysis'
    ],
    curriculum_id: '1',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '3',
    code: 'MATH101',
    name: 'Calculus I',
    units: 3,
    semester: 1,
    yearLevel: 1,
    description: 'Introduction to differential and integral calculus. Covers limits, derivatives, and basic integration.',
    prerequisites: [],
    corequisites: [],
    type: 'general_education',
    hours: { lecture: 3, laboratory: 0 },
    objectives: [
      'Understand the concept of limits and continuity',
      'Calculate derivatives using various rules',
      'Apply derivatives to solve optimization problems',
      'Understand and calculate basic integrals'
    ],
    topics: [
      'Limits and Continuity',
      'Derivative Rules',
      'Applications of Derivatives',
      'Basic Integration',
      'Fundamental Theorem of Calculus'
    ],
    curriculum_id: '1',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
];

const MOCK_INSTRUCTIONS: Instruction[] = [
  {
    id: '1',
    subject_code: 'CS101',
    subject_name: 'Introduction to Programming',
    credits: 3,
    curriculum_year: '2024',
    description: 'Fundamental concepts of programming using Python',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    subject_code: 'CS102',
    subject_name: 'Data Structures and Algorithms',
    credits: 3,
    curriculum_year: '2024',
    description: 'Study of fundamental data structures and algorithms',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
];

class InstructionsService {
  // ===== CURRICULUM MANAGEMENT =====
  
  async getCurriculum(filters?: CurriculumFilters): Promise<ApiResponse<Curriculum[]>> {
    try {
      const response = await api.get<ApiResponse<Curriculum[]>>('/admin/curriculum', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock curriculum data');
        
        let filteredData = [...MOCK_CURRICULUM];
        
        if (filters?.program) {
          filteredData = filteredData.filter(c => 
            c.program.toLowerCase().includes(filters.program!.toLowerCase())
          );
        }
        if (filters?.year) {
          filteredData = filteredData.filter(c => c.year === filters.year);
        }
        if (filters?.status) {
          filteredData = filteredData.filter(c => c.status === filters.status);
        }
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          filteredData = filteredData.filter(c =>
            c.name.toLowerCase().includes(searchLower) ||
            c.code.toLowerCase().includes(searchLower) ||
            c.program.toLowerCase().includes(searchLower)
          );
        }
        
        return {
          success: true,
          data: filteredData,
          meta: {
            page: filters?.page || 1,
            limit: filters?.limit || 20,
            total: filteredData.length,
            totalPages: Math.ceil(filteredData.length / (filters?.limit || 20)),
          },
        };
      }
      throw error;
    }
  }

  async getCurriculumById(id: string): Promise<Curriculum> {
    try {
      const response = await api.get<ApiResponse<Curriculum>>(`/admin/curriculum/${id}`);
      return unwrap(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock curriculum data');
        const curriculum = MOCK_CURRICULUM.find(c => c.id === id);
        if (!curriculum) {
          throw new Error('Curriculum not found');
        }
        curriculum.subjects = MOCK_SUBJECTS.filter(s => s.curriculum_id === id);
        return curriculum;
      }
      throw error;
    }
  }

  async createCurriculum(data: CreateCurriculumDTO): Promise<Curriculum> {
    try {
      const response = await api.post<ApiResponse<Curriculum>>('/admin/curriculum', data);
      return unwrap(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock create');
        const newCurriculum: Curriculum = {
          id: Date.now().toString(),
          ...data,
          totalUnits: 0,
          subjects: [],
          status: data.status || 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        MOCK_CURRICULUM.push(newCurriculum);
        return newCurriculum;
      }
      throw error;
    }
  }

  async updateCurriculum(id: string, data: UpdateCurriculumDTO): Promise<Curriculum> {
    try {
      const response = await api.put<ApiResponse<Curriculum>>(`/admin/curriculum/${id}`, data);
      return unwrap(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock update');
        const index = MOCK_CURRICULUM.findIndex(c => c.id === id);
        if (index === -1) {
          throw new Error('Curriculum not found');
        }
        MOCK_CURRICULUM[index] = {
          ...MOCK_CURRICULUM[index],
          ...data,
          updated_at: new Date().toISOString(),
        };
        return MOCK_CURRICULUM[index];
      }
      throw error;
    }
  }

  async deleteCurriculum(id: string): Promise<void> {
    try {
      await api.delete(`/admin/curriculum/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock delete');
        const index = MOCK_CURRICULUM.findIndex(c => c.id === id);
        if (index !== -1) {
          MOCK_CURRICULUM.splice(index, 1);
        }
        return;
      }
      throw error;
    }
  }

  // ===== SUBJECT MANAGEMENT =====

  async getSubjects(filters?: SubjectFilters): Promise<ApiResponse<Subject[]>> {
    try {
      const response = await api.get<ApiResponse<Subject[]>>('/admin/subjects', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock subjects data');
        
        let filteredData = [...MOCK_SUBJECTS];
        
        if (filters?.curriculum_id) {
          filteredData = filteredData.filter(s => s.curriculum_id === filters.curriculum_id);
        }
        if (filters?.semester) {
          filteredData = filteredData.filter(s => s.semester === filters.semester);
        }
        if (filters?.yearLevel) {
          filteredData = filteredData.filter(s => s.yearLevel === filters.yearLevel);
        }
        if (filters?.type) {
          filteredData = filteredData.filter(s => s.type === filters.type);
        }
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          filteredData = filteredData.filter(s =>
            s.name.toLowerCase().includes(searchLower) ||
            s.code.toLowerCase().includes(searchLower) ||
            s.description?.toLowerCase().includes(searchLower)
          );
        }
        
        return {
          success: true,
          data: filteredData,
          meta: {
            page: filters?.page || 1,
            limit: filters?.limit || 20,
            total: filteredData.length,
            totalPages: Math.ceil(filteredData.length / (filters?.limit || 20)),
          },
        };
      }
      throw error;
    }
  }

  async getSubjectById(id: string): Promise<Subject> {
    try {
      const response = await api.get<ApiResponse<Subject>>(`/admin/subjects/${id}`);
      return unwrap(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock subject data');
        const subject = MOCK_SUBJECTS.find(s => s.id === id);
        if (!subject) {
          throw new Error('Subject not found');
        }
        return subject;
      }
      throw error;
    }
  }

  async createSubject(data: CreateSubjectDTO): Promise<Subject> {
    try {
      const response = await api.post<ApiResponse<Subject>>('/admin/subjects', data);
      return unwrap(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock create');
        const newSubject: Subject = {
          id: Date.now().toString(),
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        MOCK_SUBJECTS.push(newSubject);
        return newSubject;
      }
      throw error;
    }
  }

  async updateSubject(id: string, data: UpdateSubjectDTO): Promise<Subject> {
    try {
      const response = await api.put<ApiResponse<Subject>>(`/admin/subjects/${id}`, data);
      return unwrap(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock update');
        const index = MOCK_SUBJECTS.findIndex(s => s.id === id);
        if (index === -1) {
          throw new Error('Subject not found');
        }
        MOCK_SUBJECTS[index] = {
          ...MOCK_SUBJECTS[index],
          ...data,
          updated_at: new Date().toISOString(),
        };
        return MOCK_SUBJECTS[index];
      }
      throw error;
    }
  }

  async deleteSubject(id: string): Promise<void> {
    try {
      await api.delete(`/admin/subjects/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock delete');
        const index = MOCK_SUBJECTS.findIndex(s => s.id === id);
        if (index !== -1) {
          MOCK_SUBJECTS.splice(index, 1);
        }
        return;
      }
      throw error;
    }
  }

  // ===== SYLLABUS MANAGEMENT =====

  async getSyllabus(subjectId: string): Promise<Syllabus | null> {
    try {
      const response = await api.get<ApiResponse<Syllabus>>(`/admin/subjects/${subjectId}/syllabus`);
      return unwrap(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock syllabus data');
        const syllabus = MOCK_SYLLABUS.find(s => s.subject_id === subjectId);
        return syllabus || null;
      }
      throw error;
    }
  }

  async createSyllabus(subjectId: string, data: CreateSyllabusDTO): Promise<Syllabus> {
    try {
      const response = await api.post<ApiResponse<Syllabus>>(`/admin/subjects/${subjectId}/syllabus`, data);
      return unwrap(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock create');
        const newSyllabus: Syllabus = {
          id: Date.now().toString(),
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        MOCK_SYLLABUS.push(newSyllabus);
        return newSyllabus;
      }
      throw error;
    }
  }

  async updateSyllabus(subjectId: string, data: UpdateSyllabusDTO): Promise<Syllabus> {
    try {
      const response = await api.put<ApiResponse<Syllabus>>(`/admin/subjects/${subjectId}/syllabus`, data);
      return unwrap(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock update');
        const index = MOCK_SYLLABUS.findIndex(s => s.subject_id === subjectId);
        if (index === -1) {
          throw new Error('Syllabus not found');
        }
        MOCK_SYLLABUS[index] = {
          ...MOCK_SYLLABUS[index],
          ...data,
          subject_id: subjectId,
          updated_at: new Date().toISOString(),
        };
        return MOCK_SYLLABUS[index];
      }
      throw error;
    }
  }

  async deleteSyllabus(subjectId: string): Promise<void> {
    try {
      await api.delete(`/admin/subjects/${subjectId}/syllabus`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock delete');
        const index = MOCK_SYLLABUS.findIndex(s => s.subject_id === subjectId);
        if (index !== -1) {
          MOCK_SYLLABUS.splice(index, 1);
        }
        return;
      }
      throw error;
    }
  }

  // ===== LESSONS MANAGEMENT =====

  async getLessons(subjectId: string): Promise<Lesson[]> {
    try {
      const response = await api.get<ApiResponse<Lesson[]>>(`/admin/subjects/${subjectId}/lessons`);
      return unwrap(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock lessons data');
        return MOCK_LESSONS.filter(l => l.subject_id === subjectId).sort((a, b) => a.week - b.week);
      }
      throw error;
    }
  }

  async getLessonById(id: string): Promise<Lesson> {
    try {
      const response = await api.get<ApiResponse<Lesson>>(`/admin/lessons/${id}`);
      return unwrap(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock lesson data');
        const lesson = MOCK_LESSONS.find(l => l.id === id);
        if (!lesson) {
          throw new Error('Lesson not found');
        }
        return lesson;
      }
      throw error;
    }
  }

  async createLesson(subjectId: string, data: CreateLessonDTO): Promise<Lesson> {
    try {
      const response = await api.post<ApiResponse<Lesson>>(`/admin/subjects/${subjectId}/lessons`, data);
      return unwrap(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock create');
        const newLesson: Lesson = {
          id: Date.now().toString(),
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        MOCK_LESSONS.push(newLesson);
        return newLesson;
      }
      throw error;
    }
  }

  async updateLesson(id: string, data: UpdateLessonDTO): Promise<Lesson> {
    try {
      const response = await api.put<ApiResponse<Lesson>>(`/admin/lessons/${id}`, data);
      return unwrap(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock update');
        const index = MOCK_LESSONS.findIndex(l => l.id === id);
        if (index === -1) {
          throw new Error('Lesson not found');
        }
        const existingLesson = MOCK_LESSONS[index];
        MOCK_LESSONS[index] = {
          ...existingLesson,
          ...data,
          subject_id: existingLesson.subject_id,
          updated_at: new Date().toISOString(),
        };
        return MOCK_LESSONS[index];
      }
      throw error;
    }
  }

  async deleteLesson(id: string): Promise<void> {
    try {
      await api.delete(`/admin/lessons/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock delete');
        const index = MOCK_LESSONS.findIndex(l => l.id === id);
        if (index !== -1) {
          MOCK_LESSONS.splice(index, 1);
        }
        return;
      }
      throw error;
    }
  }

  // ===== LEGACY INSTRUCTIONS SUPPORT =====

  async getInstructions(filters?: InstructionFilters): Promise<ApiResponse<Instruction[]>> {
    try {
      const response = await api.get<ApiResponse<Instruction[]>>('/admin/instructions', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock instructions data');
        
        let filteredData = [...MOCK_INSTRUCTIONS];
        
        if (filters?.subject_code) {
          filteredData = filteredData.filter(i => 
            i.subject_code.toLowerCase().includes(filters.subject_code!.toLowerCase())
          );
        }
        if (filters?.curriculum_year) {
          filteredData = filteredData.filter(i => i.curriculum_year === filters.curriculum_year);
        }
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          filteredData = filteredData.filter(i =>
            i.subject_name.toLowerCase().includes(searchLower) ||
            i.subject_code.toLowerCase().includes(searchLower) ||
            i.description?.toLowerCase().includes(searchLower)
          );
        }
        
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedData = filteredData.slice(start, end);
        
        return {
          success: true,
          data: paginatedData,
          meta: {
            page,
            limit,
            total: filteredData.length,
            totalPages: Math.ceil(filteredData.length / limit),
          },
        };
      }
      throw error;
    }
  }

  async createInstruction(data: CreateInstructionDTO): Promise<Instruction> {
    try {
      const response = await api.post<ApiResponse<Instruction>>('/admin/instructions', data);
      return unwrap(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock create');
        const newInstruction: Instruction = {
          id: Date.now().toString(),
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        MOCK_INSTRUCTIONS.push(newInstruction);
        return newInstruction;
      }
      throw error;
    }
  }

  async updateInstruction(id: string, data: UpdateInstructionDTO): Promise<Instruction> {
    try {
      const response = await api.put<ApiResponse<Instruction>>(`/admin/instructions/${id}`, data);
      return unwrap(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock update');
        const index = MOCK_INSTRUCTIONS.findIndex(i => i.id === id);
        if (index === -1) {
          throw new Error('Instruction not found');
        }
        MOCK_INSTRUCTIONS[index] = {
          ...MOCK_INSTRUCTIONS[index],
          ...data,
          updated_at: new Date().toISOString(),
        };
        return MOCK_INSTRUCTIONS[index];
      }
      throw error;
    }
  }

  async deleteInstruction(id: string): Promise<void> {
    try {
      await api.delete(`/admin/instructions/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock delete');
        const index = MOCK_INSTRUCTIONS.findIndex(i => i.id === id);
        if (index !== -1) {
          MOCK_INSTRUCTIONS.splice(index, 1);
        }
        return;
      }
      throw error;
    }
  }

  // ===== STATISTICS AND EXPORTS =====

  async getStatistics(): Promise<{
    totalInstructions: number;
    totalCurriculumYears: number;
    totalCredits: number;
    instructionsByYear: Record<string, number>;
    totalCurriculum: number;
    totalSubjects: number;
    subjectsByType: Record<string, number>;
  }> {
    try {
      const response = await api.get('/admin/instructions/statistics');
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, calculating mock statistics');
        
        const years = new Set(MOCK_INSTRUCTIONS.map(i => i.curriculum_year));
        const instructionsByYear: Record<string, number> = {};
        years.forEach(year => {
          instructionsByYear[year] = MOCK_INSTRUCTIONS.filter(i => i.curriculum_year === year).length;
        });

        const subjectsByType: Record<string, number> = {};
        MOCK_SUBJECTS.forEach(subject => {
          subjectsByType[subject.type] = (subjectsByType[subject.type] || 0) + 1;
        });
        
        return {
          totalInstructions: MOCK_INSTRUCTIONS.length,
          totalCurriculumYears: years.size,
          totalCredits: MOCK_INSTRUCTIONS.reduce((sum, i) => sum + i.credits, 0),
          instructionsByYear,
          totalCurriculum: MOCK_CURRICULUM.length,
          totalSubjects: MOCK_SUBJECTS.length,
          subjectsByType,
        };
      }
      throw error;
    }
  }

  async exportToPDF(filters?: any): Promise<Blob> {
    try {
      const response = await api.get('/admin/instructions/export/pdf', {
        params: filters,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock PDF export');
        return new Blob(['Mock PDF content'], { type: 'application/pdf' });
      }
      throw error;
    }
  }

  async exportToExcel(filters?: any): Promise<Blob> {
    try {
      const response = await api.get('/admin/instructions/export/excel', {
        params: filters,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock Excel export');
        return new Blob(['Mock Excel content'], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
      }
      throw error;
    }
  }
}

export default new InstructionsService();
