// Subject Master Types
export enum SubjectType {
  THEORY = 'THEORY',
  PRACTICAL = 'PRACTICAL',
  BOTH = 'BOTH'
}

export interface SubjectMaster {
  id?: number;
  subjectCode: string;
  subjectName: string;
  description?: string;
  subjectType: SubjectType;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  configurationCount?: number;
  isInUse?: boolean;
}

export interface SubjectMasterRequest {
  subjectCode: string;
  subjectName: string;
  description?: string;
  subjectType: SubjectType;
  isActive?: boolean;
}

// Class Configuration Types
export interface ClassConfiguration {
  id?: number;
  className: string;
  academicYear: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  subjectCount?: number;
  totalMarks?: number;
  subjects?: ConfigurationSubject[];
}

export interface ClassConfigurationRequest {
  className: string;
  academicYear: string;
  description?: string;
  isActive?: boolean;
}

// Configuration Subject Types
export interface ConfigurationSubject {
  id?: number;
  classConfigurationId: number;
  subjectMasterId: number;
  subjectCode: string;
  subjectName: string;
  subjectType: SubjectType; // Original subject type from Subject Master
  effectiveSubjectType: SubjectType; // Effective type for this configuration (can override)
  totalMarks: number;
  passingMarks: number;
  theoryMarks?: number;
  practicalMarks?: number;
  theoryPassingMarks?: number;
  practicalPassingMarks?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  className?: string;
  section?: string;
  academicYear?: string;
}

export interface ConfigurationSubjectRequest {
  classConfigurationId: number;
  subjectMasterId: number;
  effectiveSubjectType: SubjectType;
  totalMarks: number;
  passingMarks: number;
  theoryMarks?: number;
  practicalMarks?: number;
  theoryPassingMarks?: number;
  practicalPassingMarks?: number;
  isActive?: boolean;
}

// Copy Configuration Types
export interface CopyConfigurationRequest {
  sourceClassConfigId: number;
  targetClassConfigId: number;
  subjectIds?: number[]; // Optional: specific subjects to copy
  overwriteExisting: boolean;
}

export interface CopyConfigurationResponse {
  copiedSubjects: ConfigurationSubject[];
  totalCopied: number;
  skippedCount: number;
  overwrittenCount: number;
}

// Copy subjects types
export interface CopySubjectsRequest {
  sourceConfigurationId: number;
  targetConfigurationId: number;
  includeInactive?: boolean;
  adjustMarks?: boolean;
  marksAdjustmentFactor?: number;
}

export interface CopySubjectsPreview {
  sourceConfiguration: ClassConfiguration;
  targetConfiguration: ClassConfiguration;
  subjectsToAdd: ConfigurationSubject[];
  existingSubjects: ConfigurationSubject[];
  conflictCount: number;
  totalSubjects: number;
}

// Legacy copy types (keeping for backward compatibility)
export interface CopySubjectConfiguration {
  subjectMasterId: number;
  include: boolean;
  newTotalMarks?: number;
  newPassingMarks?: number;
  newTheoryMarks?: number;
  newPracticalMarks?: number;
  newTheoryPassingMarks?: number;
  newPracticalPassingMarks?: number;
}

export interface CopySubjectResult {
  subjectMasterId: number;
  subjectName: string;
  subjectCode: string;
  copied: boolean;
  reason: string;
  newConfigurationSubjectId?: number;
}

export interface CopyConfigurationResponseLegacy {
  newConfigurationId?: number;
  targetClassName: string;
  targetSection: string;
  targetAcademicYear: string;
  copiedSubjectsCount: number;
  skippedSubjectsCount: number;
  subjectResults: CopySubjectResult[];
  warnings: string[];
  errors: string[];
  success: boolean;
  message: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Filter and Search Types
export interface SubjectMasterFilter {
  searchTerm?: string;
  subjectType?: SubjectType;
  isActive?: boolean;
}

export interface ClassConfigurationFilter {
  searchTerm?: string;
  academicYear?: string;
  className?: string;
  isActive?: boolean;
}

export interface ConfigurationSubjectFilter {
  classConfigurationId?: number;
  subjectMasterId?: number;
  subjectType?: SubjectType;
  academicYear?: string;
  className?: string;
}

// UI Helper Types
export interface SubjectTypeOption {
  value: SubjectType;
  label: string;
  description: string;
}

export interface AcademicYearOption {
  value: string;
  label: string;
}

export interface ClassNameOption {
  value: string;
  label: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  loading: boolean;
  errors: ValidationError[];
  touched: { [key: string]: boolean };
}

// Constants
export const SUBJECT_TYPE_OPTIONS: SubjectTypeOption[] = [
  {
    value: SubjectType.THEORY,
    label: 'Theory Only',
    description: 'Theory-based subjects with written examinations'
  },
  {
    value: SubjectType.PRACTICAL,
    label: 'Practical Only',
    description: 'Skill-based subjects with hands-on examinations'
  },
  {
    value: SubjectType.BOTH,
    label: 'Theory & Practical',
    description: 'Subjects with both theory and practical components'
  }
];

export const ACADEMIC_YEAR_PATTERN = /^\d{4}-\d{2}$/;

// Utility Types
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  order: SortOrder;
}

export interface TableColumn<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
}
