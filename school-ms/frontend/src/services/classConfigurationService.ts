import api from './api';
import {
  ClassConfiguration,
  ClassConfigurationRequest,
  PaginatedResponse,
  ClassConfigurationFilter,
  CopyConfigurationRequest,
  CopyConfigurationResponse
} from '../types/examConfiguration';

class ClassConfigurationService {
  private readonly baseUrl = '/api/configurations';

  /**
   * Create a new class configuration
   */
  async createConfiguration(request: ClassConfigurationRequest): Promise<ClassConfiguration> {
    return await api.post<ClassConfiguration>(this.baseUrl, request);
  }

  /**
   * Update an existing class configuration
   */
  async updateConfiguration(id: number, request: ClassConfigurationRequest): Promise<ClassConfiguration> {
    return await api.put<ClassConfiguration>(`${this.baseUrl}/${id}`, request);
  }

  /**
   * Get class configuration by ID
   */
  async getConfigurationById(id: number): Promise<ClassConfiguration> {
    return await api.get<ClassConfiguration>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get all active configurations
   */
  async getAllActiveConfigurations(): Promise<ClassConfiguration[]> {
    return await api.get<ClassConfiguration[]>(`${this.baseUrl}/active`);
  }

  /**
   * Get all configurations with pagination
   */
  async getAllConfigurationsPaginated(page = 0, size = 20): Promise<PaginatedResponse<ClassConfiguration>> {
    return await api.get<PaginatedResponse<ClassConfiguration>>(this.baseUrl, {
      params: { page, size }
    });
  }

  /**
   * Get configurations by class ID
   */
  async getConfigurationsByClass(classId: number): Promise<ClassConfiguration[]> {
    return await api.get<ClassConfiguration[]>(`${this.baseUrl}/by-class/${classId}`);
  }

  /**
   * Get configurations by class and session
   */
  async getConfigurationsByClassAndSession(classId: number, sessionId: number): Promise<ClassConfiguration[]> {
    return await api.get<ClassConfiguration[]>(`${this.baseUrl}/by-class-session`, {
      params: { classId, sessionId }
    });
  }

  /**
   * Search configurations with filters and pagination
   */
  async searchConfigurations(
    filter: ClassConfigurationFilter = {},
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<ClassConfiguration>> {
    const params: any = { page, size };
    
    if (filter.searchTerm) {
      params.searchTerm = filter.searchTerm;
    }
    if (filter.className) {
      params.className = filter.className;
    }
    if (filter.academicYear) {
      params.academicYear = filter.academicYear;
    }
    if (filter.isActive !== undefined) {
      params.isActive = filter.isActive;
    }

    return await api.get<PaginatedResponse<ClassConfiguration>>(`${this.baseUrl}/search`, {
      params
    });
  }

  /**
   * Delete a class configuration (soft delete)
   */
  async deleteConfiguration(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Update configuration status
   */
  async updateConfigurationStatus(id: number, isActive: boolean): Promise<ClassConfiguration> {
    return await api.patch<ClassConfiguration>(`${this.baseUrl}/${id}/status`, {
      isActive
    });
  }

  /**
   * Copy a configuration to another class/session
   */
  async copyConfiguration(request: CopyConfigurationRequest): Promise<CopyConfigurationResponse> {
    return await api.post<CopyConfigurationResponse>(`${this.baseUrl}/copy`, request);
  }

  /**
   * Check if configuration name exists for a class
   */
  async existsByNameAndClass(className: string, section: string, academicYear: string, excludeId?: number): Promise<boolean> {
    const params: any = { className, section, academicYear };
    if (excludeId) {
      params.excludeId = excludeId;
    }
    const response = await api.get<{ exists: boolean }>(`${this.baseUrl}/exists/name`, { params });
    return response.exists;
  }

  /**
   * Get configurations that are currently in use (have exams)
   */
  async getConfigurationsInUse(): Promise<ClassConfiguration[]> {
    return await api.get<ClassConfiguration[]>(`${this.baseUrl}/in-use`);
  }

  /**
   * Get configurations that are not currently in use
   */
  async getConfigurationsNotInUse(): Promise<ClassConfiguration[]> {
    return await api.get<ClassConfiguration[]>(`${this.baseUrl}/not-in-use`);
  }

  /**
   * Get configurations with their exam count
   */
  async getConfigurationsWithExamCount(): Promise<ClassConfiguration[]> {
    return await api.get<ClassConfiguration[]>(`${this.baseUrl}/with-exam-count`);
  }

  /**
   * Validate configuration name
   */
  validateClassName(name: string): string | null {
    if (!name || name.trim().length === 0) {
      return 'Class name is required';
    }
    
    const trimmedName = name.trim();
    if (trimmedName.length < 1 || trimmedName.length > 50) {
      return 'Class name must be between 1 and 50 characters';
    }
    
    return null;
  }

  /**
   * Validate section
   */
  validateSection(section: string): string | null {
    if (!section || section.trim().length === 0) {
      return 'Section is required';
    }
    
    const trimmedSection = section.trim();
    if (trimmedSection.length > 10) {
      return 'Section cannot exceed 10 characters';
    }
    
    return null;
  }

  /**
   * Validate academic year
   */
  validateAcademicYear(academicYear: string): string | null {
    if (!academicYear || academicYear.trim().length === 0) {
      return 'Academic year is required';
    }
    
    // Basic format validation (e.g., 2023-2024)
    const academicYearPattern = /^\d{4}-\d{4}$/;
    if (!academicYearPattern.test(academicYear.trim())) {
      return 'Academic year must be in format YYYY-YYYY (e.g., 2023-2024)';
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
   * Validate complete configuration request
   */
  validateConfigurationRequest(request: ClassConfigurationRequest): string[] {
    const errors: string[] = [];
    
    const nameError = this.validateClassName(request.className);
    if (nameError) errors.push(nameError);
    
    const sectionError = this.validateSection(request.section);
    if (sectionError) errors.push(sectionError);
    
    const yearError = this.validateAcademicYear(request.academicYear);
    if (yearError) errors.push(yearError);
    
    const descError = this.validateDescription(request.description);
    if (descError) errors.push(descError);
    
    return errors;
  }

  /**
   * Format configuration display name
   */
  formatConfigurationDisplayName(config: ClassConfiguration): string {
    return `${config.className} ${config.section} - ${config.academicYear}`;
  }

  /**
   * Check if configuration can be deleted
   */
  canDeleteConfiguration(config: ClassConfiguration): { canDelete: boolean; reason?: string } {
    if (config.subjectCount && config.subjectCount > 0) {
      return {
        canDelete: false,
        reason: `Configuration has ${config.subjectCount} subject(s) configured`
      };
    }
    
    return { canDelete: true };
  }

  /**
   * Get configuration status display
   */
  getConfigurationStatusDisplay(isActive: boolean): { text: string; color: string } {
    return isActive 
      ? { text: 'Active', color: 'green' }
      : { text: 'Inactive', color: 'red' };
  }

  /**
   * Validate copy configuration request
   */
  validateCopyRequest(request: CopyConfigurationRequest): string[] {
    const errors: string[] = [];
    
    if (!request.sourceConfigurationId) {
      errors.push('Source configuration is required');
    }
    
    const targetClassError = this.validateClassName(request.targetClassName);
    if (targetClassError) errors.push(targetClassError);
    
    const targetSectionError = this.validateSection(request.targetSection);
    if (targetSectionError) errors.push(targetSectionError);
    
    const targetYearError = this.validateAcademicYear(request.targetAcademicYear);
    if (targetYearError) errors.push(targetYearError);
    
    return errors;
  }

  /**
   * Generate suggested configuration name for copy operation
   */
  generateCopyConfigurationName(sourceConfig: ClassConfiguration, targetClassName: string): string {
    return `${sourceConfig.className} ${sourceConfig.section} - Copy for ${targetClassName}`;
  }
}

export default new ClassConfigurationService();
