import api from './api';

export interface HolidayDTO {
  id?: number;
  name: string;
  description?: string;
  type?: string;
  date: string; // ISO yyyy-MM-dd
}

export const holidayService = {
  getByRange: async (startDate: string, endDate: string): Promise<HolidayDTO[]> => {
    // Backend endpoint: /api/hrm/holidays/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
    return api.get<HolidayDTO[]>(`/hrm/holidays/range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);
  },
};

export default holidayService;
