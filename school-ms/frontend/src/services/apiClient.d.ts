import { AxiosInstance } from 'axios';

interface CustomApiInstance extends AxiosInstance {
  isOffline?: boolean;
  getApiInstance?: () => AxiosInstance;
}

export const api: CustomApiInstance;