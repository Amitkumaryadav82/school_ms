import api from './api';

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
    api.post<Exam>('/exams', exam),

  updateExam: (id: number, exam: Exam) =>
    api.put<Exam>(`/exams/${id}`, exam),

  getExamById: (id: number) =>
    api.get<Exam>(`/exams/${id}`),

  getByGrade: (grade: string) =>
    api.get<Exam[]>(`/exams/grade/${grade}`),

  getBySubject: (subject: string) =>
    api.get<Exam[]>(`/exams/subject/${subject}`),

  getByDateRange: (startDate: string, endDate: string) =>
    api.get<Exam[]>(`/exams/date-range?startDate=${startDate}&endDate=${endDate}`),

  recordResult: (result: ExamResult) =>
    api.post<ExamResult>('/exams/results', result),

  updateResult: (examId: number, studentId: string, result: Partial<ExamResult>) =>
    api.put<ExamResult>(`/exams/results/${examId}/student/${studentId}`, result),

  getStudentResults: (studentId: string) =>
    api.get<ExamResult[]>(`/exams/results/student/${studentId}`),

  getExamSummary: (examId: number) =>
    api.get<ExamSummary>(`/exams/${examId}/summary`),
};