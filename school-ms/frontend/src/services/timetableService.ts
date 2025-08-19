import api from './api';

export interface TimetableSettings {
  id?: number;
  working_days_mask: number; // kept for backward compatibility from API mapping
  periods_per_day: number;
  period_duration_min: number;
  lunch_after_period: number;
  max_periods_per_teacher_per_day?: number;
  // CamelCase fields expected from backend (JPA -> Jackson)
  workingDaysMask?: number;
  periodsPerDay?: number;
  periodDurationMin?: number;
  lunchAfterPeriod?: number;
  maxPeriodsPerTeacherPerDay?: number;
  startTime?: string; // HH:mm:ss
  endTime?: string;   // HH:mm:ss
}

export const weekdayBits = [1, 2, 4, 8, 16, 32, 64];

export const timetableService = {
  async getSettings(): Promise<TimetableSettings> {
    // Backend returns default if none exists; normalize shape
    const res = await api.get<any>('/api/timetable/settings');
    // Map camelCase to snake-case copy expected by UI components
    const out: TimetableSettings = {
      id: res.id,
      working_days_mask: res.workingDaysMask ?? res.working_days_mask ?? 31,
      periods_per_day: res.periodsPerDay ?? res.periods_per_day ?? 8,
      period_duration_min: res.periodDurationMin ?? res.period_duration_min ?? 40,
      lunch_after_period: res.lunchAfterPeriod ?? res.lunch_after_period ?? 4,
  max_periods_per_teacher_per_day: res.maxPeriodsPerTeacherPerDay ?? res.max_periods_per_teacher_per_day ?? 5,
      workingDaysMask: res.workingDaysMask,
      periodsPerDay: res.periodsPerDay,
      periodDurationMin: res.periodDurationMin,
      lunchAfterPeriod: res.lunchAfterPeriod,
  maxPeriodsPerTeacherPerDay: res.maxPeriodsPerTeacherPerDay,
      startTime: res.startTime ?? res.start_time,
      endTime: res.endTime ?? res.end_time,
    };
    return out;
  },
  async saveSettings(payload: Partial<TimetableSettings>): Promise<TimetableSettings> {
    // Convert to backend camelCase
    const body: any = {
      workingDaysMask: payload.workingDaysMask ?? payload.working_days_mask,
      periodsPerDay: payload.periodsPerDay ?? payload.periods_per_day,
      periodDurationMin: payload.periodDurationMin ?? payload.period_duration_min,
      lunchAfterPeriod: payload.lunchAfterPeriod ?? payload.lunch_after_period,
  maxPeriodsPerTeacherPerDay: payload.maxPeriodsPerTeacherPerDay ?? payload.max_periods_per_teacher_per_day,
      startTime: payload.startTime,
      endTime: payload.endTime,
    };
    const res = await api.put<any>('/api/timetable/settings', body);
    return {
      id: res.id,
      working_days_mask: res.workingDaysMask ?? 31,
      periods_per_day: res.periodsPerDay ?? 8,
      period_duration_min: res.periodDurationMin ?? 40,
      lunch_after_period: res.lunchAfterPeriod ?? 4,
  max_periods_per_teacher_per_day: res.maxPeriodsPerTeacherPerDay ?? 5,
      workingDaysMask: res.workingDaysMask,
      periodsPerDay: res.periodsPerDay,
      periodDurationMin: res.periodDurationMin,
      lunchAfterPeriod: res.lunchAfterPeriod,
  maxPeriodsPerTeacherPerDay: res.maxPeriodsPerTeacherPerDay,
      startTime: res.startTime,
      endTime: res.endTime,
    };
  },
  // Placeholders for future APIs
  async getClassSections(classId: number): Promise<string[]> {
    return await api.get<string[]>(`/api/classes/${classId}/sections`);
  },
};

export default timetableService;
