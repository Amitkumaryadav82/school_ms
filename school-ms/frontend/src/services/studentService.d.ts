export interface Student {
    id?: number;
    name: string;
    grade: string;
    email: string;
    phoneNumber: string;
}
export declare const studentService: {
    getAll: () => Promise<import("axios").AxiosResponse<Student[], any>>;
    getById: (id: number) => Promise<import("axios").AxiosResponse<Student, any>>;
    create: (student: Student) => Promise<import("axios").AxiosResponse<Student, any>>;
    update: (id: number, student: Student) => Promise<import("axios").AxiosResponse<Student, any>>;
    delete: (id: number) => Promise<import("axios").AxiosResponse<any, any>>;
};
