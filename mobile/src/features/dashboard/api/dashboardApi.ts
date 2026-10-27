import { http } from '../../../shared/api/http';
import type { DashboardSummary } from '../types/dashboard';

export type { DashboardSummary } from '../types/dashboard';

export async function getDashboard() {
  const response = await http.get<DashboardSummary>('/api/dashboard/summary');
  return response.data;
}
