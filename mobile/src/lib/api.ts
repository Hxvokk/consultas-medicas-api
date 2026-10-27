import { http } from '../api/http';

export type DashboardSummary = {
  metricas: {
    totalPacientes: number;
    citasHoy: number;
    medicosActivos: number;
  };
  proximasCitas: {
    idCita: number;
    fechaHora: string;
    motivo: string;
    estado: string;
    paciente: string;
    medico: string;
    consultorio: string | null;
  }[];
  alertas: { tipo: string; mensaje: string }[];
};

export async function getDashboard() {
  const response = await http.get<DashboardSummary>('/api/dashboard/summary');
  return response.data;
}
