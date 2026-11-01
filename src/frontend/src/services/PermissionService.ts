import api from './Api';

export interface PermissionResponse {
    id: number;
    name: string;
    description: string;
}

export const PermissionService = {
    getAll: async (): Promise<PermissionResponse[]> => {
        const response = await api.get('/permission/all');
        return response.data;
    }
};