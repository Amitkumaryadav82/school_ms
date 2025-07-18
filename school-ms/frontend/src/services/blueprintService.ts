import api from './api';

export interface QuestionSpec {
  count: number;
  marksPerQuestion: number;
}

export interface BlueprintUnit {
  id?: number;
  name: string;
  marks: number;
  classId: number;
  subjectId: number;
  questions: QuestionSpec[];
}

export const getBlueprint = async (classId: number, subjectId: number): Promise<BlueprintUnit[]> => {
  return api.get(`/api/blueprint?classId=${classId}&subjectId=${subjectId}`);
};

export const addUnit = async (unit: BlueprintUnit): Promise<BlueprintUnit> => {
  return api.post('/api/blueprint', unit);
};

export const updateUnit = async (id: number, unit: BlueprintUnit): Promise<BlueprintUnit> => {
  return api.put(`/api/blueprint/${id}`, unit);
};

export const deleteUnit = async (id: number): Promise<void> => {
  return api.delete(`/api/blueprint/${id}`);
};

export const deleteAllUnits = async (classId: number, subjectId: number): Promise<void> => {
  return api.delete(`/api/blueprint?classId=${classId}&subjectId=${subjectId}`);
};
