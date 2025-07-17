import api from "./axios";

// Интерфейс для одного объекта доставки
export interface Delivery {
  id: number;
  transport_model: { id: number; name: string };
  packaging: { id: number; name: string };
  service: { id: number; name: string };
  status: { id: number; name: string };
  distance_km: string;
  send_time: string;
  delivery_time: string;
  file: string | null;
  created_by: string;
  vehicle_number: string;
  tech_state: { id: number; name: string };
  created_at: string;
}

// Получение доставок
export async function fetchDeliveries(): Promise<Delivery[]> {
  const res = await api.get<Delivery[]>("deliveries/");
  return res.data;
}