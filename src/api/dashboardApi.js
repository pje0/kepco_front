// src/api/dashboardApi.js
import axiosInstance from './axiosInstance';

/**
 * 대시보드 통계 데이터 (실제 DB 연동 완료)
 */
export async function getDashboardStats() {
  const response = await axiosInstance.get('/dashboard/stats');
  return response.data;
}