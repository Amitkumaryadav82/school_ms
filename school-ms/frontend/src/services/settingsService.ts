import api from './api';

export interface SchoolSettings {
  schoolName: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  receiptPrefix?: string;
}

export const settingsService = {
  async getSchoolSettings(): Promise<SchoolSettings> {
    return await api.get('/api/settings/school');
  },
  async updateSchoolSettings(payload: SchoolSettings): Promise<SchoolSettings> {
    return await api.put('/api/settings/school', payload);
  }
};
