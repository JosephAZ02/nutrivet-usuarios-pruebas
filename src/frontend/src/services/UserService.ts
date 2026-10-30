import api from "./Api";




export interface UserResponse {
  id: number;
  name: string;
  username: string;
  idRole: number;
}

export const UserService = {
  getAll: async (): Promise<UserResponse[]> => {
    const response = await api.get('/user/all');
    return response.data;
  },
  
  create: async (userData: any) => {
    const response = await api.post('/user/add', userData);
    return response.data;
  }
};