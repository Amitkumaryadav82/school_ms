import apiClient from './apiClient';

export async function getClassesWithExamConfig() {
  const res = await apiClient.get('/api/exam-configs/classes');
  return res.data;
}

export async function getSubjectsForClass(classId: number) {
  const res = await apiClient.get('/api/exam-configs/subjects', { params: { classId } });
  return res.data;
}
