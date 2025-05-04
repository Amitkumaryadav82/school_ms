export interface Course {
    id?: number;
    name: string;
    department: string;
    teacher: string;
    credits: number;
    capacity: number;
    enrolled: number;
}
export declare const courseService: {
    getAll: () => Promise<import("axios").AxiosResponse<Course[], any>>;
    getById: (id: number) => Promise<import("axios").AxiosResponse<Course, any>>;
    create: (course: Course) => Promise<import("axios").AxiosResponse<Course, any>>;
    update: (id: number, course: Course) => Promise<import("axios").AxiosResponse<Course, any>>;
    delete: (id: number) => Promise<import("axios").AxiosResponse<any, any>>;
    enrollStudent: (courseId: number, studentId: number) => Promise<import("axios").AxiosResponse<any, any>>;
    unenrollStudent: (courseId: number, studentId: number) => Promise<import("axios").AxiosResponse<any, any>>;
};
