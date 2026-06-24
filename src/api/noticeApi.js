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
  const response = await axiosInstance.get('/notices/templates');
  console.log("[noticeApi] getNoticeTemplates - 서버 응답 데이터 수신 완료:", response.data);
  return response.data;
};

export const getRecentNoticesForSelect = async () => {
  console.log("[noticeApi] getRecentNoticesForSelect - 이전 글 리스트 요청 호출 시작");
  const response = await axiosInstance.get('/notices');
  console.log("[noticeApi] getRecentNoticesForSelect - 서버 응답 데이터 수신 완료:", response.data);
  
  return response.data.content || response.data.data || response.data;
};

export const createNoticeTemplate = async (payload) => {
  console.log("[noticeApi] createNoticeTemplate 호출됨 - 전달된 데이터 객체:", payload);
  const response = await axiosInstance.post('/notices/templates', payload);
  console.log("[noticeApi] createNoticeTemplate 서버 응답 데이터 수신 완료:", response.data);
  return response.data;
};

// 🚨 수정: 주소창 앞의 '/api' 제거
export const getAutoTexts = async () => {
  const response = await axiosInstance.get('/notices/autotexts');
  return response.data;
};

// 🚨 수정: 주소창 앞의 '/api' 제거
export const createAutoText = async (data) => {
  const response = await axiosInstance.post('/notices/autotexts', data);
  return response.data;
};

// 🚨 수정: 주소창 앞의 '/api' 제거
export const deleteAutoText = async (id) => {
  const response = await axiosInstance.delete(`/notices/autotexts/${id}`);
  return response.data;
};

export const getDraftNotices = async () => {
  const response = await axiosInstance.get('/notices/drafts');
  return response.data;
};

