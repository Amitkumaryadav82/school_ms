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
  private readonly baseUrl = '/api/class-configurations';

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
    // Use the search endpoint with isActive=true to get all active configurations
    const response = await api.get<PaginatedResponse<ClassConfiguration>>(`${this.baseUrl}/search`, {
      params: { isActive: true, size: 1000 } // Use large size to get all results
    });
    return response.content || [];
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
    // Get the current configuration first
    const currentConfig = await this.getConfigurationById(id);
    
    // Update with the new status
    const updateRequest: ClassConfigurationRequest = {
      className: currentConfig.className,
      academicYear: currentConfig.academicYear,
      description: currentConfig.description,
      isActive: isActive
    };
    
    return await this.updateConfiguration(id, updateRequest);
  }

  /**
   * Copy a configuration to another class/session
   */
  async copyConfiguration(request: CopyConfigurationRequest): Promise<CopyConfigurationResponse> {
    return await api.post<CopyConfigurationResponse>(`${this.baseUrl}/copy`, request);
  }

  /**
   * Check if configuration name exists for a class and academic year
   */
  async existsByNameAndClass(className: string, academicYear: string, excludeId?: number): Promise<boolean> {
    // Use search endpoint to check if configuration already exists
    const response = await this.searchConfigurations({
      className,
      academicYear
    }, 0, 1000);
    
    const existingConfigs = response.content || [];
    
    // Check if any configuration matches (excluding the current one if editing)
    return existingConfigs.some(config => 
      config.className === className && 
      config.academicYear === academicYear &&
      (excludeId ? config.id !== excludeId : true)
    );
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
   * Validate academic year
   */
  validateAcademicYear(academicYear: string): string | null {
    if (!academicYear || academicYear.trim().length === 0) {
      return 'Academic year is required';
    }
    
    // Updated format validation to match backend requirements (YYYY-YY)
    const academicYearPattern = /^\d{4}-\d{2}$/;
    if (!academicYearPattern.test(academicYear.trim())) {
      return 'Academic year must be in format YYYY-YY (e.g., 2023-24)';
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
    return `${config.className} - ${config.academicYear}`;
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
    
    if (!request.sourceClassConfigId) {
      errors.push('Source configuration is required');
    }
    
    if (!request.targetClassConfigId) {
      errors.push('Target configuration is required');
    }
    
    return errors;
  }

  /**
   * Generate suggested configuration name for copy operation
   */
  generateCopyConfigurationName(sourceConfig: ClassConfiguration, targetClassName: string): string {
    return `${sourceConfig.className} - Copy for ${targetClassName}`;
  }
}

export default new ClassConfigurationService();
