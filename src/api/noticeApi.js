import axiosInstance from './axiosInstance';
import axios from 'axios';

/**
 * 공지사항 전체 목록 조회 API
 */
export async function getNotices() {
  try {
    const response = await axiosInstance.get('/notices');
    return response.data; // 백엔드 응답에서 실제 데이터 부분만 추출하여 프론트엔드로 전달
  } catch (error) {
    console.error('공지사항 목록을 불러오는데 실패했습니다:', error);
    throw error;
  }
}

/**
 * 공지사항 상세 조회 API 
 */
export async function getNotice(id) {
  try {
    const response = await axiosInstance.get(`/notices/${id}`);
    return response.data;
  } catch (error) {
    console.error(`공지사항(${id}) 상세 정보를 불러오는데 실패했습니다:`, error);
    throw error;
  }
}

export async function createNotice(data) {
  const response = await axiosInstance.post('/notices', data);
  return response.data;
}

export async function updateNotice(id, data) {
  const response = await axiosInstance.put(`/notices/${id}`, data);
  return response.data;
}

export async function deleteNotice(id) {
  const response = await axiosInstance.delete(`/notices/${id}`);
  return response.data;
}

// src/api/noticeApi.js

export const getNoticeTemplates = async () => {
  console.log("[noticeApi] getNoticeTemplates - 템플릿 목록 요청 호출 시작");
  const response = await axios.get('/api/notices/templates');
  console.log("[noticeApi] getNoticeTemplates - 서버 응답 데이터 수신 완료:", response.data);
  return response.data;
};

export const getRecentNoticesForSelect = async () => {
  console.log("[noticeApi] getRecentNoticesForSelect - 이전 글 리스트 요청 호출 시작");
  const response = await axios.get('/api/notices');
  console.log("[noticeApi] getRecentNoticesForSelect - 서버 응답 데이터 수신 완료:", response.data);
  
  // 🚨 페이징 객체일 경우(content)와 일반 배열일 경우를 모두 커버하는 안전한 반환 로직
  return response.data.content || response.data.data || response.data;
};