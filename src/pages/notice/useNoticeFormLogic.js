// src/pages/notice/useNoticeFormLogic.js (v1.5)
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { getNotice, createNotice, updateNotice, getNoticeTemplates, getRecentNoticesForSelect } from '@/api/noticeApi';

export default function useNoticeFormLogic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isEditMode = !!id; // id가 존재하면 수정 모드
  const [isLoading, setIsLoading] = useState(isEditMode);

  // 🚨 신규: 셀렉트 박스 바인딩용 목록 상태값 추가
  const [templates, setTemplates] = useState([]);
  const [recentNotices, setRecentNotices] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    department: user?.department || '총괄관리부',
    isPinned: false,
    content: '',
    publishAt: ''
  });

  // 컴포넌트 로드 시 데이터 패칭 통합 관리
  useEffect(() => {
    console.log("[useNoticeFormLogic v1.5] 데이터 로드 시작 - 수정모드 상태:", isEditMode);
    
    // 1. 수정 모드일 경우 본문 데이터 단건 조회
    if (isEditMode) {
      getNotice(id)
        .then(data => {
          console.log("[useNoticeFormLogic v1.5] 기존 공지사항 상세 조회 성공:", data);
          setFormData({
            title: data.title || '',
            department: data.department || '총괄관리부',
            isPinned: data.priority === 'high' || data.isPinned === true,
            content: data.content || '',
            publishAt: data.publishAt || '' 
          });
        })
        .catch((err) => {
          console.error("[useNoticeFormLogic v1.5] 공지사항 상세 조회 실패:", err);
          toast.error('공지사항을 불러오는데 실패했습니다.');
          navigate('/notice');
        })
        .finally(() => setIsLoading(false));
    }

    // 2. 고정 분리형 템플릿 목록 조회
    getNoticeTemplates()
      .then(data => {
        console.log("[useNoticeFormLogic v1.5] DB 템플릿 목록 조회 성공:", data);
        setTemplates(data || []);
      })
      .catch(err => {
        console.error("[useNoticeFormLogic v1.5] DB 템플릿 목록 조회 실패:", err);
      });

    // 3. 복사용 이전 공지사항 목록 조회
    getRecentNoticesForSelect()
      .then(data => {
        console.log("[useNoticeFormLogic v1.5] 복사용 최근 공지 목록 조회 성공:", data);
        setRecentNotices(data || []);
      })
      .catch(err => {
        console.error("[useNoticeFormLogic v1.5] 복사용 최근 공지 목록 조회 실패:", err);
      });

  }, [id, navigate, isEditMode]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 🚨 신규 핸들러: 선택한 고정 템플릿 데이터 적용
  const handleApplyTemplate = (templateId) => {
    console.log("[useNoticeFormLogic v1.5] handleApplyTemplate 호출됨 - ID:", templateId);
    if (!templateId) return;
    
    const target = templates.find(t => String(t.id) === String(templateId));
    if (target) {
      console.log("[useNoticeFormLogic v1.5] 선택된 템플릿 폼 매핑 진행:", target);
      setFormData(prev => ({
        ...prev,
        title: target.title || prev.title,
        content: target.content || prev.content
      }));
      toast.success('선택하신 고정 템플릿 서식이 본문에 적용되었습니다.');
    }
  };

  // 🚨 신규 핸들러: 선택한 과거 공지사항 글 데이터 단건 조회 후 복사
  const handleApplyPreviousNotice = (noticeId) => {
    console.log("[useNoticeFormLogic v1.5] handleApplyPreviousNotice 호출됨 - ID:", noticeId);
    if (!noticeId) return;

    setIsLoading(true);
    getNotice(noticeId)
      .then(data => {
        console.log("[useNoticeFormLogic v1.5] 복사용 과거 글 단건 상세 데이터 로드 완료:", data);
        setFormData(prev => ({
          ...prev,
          title: data.title ? `[복사] ${data.title}` : prev.title,
          content: data.content || prev.content
        }));
        toast.success('선택하신 과거 공지사항 내용이 본문으로 복사되었습니다.');
      })
      .catch(err => {
        console.error("[useNoticeFormLogic v1.5] 과거 글 상세 로드 중 에러:", err);
        toast.error('과거 글 내용을 불러오는데 실패했습니다.');
      })
      .finally(() => setIsLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      console.log("[NoticeForm] API 전송 페이로드 (publishAt 포함 여부 확인):", payload);

      if (isEditMode) {
        await updateNotice(id, payload);
      } else {
        await createNotice(payload);
      }
      
      let successMessage = `공지사항이 ${isEditMode ? '수정' : '등록'}되었습니다.`;
      if (payload.publishAt) {
        successMessage = isEditMode ? '예약이 수정되었습니다.' : '예약이 등록되었습니다.';
      }
      
      console.log("[NoticeForm] 화면에 출력될 성공 알림 메시지:", successMessage);
      toast.success(successMessage, { position: 'bottom-right' });
      navigate('/notice');
      
    } catch (error) {
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
    templates,
    recentNotices,
    handleChange,
    handleSubmit,
    handleCancel,
    handleApplyTemplate,
    handleApplyPreviousNotice
  };
}