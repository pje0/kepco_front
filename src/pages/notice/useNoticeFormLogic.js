// src/pages/notice/useNoticeFormLogic.js (v1.4)
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { getNotice, createNotice, updateNotice } from '@/api/noticeApi';

export default function useNoticeFormLogic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isEditMode = !!id; // id가 존재하면 수정 모드
  const [isLoading, setIsLoading] = useState(isEditMode);

  const [formData, setFormData] = useState({
    title: '',
    department: user?.department || '총괄관리부',
    isPinned: false,
    content: '',
    publishAt: ''
  });

  // 수정 모드일 경우 기존 데이터 불러오기
  useEffect(() => {
    if (isEditMode) {
      getNotice(id)
        .then(data => {
          setFormData({
            title: data.title || '',
            department: data.department || '총괄관리부',
            isPinned: data.priority === 'high' || data.isPinned === true,
            content: data.content || '',
            publishAt: data.publishAt || '' // 🚨 수정 모드 시 기존 예약 시간도 불러오기 추가
          });
        })
        .catch(() => {
          toast.error('공지사항을 불러오는데 실패했습니다.');
          navigate('/notice');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, navigate, isEditMode]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 🚨 중첩되어 꼬여있던 함수를 깔끔하게 하나로 통합 완료
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // [콘솔 로그] 폼 제출 시도 확인
    console.log("[NoticeForm] 공지사항 폼 제출 시도 - 현재 폼 데이터:", formData);

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        publishAt: formData.publishAt ? formData.publishAt : null
      };

      // [콘솔 로그] API 전송 전 페이로드 확인
      console.log("[NoticeForm] API 전송 페이로드 (publishAt 포함 여부 확인):", payload);

      if (isEditMode) {
        await updateNotice(id, payload);
      } else {
        await createNotice(payload);
      }
      
      // 예약 날짜(publishAt)가 존재하는지 검사하여 메시지 동적 변경
      let successMessage = `공지사항이 ${isEditMode ? '수정' : '등록'}되었습니다.`;
      if (payload.publishAt) {
        successMessage = isEditMode ? '예약이 수정되었습니다.' : '예약이 등록되었습니다.';
      }
      
      // [콘솔 로그] 최종 결정된 성공 알림 메시지 확인
      console.log("[NoticeForm] 화면에 출력될 성공 알림 메시지:", successMessage);

      // 토스트 팝업 띄우기
      toast.success(successMessage, { position: 'bottom-right' });
      navigate('/notice');
      
    } catch (error) {
      // [콘솔 로그] 에러 발생 시 로그 출력
      console.error("[NoticeForm] 저장 중 통신 에러 발생:", error);
      toast.error('저장에 실패했습니다.', { position: 'bottom-right' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => navigate(-1);

  return {
    isEditMode,
    formData,
    isLoading,
    handleChange,
    handleSubmit,
    handleCancel
  };
}