import api from './api';
import {
  SubjectMaster,
  SubjectMasterRequest,
  SubjectType,
  PaginatedResponse,
  SubjectMasterFilter
} from '../types/examConfiguration';

class SubjectMasterService {
  private readonly baseUrl = '/api/subjects';

  /**
   * Create a new subject master
   */
  async createSubject(request: SubjectMasterRequest): Promise<SubjectMaster> {
    return await api.post<SubjectMaster>(this.baseUrl, request);
  }

  /**
   * Update an existing subject master
   */
  async updateSubject(id: number, request: SubjectMasterRequest): Promise<SubjectMaster> {
    return await api.put<SubjectMaster>(`${this.baseUrl}/${id}`, request);
  }

  /**
   * Get subject master by ID
   */
  async getSubjectById(id: number): Promise<SubjectMaster> {
    return await api.get<SubjectMaster>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get subject master by code
   */
  async getSubjectByCode(code: string): Promise<SubjectMaster> {
    return await api.get<SubjectMaster>(`${this.baseUrl}/by-code/${code}`);
  }

  /**
   * Get all active subjects
   */
  async getAllActiveSubjects(): Promise<SubjectMaster[]> {
    return await api.get<SubjectMaster[]>(`${this.baseUrl}/active`);
  }

  /**
   * Get all active subjects with pagination
   */
  async getAllActiveSubjectsPaginated(page = 0, size = 20): Promise<PaginatedResponse<SubjectMaster>> {
    return await api.get<PaginatedResponse<SubjectMaster>>(this.baseUrl, {
      params: { page, size }
    });
  }

  /**
   * Get subjects by type
   */
  async getSubjectsByType(type: SubjectType): Promise<SubjectMaster[]> {
    return await api.get<SubjectMaster[]>(`${this.baseUrl}/by-type/${type}`);
  }

  /**
   * Search subjects with filters and pagination
   */
  async searchSubjects(
    filter: SubjectMasterFilter = {},
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<SubjectMaster>> {
    const params: any = { page, size };
    
    if (filter.searchTerm) {
      params.searchTerm = filter.searchTerm;
    }
    if (filter.isActive !== undefined) {
      params.isActive = filter.isActive;
    }
    if (filter.subjectType) {
      params.subjectType = filter.subjectType;
    }

    return await api.get<PaginatedResponse<SubjectMaster>>(`${this.baseUrl}/search`, {
      params
    });
  }

  /**
   * Delete a subject master (soft delete)
   */
  async deleteSubject(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Update subject master status
   */
  async updateSubjectStatus(id: number, isActive: boolean): Promise<SubjectMaster> {
    return await api.patch<SubjectMaster>(`${this.baseUrl}/${id}/status`, {
      isActive
    });
  }

  /**
   * Check if subject code exists
   */
  async existsByCode(code: string): Promise<boolean> {
    const response = await api.get<{ exists: boolean }>(`${this.baseUrl}/exists/code/${code}`);
    return response.exists;
  }

  /**
   * Check if subject name exists
   */
  async existsByName(name: string): Promise<boolean> {
    const response = await api.get<{ exists: boolean }>(`${this.baseUrl}/exists/name/${name}`);
    return response.exists;
  }

  /**
   * Get subjects that are currently in use
   */
  async getSubjectsInUse(): Promise<SubjectMaster[]> {
    return await api.get<SubjectMaster[]>(`${this.baseUrl}/in-use`);
  }

  /**
   * Get subjects that are not currently in use
   */
  async getSubjectsNotInUse(): Promise<SubjectMaster[]> {
    return await api.get<SubjectMaster[]>(`${this.baseUrl}/not-in-use`);
  }

  /**
   * Get subjects with their configuration count
   */
  async getSubjectsWithConfigurationCount(): Promise<SubjectMaster[]> {
    return await api.get<SubjectMaster[]>(`${this.baseUrl}/with-config-count`);
  }

  /**
   * Get all subjects without pagination (for client-side filtering)
   */
  async getAllSubjects(): Promise<SubjectMaster[]> {
    return await api.get<SubjectMaster[]>(`${this.baseUrl}/all`);
  }

  /**
   * Validate subject code format
   */
  validateSubjectCode(code: string): string | null {
    if (!code || code.trim().length === 0) {
      return 'Subject code is required';
    }
    
    const trimmedCode = code.trim();
    if (trimmedCode.length < 2 || trimmedCode.length > 20) {
      return 'Subject code must be between 2 and 20 characters';
    }
    
    // Check for valid characters (alphanumeric and basic symbols)
    if (!/^[A-Z0-9_-]+$/i.test(trimmedCode)) {
      return 'Subject code can only contain letters, numbers, hyphens, and underscores';
    }
    
    return null;
  }

  /**
   * Validate subject name
   */
  validateSubjectName(name: string): string | null {
    if (!name || name.trim().length === 0) {
      return 'Subject name is required';
    }
    
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return 'Subject name must be between 2 and 100 characters';
    }
    
    return null;
  }

  /**
   * Validate description
   */
  validateDescription(description?: string): string | null {
    if (description && description.trim().length > 500) {
      return 'Description cannot exceed 500 characters';
    }
    
    return null;
  }

  /**
   * Validate complete subject master request
   */
  validateSubjectRequest(request: SubjectMasterRequest): string[] {
    const errors: string[] = [];
    
    const codeError = this.validateSubjectCode(request.subjectCode);
    if (codeError) errors.push(codeError);
    
    const nameError = this.validateSubjectName(request.subjectName);
    if (nameError) errors.push(nameError);
    
    const descError = this.validateDescription(request.description);
    if (descError) errors.push(descError);
    
    if (!request.subjectType) {
      errors.push('Subject type is required');
    }
    
    return errors;
  }

  /**
   * Get subject type display name
   */
  getSubjectTypeDisplay(type: SubjectType): string {
    switch (type) {
      case SubjectType.THEORY:
        return 'Theory Only';
      case SubjectType.PRACTICAL:
        return 'Practical Only';
      case SubjectType.BOTH:
        return 'Theory & Practical';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get subject type description
   */
  getSubjectTypeDescription(type: SubjectType): string {
    switch (type) {
      case SubjectType.THEORY:
        return 'Theory-based subjects with written examinations';
      case SubjectType.PRACTICAL:
        return 'Skill-based subjects with hands-on examinations';
      case SubjectType.BOTH:
        return 'Subjects with both theory and practical components';
      default:
        return '';
    }
  }
}

export default new SubjectMasterService();
