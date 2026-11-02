import api from './Api';

export interface RoleResponse {
    id: number;
    name: string;
    description: string;
}

export const RoleService = {
    getAll: async (): Promise<RoleResponse[]> => {
        const response = await api.get('/role/all');
        return response.data;
    },
    create: async (roleData: { name: string; description: string }) => {
        const response = await api.post('/role/add', roleData);
        return response.data;
    },
    update: async (id: number, roleData: { name: string; description: string }) => {
        const response = await api.put(`/role/update/${id}`, roleData);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/role/delete/${id}`);
        return response.data;
    }
};