import api from './api';

export interface SlotsResponse {
  periodsPerDay: number;
  days: string[];
  grid: Record<number, Record<number, {
    subjectId?: number;
    teacherDetailsId?: number;
    locked?: boolean;
    subjectCode?: string;
    subjectName?: string;
    teacherName?: string;
  }>>;
}

export const timetableApi = {
  async getSlots(classId: number, section: string): Promise<SlotsResponse> {
    return await api.get<SlotsResponse>(`/api/timetable/slots?classId=${classId}&section=${encodeURIComponent(section)}`);
  },
  async generate(classId: number, section: string, lockExisting = true): Promise<SlotsResponse> {
    return await api.post<SlotsResponse>(`/api/timetable/generate`, { classId, section, lockExisting });
  }
};

export default timetableApi;
