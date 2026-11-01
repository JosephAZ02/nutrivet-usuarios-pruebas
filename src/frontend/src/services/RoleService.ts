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
    }
};