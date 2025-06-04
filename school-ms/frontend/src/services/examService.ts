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
  examType?: ExamType;
}

export enum ExamType {
  MIDTERM = 'MIDTERM',
  FINAL = 'FINAL',
  QUIZ = 'QUIZ',
  ASSIGNMENT = 'ASSIGNMENT'
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface ExamResult {
  examId: number;
  studentId: string;
  marksObtained: number;
  remarks?: string;
  status: 'PASS' | 'FAIL' | 'ABSENT' | 'PENDING';
}

export interface DetailedExamResult extends ExamResult {
  id?: number;
  questionWiseMarks: QuestionMark[];
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  chapterWiseAnalysis?: ChapterAnalysis[];
}

export interface QuestionMark {
  questionId: number;
  marksObtained: number;
  feedback?: string;
}

export interface ChapterAnalysis {
  chapterName: string;
  totalMarks: number;
  marksObtained: number;
  percentage: number;
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
  chapterWisePerformance?: {
    chapterName: string;
    averagePercentage: number;
  }[];
}

export interface ExamConfiguration {
  id?: number;
  name: string;
  subject: string;
  grade: number;
  theoryMaxMarks: number;
  practicalMaxMarks: number;
  passingPercentage: number;
  examType: ExamType;
  description?: string;
  isActive: boolean;
  requiresApproval: boolean;
  approvalStatus: ApprovalStatus;
  academicYear: number;
  questionPaperStructure?: QuestionPaperStructure;
}

export interface QuestionPaperStructure {
  id?: number;
  name: string;
  totalQuestions: number;
  mandatoryQuestions: number;
  optionalQuestions: number;
  totalMarks: number;
  sections: QuestionSection[];
}

export interface QuestionSection {
  id?: number;
  name: string;
  instructions?: string;
  questionType: QuestionType;
  totalQuestions: number;
  mandatoryQuestions: number;
  marksPerQuestion: number;
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  LONG_ANSWER = 'LONG_ANSWER',
  VERY_SHORT_ANSWER = 'VERY_SHORT_ANSWER',
  TRUE_FALSE = 'TRUE_FALSE',
  FILL_IN_THE_BLANKS = 'FILL_IN_THE_BLANKS'
}

export interface ExamBlueprint {
  id?: number;
  name: string;
  examConfigurationId: number;
  totalMarks: number;
  description?: string;
  createdBy: number;
  approvalStatus: ApprovalStatus;
  chapterDistributions: ChapterDistribution[];
}

export interface ChapterDistribution {
  id?: number;
  chapterName: string;
  weightPercentage: number;
  totalMarks: number;
  questionTypeDistribution: {
    questionType: QuestionType;
    marks: number;
  }[];
}

export interface QuestionPaper {
  id?: number;
  name: string;
  blueprintId: number;
  examId?: number;
  createdBy: number;
  approvalStatus: ApprovalStatus;
  reviewComments?: string;
  questions: Question[];
}

export interface Question {
  id?: number;
  questionText: string;
  questionType: QuestionType;
  marks: number;
  chapterName: string;
  difficultyLevel: string;
  isOptional: boolean;
  expectedAnswer?: string;
  options?: string[];
}

export const examService = {
  // Basic exam management
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

  // Basic result management
  recordResult: (result: ExamResult) =>
    api.post<ExamResult>('/exams/results', result),

  updateResult: (examId: number, studentId: string, result: Partial<ExamResult>) =>
    api.put<ExamResult>(`/exams/results/${examId}/student/${studentId}`, result),

  getStudentResults: (studentId: string) =>
    api.get<ExamResult[]>(`/exams/results/student/${studentId}`),

  getExamSummary: (examId: number) =>
    api.get<ExamSummary>(`/exams/${examId}/summary`),
    
  // Exam Configuration
  createExamConfiguration: (config: ExamConfiguration) =>
    api.post<ExamConfiguration>('/exam-configurations', config),

  updateExamConfiguration: (id: number, config: ExamConfiguration) =>
    api.put<ExamConfiguration>(`/exam-configurations/${id}`, config),

  getExamConfigurationById: (id: number) =>
    api.get<ExamConfiguration>(`/exam-configurations/${id}`),

  getAllExamConfigurations: () =>
    api.get<ExamConfiguration[]>('/exam-configurations'),

  getExamConfigurationsByGrade: (grade: number) =>
    api.get<ExamConfiguration[]>(`/exam-configurations/grade/${grade}`),

  getExamConfigurationsBySubject: (subject: string) =>
    api.get<ExamConfiguration[]>(`/exam-configurations/subject/${subject}`),

  getActiveExamConfigurations: () =>
    api.get<ExamConfiguration[]>('/exam-configurations/active'),

  approveExamConfiguration: (id: number) =>
    api.put<ExamConfiguration>(`/exam-configurations/${id}/approve`),

  rejectExamConfiguration: (id: number, comments: string) =>
    api.put<ExamConfiguration>(`/exam-configurations/${id}/reject`, { comments }),

  // Blueprint Management
  createBlueprint: (blueprint: ExamBlueprint) =>
    api.post<ExamBlueprint>('/blueprints', blueprint),

  updateBlueprint: (id: number, blueprint: ExamBlueprint) =>
    api.put<ExamBlueprint>(`/blueprints/${id}`, blueprint),

  getBlueprintById: (id: number) =>
    api.get<ExamBlueprint>(`/blueprints/${id}`),

  getAllBlueprints: () =>
    api.get<ExamBlueprint[]>('/blueprints'),

  getBlueprintsByExamConfiguration: (examConfigId: number) =>
    api.get<ExamBlueprint[]>(`/blueprints/exam-config/${examConfigId}`),

  getApprovedBlueprints: () =>
    api.get<ExamBlueprint[]>('/blueprints/approved'),

  approveBlueprint: (id: number) =>
    api.put<ExamBlueprint>(`/blueprints/${id}/approve`),

  rejectBlueprint: (id: number, comments: string) =>
    api.put<ExamBlueprint>(`/blueprints/${id}/reject`, { comments }),

  // Question Paper Management
  createQuestionPaper: (questionPaper: QuestionPaper) =>
    api.post<QuestionPaper>('/question-papers', questionPaper),

  updateQuestionPaper: (id: number, questionPaper: QuestionPaper) =>
    api.put<QuestionPaper>(`/question-papers/${id}`, questionPaper),

  getQuestionPaperById: (id: number) =>
    api.get<QuestionPaper>(`/question-papers/${id}`),

  getAllQuestionPapers: () =>
    api.get<QuestionPaper[]>('/question-papers'),

  getQuestionPapersByExam: (examId: number) =>
    api.get<QuestionPaper[]>(`/question-papers/exam/${examId}`),

  getQuestionPapersByBlueprint: (blueprintId: number) =>
    api.get<QuestionPaper[]>(`/question-papers/blueprint/${blueprintId}`),

  getMyQuestionPapers: () =>
    api.get<QuestionPaper[]>('/question-papers/my-papers'),

  getPendingQuestionPapers: () =>
    api.get<QuestionPaper[]>('/question-papers/pending'),

  getApprovedQuestionPapers: () =>
    api.get<QuestionPaper[]>('/question-papers/approved'),

  approveQuestionPaper: (id: number, comments?: string) =>
    api.put<QuestionPaper>(`/question-papers/${id}/approve`, { comments }),

  rejectQuestionPaper: (id: number, comments: string) =>
    api.put<QuestionPaper>(`/question-papers/${id}/reject`, { comments }),

  // Detailed Exam Results
  recordDetailedResult: (result: DetailedExamResult) =>
    api.post<DetailedExamResult>('/detailed-exam-results', result),

  updateDetailedResult: (id: number, result: DetailedExamResult) =>
    api.put<DetailedExamResult>(`/detailed-exam-results/${id}`, result),

  getDetailedResultById: (id: number) =>
    api.get<DetailedExamResult>(`/detailed-exam-results/${id}`),

  getDetailedResultsByExam: (examId: number) =>
    api.get<DetailedExamResult[]>(`/detailed-exam-results/exam/${examId}`),

  getDetailedResultsByStudent: (studentId: string) =>
    api.get<DetailedExamResult[]>(`/detailed-exam-results/student/${studentId}`),

  lockDetailedResult: (id: number) =>
    api.put<DetailedExamResult>(`/detailed-exam-results/${id}/lock`),

  unlockDetailedResult: (id: number, reason: string) =>
    api.put<DetailedExamResult>(`/detailed-exam-results/${id}/unlock`, { reason }),

  // Exam Analysis and Reports
  getChapterWiseAnalysis: (examId: number) =>
    api.get<ChapterAnalysis[]>(`/exam-analysis/${examId}/chapter-wise`),

  getStudentChapterWiseAnalysis: (examId: number, studentId: string) =>
    api.get<ChapterAnalysis[]>(`/exam-analysis/${examId}/student/${studentId}/chapter-wise`),

  generateTabulationSheet: (examId: number) =>
    api.get(`/exam-reports/${examId}/tabulation-sheet`, { 
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    }),

  generateReportCard: (examId: number, studentId: string) =>
    api.get(`/exam-reports/${examId}/student/${studentId}/report-card`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    })
};