import api from './api';
import {
  ConfigurationSubject,
  ConfigurationSubjectRequest,
  PaginatedResponse,
  ConfigurationSubjectFilter,
  SubjectType
} from '../types/examConfiguration';

class ConfigurationSubjectService {
  private readonly baseUrl = '/api/configuration-subjects';

  /**
   * Create a new configuration subject
   */
  async createConfigurationSubject(request: ConfigurationSubjectRequest): Promise<ConfigurationSubject> {
    return await api.post<ConfigurationSubject>(this.baseUrl, request);
  }

  /**
   * Update an existing configuration subject
   */
  async updateConfigurationSubject(id: number, request: ConfigurationSubjectRequest): Promise<ConfigurationSubject> {
    return await api.put<ConfigurationSubject>(`${this.baseUrl}/${id}`, request);
  }

  /**
   * Get configuration subject by ID
   */
  async getConfigurationSubjectById(id: number): Promise<ConfigurationSubject> {
    return await api.get<ConfigurationSubject>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get all active configuration subjects
   */
  async getAllActiveConfigurationSubjects(): Promise<ConfigurationSubject[]> {
    return await api.get<ConfigurationSubject[]>(`${this.baseUrl}/active`);
  }

  /**
   * Get all configuration subjects with pagination
   */
  async getAllConfigurationSubjectsPaginated(page = 0, size = 20): Promise<PaginatedResponse<ConfigurationSubject>> {
    return await api.get<PaginatedResponse<ConfigurationSubject>>(this.baseUrl, {
      params: { page, size }
    });
  }

  /**
   * Get configuration subjects by configuration ID
   */
  async getSubjectsByConfiguration(configurationId: number): Promise<ConfigurationSubject[]> {
    return await api.get<ConfigurationSubject[]>(`${this.baseUrl}/class/${configurationId}`);
  }

  /**
   * Get configuration subjects by subject master ID
   */
  async getSubjectsBySubjectMaster(subjectMasterId: number): Promise<ConfigurationSubject[]> {
    return await api.get<ConfigurationSubject[]>(`${this.baseUrl}/by-subject-master/${subjectMasterId}`);
  }

  /**
   * Search configuration subjects with filters and pagination
   */
  async searchConfigurationSubjects(
    filter: ConfigurationSubjectFilter = {},
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<ConfigurationSubject>> {
    const params: any = { page, size };
    
    if (filter.classConfigurationId) {
      params.classConfigurationId = filter.classConfigurationId;
    }
    if (filter.subjectMasterId) {
      params.subjectMasterId = filter.subjectMasterId;
    }
    if (filter.subjectType) {
      params.subjectType = filter.subjectType;
    }
    if (filter.academicYear) {
      params.academicYear = filter.academicYear;
    }
    if (filter.className) {
      params.className = filter.className;
    }

    return await api.get<PaginatedResponse<ConfigurationSubject>>(`${this.baseUrl}/search`, {
      params
    });
  }

  /**
   * Delete a configuration subject (soft delete)
   */
  async deleteConfigurationSubject(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Update configuration subject status
   */
  async updateConfigurationSubjectStatus(id: number, isActive: boolean): Promise<ConfigurationSubject> {
    return await api.patch<ConfigurationSubject>(`${this.baseUrl}/${id}/status`, {
      isActive
    });
  }

  /**
   * Check if subject already exists in configuration
   */
  async existsInConfiguration(configurationId: number, subjectMasterId: number, excludeId?: number): Promise<boolean> {
    const params: any = { configurationId, subjectMasterId };
    if (excludeId) {
      params.excludeId = excludeId;
    }
    const response = await api.get<{ exists: boolean }>(`${this.baseUrl}/exists`, { params });
    return response.exists;
  }

  /**
   * Get configuration subjects that are currently in use (have exams)
   */
  async getConfigurationSubjectsInUse(): Promise<ConfigurationSubject[]> {
    return await api.get<ConfigurationSubject[]>(`${this.baseUrl}/in-use`);
  }

  /**
   * Get configuration subjects that are not currently in use
   */
  async getConfigurationSubjectsNotInUse(): Promise<ConfigurationSubject[]> {
    return await api.get<ConfigurationSubject[]>(`${this.baseUrl}/not-in-use`);
  }

  /**
   * Bulk create configuration subjects
   */
  async bulkCreateConfigurationSubjects(requests: ConfigurationSubjectRequest[]): Promise<ConfigurationSubject[]> {
    return await api.post<ConfigurationSubject[]>(`${this.baseUrl}/bulk`, requests);
  }

  /**
   * Bulk update configuration subjects
   */
  async bulkUpdateConfigurationSubjects(updates: Array<{ id: number; data: ConfigurationSubjectRequest }>): Promise<ConfigurationSubject[]> {
    return await api.put<ConfigurationSubject[]>(`${this.baseUrl}/bulk`, updates);
  }

  /**
   * Preview copy subjects from one configuration to another
   */
  async previewCopySubjects(sourceConfigId: number, targetConfigId: number): Promise<ConfigurationSubject[]> {
    return await api.get<ConfigurationSubject[]>(`${this.baseUrl}/copy-preview/${sourceConfigId}/${targetConfigId}`);
  }

  /**
   * Copy subjects from one configuration to another
   */
  async copySubjects(
    sourceConfigId: number, 
    targetConfigId: number, 
    subjectIds?: number[], 
    overwriteExisting = false
  ): Promise<ConfigurationSubject[]> {
    const params: any = { overwriteExisting };
    if (subjectIds && subjectIds.length > 0) {
      params.subjectIds = subjectIds;
    }
    return await api.post<ConfigurationSubject[]>(`${this.baseUrl}/copy/${sourceConfigId}/${targetConfigId}`, null, { params });
  }

  /**
   * Validate total marks
   */
  validateTotalMarks(totalMarks: number): string | null {
    if (!totalMarks || totalMarks <= 0) {
      return 'Total marks must be greater than 0';
    }
    
    if (totalMarks > 1000) {
      return 'Total marks cannot exceed 1000';
    }
    
    return null;
  }

  /**
   * Validate passing marks
   */
  validatePassingMarks(passingMarks: number, totalMarks: number): string | null {
    if (!passingMarks || passingMarks <= 0) {
      return 'Passing marks must be greater than 0';
    }
    
    if (passingMarks >= totalMarks) {
      return 'Passing marks must be less than total marks';
    }
    
    return null;
  }

  /**
   * Validate theory marks
   */
  validateTheoryMarks(theoryMarks?: number, totalMarks?: number): string | null {
    if (theoryMarks !== undefined && theoryMarks !== null) {
      if (theoryMarks <= 0) {
        return 'Theory marks must be greater than 0';
      }
      
      if (totalMarks && theoryMarks >= totalMarks) {
        return 'Theory marks must be less than total marks';
      }
    }
    
    return null;
  }

  /**
   * Validate practical marks
   */
  validatePracticalMarks(practicalMarks?: number, totalMarks?: number): string | null {
    if (practicalMarks !== undefined && practicalMarks !== null) {
      if (practicalMarks <= 0) {
        return 'Practical marks must be greater than 0';
      }
      
      if (totalMarks && practicalMarks >= totalMarks) {
        return 'Practical marks must be less than total marks';
      }
    }
    
    return null;
  }

  /**
   * Validate theory and practical marks combination
   */
  validateTheoryPracticalCombination(
    subjectType: SubjectType,
    totalMarks: number,
    theoryMarks?: number,
    practicalMarks?: number
  ): string[] {
    const errors: string[] = [];
    
    switch (subjectType) {
      case SubjectType.THEORY:
        if (practicalMarks && practicalMarks > 0) {
          errors.push('Theory-only subjects cannot have practical marks');
        }
        break;
        
      case SubjectType.PRACTICAL:
        if (theoryMarks && theoryMarks > 0) {
          errors.push('Practical-only subjects cannot have theory marks');
        }
        break;
        
      case SubjectType.BOTH:
        if (!theoryMarks || !practicalMarks) {
          errors.push('Both theory and practical marks are required for combined subjects');
        } else if ((theoryMarks + practicalMarks) !== totalMarks) {
          errors.push('Theory marks + Practical marks must equal Total marks');
        }
        break;
    }
    
    return errors;
  }

  /**
   * Validate complete configuration subject request
   */
  validateConfigurationSubjectRequest(request: ConfigurationSubjectRequest, subjectType: SubjectType): string[] {
    const errors: string[] = [];
    
    if (!request.classConfigurationId) {
      errors.push('Configuration is required');
    }
    
    if (!request.subjectMasterId) {
      errors.push('Subject is required');
    }
    
    const totalMarksError = this.validateTotalMarks(request.totalMarks);
    if (totalMarksError) errors.push(totalMarksError);
    
    const passingMarksError = this.validatePassingMarks(request.passingMarks, request.totalMarks);
    if (passingMarksError) errors.push(passingMarksError);
    
    const theoryMarksError = this.validateTheoryMarks(request.theoryMarks, request.totalMarks);
    if (theoryMarksError) errors.push(theoryMarksError);
    
    const practicalMarksError = this.validatePracticalMarks(request.practicalMarks, request.totalMarks);
    if (practicalMarksError) errors.push(practicalMarksError);
    
    // Validate theory/practical combination
    const combinationErrors = this.validateTheoryPracticalCombination(
      subjectType,
      request.totalMarks,
      request.theoryMarks,
      request.practicalMarks
    );
    errors.push(...combinationErrors);
    
    // Validate passing marks for theory/practical
    if (request.theoryPassingMarks && request.theoryMarks) {
      if (request.theoryPassingMarks >= request.theoryMarks) {
        errors.push('Theory passing marks must be less than theory marks');
      }
    }
    
    if (request.practicalPassingMarks && request.practicalMarks) {
      if (request.practicalPassingMarks >= request.practicalMarks) {
        errors.push('Practical passing marks must be less than practical marks');
      }
    }
    
    return errors;
  }

  /**
   * Calculate suggested passing marks (typically 40% of total)
   */
  calculateSuggestedPassingMarks(totalMarks: number): number {
    return Math.round(totalMarks * 0.4);
  }

  /**
   * Calculate suggested theory/practical split (typically 70/30 for BOTH type)
   */
  calculateSuggestedTheoryPracticalSplit(totalMarks: number): { theory: number; practical: number } {
    const theory = Math.round(totalMarks * 0.7);
    const practical = totalMarks - theory;
    return { theory, practical };
  }

  /**
   * Format subject display name with marks
   */
  formatSubjectDisplayName(configSubject: ConfigurationSubject): string {
    const marksInfo = this.formatMarksInfo(configSubject);
    return `${configSubject.subjectName} (${configSubject.subjectCode}) - ${marksInfo}`;
  }

  /**
   * Format marks information
   */
  formatMarksInfo(configSubject: ConfigurationSubject): string {
    if (configSubject.subjectType === SubjectType.BOTH && configSubject.theoryMarks && configSubject.practicalMarks) {
      return `${configSubject.totalMarks} (T:${configSubject.theoryMarks} + P:${configSubject.practicalMarks})`;
    }
    return `${configSubject.totalMarks} marks`;
  }

  /**
   * Check if configuration subject can be deleted
   */
  canDeleteConfigurationSubject(configSubject: ConfigurationSubject): { canDelete: boolean; reason?: string } {
    // In a real application, you would check if this subject has any exam data
    // For now, we'll assume it can always be deleted
    return { canDelete: true };
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
   * Get configuration subject status display
   */
  getConfigurationSubjectStatusDisplay(isActive: boolean): { text: string; color: string } {
    return isActive 
      ? { text: 'Active', color: 'green' }
      : { text: 'Inactive', color: 'red' };
  }
}

export default new ConfigurationSubjectService();
