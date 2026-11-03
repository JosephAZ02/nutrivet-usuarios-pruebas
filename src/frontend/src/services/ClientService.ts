import api from "./Api";
import type Client from "../interfaces/Client";


export async function getAllClients(): Promise<Client[]> {
  const response = await api.get<Client[]>("/client/all");
  return response.data;
}


export async function getClientById(id: string): Promise<Client> {
  const response = await api.get<Client>(`/client/get/${id}`);
  return response.data;
}


export async function addClient(client: Client): Promise<Client> {
  const response = await api.post<Client>("/client/add", client);
  return response.data;
}


export async function updateClient(id: string, client: Client): Promise<Client> {
  const response = await api.put<Client>(`/client/update/${id}`, client);
  return response.data;
}


export async function deleteClient(id: string): Promise<string> {
  const response = await api.delete<string>(`/client/delete/${id}`);
  return response.data;
}