import api from './api';

export interface QuestionSpec {
  count: number;
  marksPerQuestion: number;
}


export interface BlueprintUnit {
  id?: number;
  name: string;
  marks: number;
  schoolClass: { id: number };
  subject: { id: number };
  exam: { id: number };
  questions: QuestionSpec[];
}


export const getBlueprint = async (examId: number, classId: number, subjectId: number): Promise<BlueprintUnit[]> => {
  return api.get(`/api/blueprint?examId=${examId}&classId=${classId}&subjectId=${subjectId}`);
};


export const addUnit = async (unit: BlueprintUnit): Promise<BlueprintUnit> => {
  // Only send required fields in nested objects
  const payload = {
    ...unit,
    schoolClass: { id: unit.schoolClass.id },
    subject: { id: unit.subject.id },
    exam: { id: unit.exam.id },
  };
  return api.post('/api/blueprint', payload);
};


export const updateUnit = async (id: number, unit: BlueprintUnit): Promise<BlueprintUnit> => {
  // Only send required fields in nested objects
  const payload = {
    ...unit,
    schoolClass: { id: unit.schoolClass.id },
    subject: { id: unit.subject.id },
    exam: { id: unit.exam.id },
  };
  return api.put(`/api/blueprint/${id}`, payload);
};

export const deleteUnit = async (id: number): Promise<void> => {
  return api.delete(`/api/blueprint/${id}`);
};


export const deleteAllUnits = async (examId: number, classId: number, subjectId: number): Promise<void> => {
  return api.delete(`/api/blueprint?examId=${examId}&classId=${classId}&subjectId=${subjectId}`);
};
