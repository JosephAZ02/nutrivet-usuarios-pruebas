import api from './Api';

export const RolePermissionService = {

    getByRole: async (roleId: number): Promise<number[]> => {
        const response = await api.get(`/role-permission/role/${roleId}`);
        return response.data;
    },


    update: async (roleId: number, permissionIds: number[]): Promise<string> => {
        const response = await api.post(`/role-permission/update/${roleId}`, { permissionIds });
        return response.data;
    }
};