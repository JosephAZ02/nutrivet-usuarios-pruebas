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
    },

    update: async (id: number, userData: any) => {
        const response = await api.put(`/user/update/${id}`, userData);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/user/delete/${id}`);
        return response.data;
    }
};