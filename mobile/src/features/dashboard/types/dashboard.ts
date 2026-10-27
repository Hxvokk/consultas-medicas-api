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
