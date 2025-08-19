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

export interface SubjectOption { id: number; code: string; name: string }
export interface TeacherOption { id: number; name: string }

export interface UpdateSlotRequest {
  classId: number;
  section: string; // can be letter or numeric id
  dayOfWeek: number; // 1=Mon .. 5=Fri
  periodNo: number;
  subjectId?: number | null;
  teacherDetailsId?: number | null;
  locked?: boolean;
}

export const timetableApi = {
  async getSlots(classId: number, section: string): Promise<SlotsResponse> {
    return await api.get<SlotsResponse>(`/api/timetable/slots?classId=${classId}&section=${encodeURIComponent(section)}`);
  },
  async generate(classId: number, section: string, lockExisting = true): Promise<SlotsResponse> {
    return await api.post<SlotsResponse>(`/api/timetable/generate`, { classId, section, lockExisting });
  },
  async getAvailableSubjects(classId: number, section: string): Promise<SubjectOption[]> {
    const res = await api.get<{ subjects: any[] }>(`/api/timetable/available-subjects?classId=${classId}&section=${encodeURIComponent(section)}`);
    const list = (res as any)?.subjects || (res as any)?.SUBJECTS || [];
    // Normalize possible key variants from JDBC maps (ID/CODE/NAME) or alternate names
    const mapped = (list as any[]).map((s: any) => ({
      id: Number(s?.id ?? s?.ID ?? s?.subjectId ?? s?.SUBJECT_ID ?? s?.subject_id ?? 0),
      code: String(s?.code ?? s?.CODE ?? s?.subjectCode ?? s?.SUBJECT_CODE ?? s?.subject_code ?? ''),
      name: String(s?.name ?? s?.NAME ?? s?.subjectName ?? s?.SUBJECT_NAME ?? s?.subject_name ?? '')
    }));
    // Filter invalid and de-duplicate by id
    const seen = new Set<number>();
    return mapped.filter(s => s.id > 0 && !seen.has(s.id) && seen.add(s.id));
  },
  async getEligibleTeachers(classId: number, section: string, subjectId: number): Promise<TeacherOption[]> {
    const res = await api.get<{ teachers: any[] }>(`/api/timetable/eligible-teachers?classId=${classId}&section=${encodeURIComponent(section)}&subjectId=${subjectId}`);
    const list = (res as any)?.teachers || (res as any)?.TEACHERS || [];
    const mapped = (list as any[]).map((t: any) => ({
      id: Number(t?.id ?? t?.ID ?? t?.teacherDetailsId ?? t?.TEACHER_DETAILS_ID ?? t?.teacher_details_id ?? 0),
      name: String(t?.name ?? t?.NAME ?? t?.teacherName ?? t?.TEACHER_NAME ?? t?.teacher_name ?? '')
    }));
    const seen = new Set<number>();
    return mapped.filter(t => t.id > 0 && !seen.has(t.id) && seen.add(t.id));
  },
  async updateSlot(payload: UpdateSlotRequest): Promise<SlotsResponse> {
    return await api.post<SlotsResponse>(`/api/timetable/update-slot`, payload);
  }
};

export default timetableApi;
