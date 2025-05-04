export interface CustomError {
  message: string;
  status: number | string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export default interface Api {
  getApiInstance(): any;
}
