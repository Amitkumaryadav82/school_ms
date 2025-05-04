import { api } from './apiClient.js';

export interface Exam {
  id?: number;
  name: string;
  subject: string;
  grade: string;
  date: string;
  duration: number;
  maxMarks: number;
  passingMarks: number;
  description?: string;
}

export interface ExamResult {
  examId: number;
  studentId: string;
  marksObtained: number;
  remarks?: string;
  status: 'PASS' | 'FAIL';
}

export interface ExamSummary {
  totalStudents: number;
  passedStudents: number;
  failedStudents: number;
  highestMarks: number;
  lowestMarks: number;
  averageMarks: number;
  gradeDistribution: {
    grade: string;
    count: number;
  }[];
}

export const examService = {
  createExam: (exam: Exam) =>
    api.post<Exam>('/api/exams', exam),

  updateExam: (id: number, exam: Exam) =>
    api.put<Exam>(`/api/exams/${id}`, exam),

  getExamById: (id: number) =>
    api.get<Exam>(`/api/exams/${id}`),

  getByGrade: (grade: string) =>
    api.get<Exam[]>(`/api/exams/grade/${grade}`),

  getBySubject: (subject: string) =>
    api.get<Exam[]>(`/api/exams/subject/${subject}`),

  getByDateRange: (startDate: string, endDate: string) =>
    api.get<Exam[]>(`/api/exams/date-range?startDate=${startDate}&endDate=${endDate}`),

  recordResult: (result: ExamResult) =>
    api.post<ExamResult>('/api/exams/results', result),

  updateResult: (examId: number, studentId: string, result: Partial<ExamResult>) =>
    api.put<ExamResult>(`/api/exams/results/${examId}/student/${studentId}`, result),

  getStudentResults: (studentId: string) =>
    api.get<ExamResult[]>(`/api/exams/results/student/${studentId}`),

  getExamSummary: (examId: number) =>
    api.get<ExamSummary>(`/api/exams/${examId}/summary`),
};