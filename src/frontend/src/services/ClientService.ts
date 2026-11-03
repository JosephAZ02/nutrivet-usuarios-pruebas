import api from "./Api";
import type Client from "../interfaces/Client";

export async function getAllClients(): Promise<Client[]> {
  const response = await api.get<Client[]>("/client/all");
  return response.data;
}

export async function addClient(client: Client): Promise<Client> {
  const response = await api.post<Client>("/client/add", client);
  return response.data;
}


export async function updateClient(client: Client): Promise<Client> {
  const response = await api.put<Client>(`/client/update/${client.id}`, client);
  return response.data;
}


export async function deleteClient(id: string): Promise<void> {
  await api.delete(`/client/delete/${id}`);
}