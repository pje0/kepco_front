import axiosInstance from './axiosInstance';

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