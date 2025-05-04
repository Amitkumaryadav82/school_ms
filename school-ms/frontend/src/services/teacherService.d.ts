export interface Teacher {
    id?: number;
    name: string;
    subject: string;
    email: string;
    phoneNumber: string;
    department: string;
}
export declare const teacherService: {
    getAll: () => Promise<import("axios").AxiosResponse<Teacher[], any>>;
    getById: (id: number) => Promise<import("axios").AxiosResponse<Teacher, any>>;
    create: (teacher: Teacher) => Promise<import("axios").AxiosResponse<Teacher, any>>;
    update: (id: number, teacher: Teacher) => Promise<import("axios").AxiosResponse<Teacher, any>>;
    delete: (id: number) => Promise<import("axios").AxiosResponse<any, any>>;
};
