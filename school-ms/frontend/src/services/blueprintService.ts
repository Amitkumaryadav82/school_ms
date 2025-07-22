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
  examId: number;
  questions: QuestionSpec[];
}


export const getBlueprint = async (examId: number, classId: number, subjectId: number): Promise<BlueprintUnit[]> => {
  return api.get(`/api/blueprint?examId=${examId}&classId=${classId}&subjectId=${subjectId}`);
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


export const deleteAllUnits = async (examId: number, classId: number, subjectId: number): Promise<void> => {
  return api.delete(`/api/blueprint?examId=${examId}&classId=${classId}&subjectId=${subjectId}`);
};
