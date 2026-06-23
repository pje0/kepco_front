// src/pages/notice/useNoticeFormLogic.js (v1.7)
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { getNotice, createNotice, updateNotice, getNoticeTemplates, getRecentNoticesForSelect, createNoticeTemplate } from '@/api/noticeApi';
import axios from 'axios'; // 🚨 통신 예외 처리를 위한 axios 직접 참조 포함

export default function useNoticeFormLogic() {
  const { id } = useParams(); // URL 파라미터에서 공지사항 ID 추출
  const navigate = useNavigate(); // 페이지 이동을 위한 네비게이트 함수
  const { user } = useAuth(); // 로그인된 사용자 정보 확인
  
  const isEditMode = !!id; // ID 존재 여부에 따른 수정/등록 모드 판별
  const [isLoading, setIsLoading] = useState(isEditMode); // 로딩 상태 제어

  const [templates, setTemplates] = useState([]); // 조회된 고정 템플릿 목록 상태 관리
  const [recentNotices, setRecentNotices] = useState([]); // 조회된 최근 공지사항 목록 상태 관리

  // 폼 입력 필드 데이터 상태 정의
  const [formData, setFormData] = useState({
    title: '',
    department: user?.department || '총괄관리부',
    isPinned: false,
    content: '',
    publishAt: ''
  });

  // 컴포넌트 마운트 및 수정을 위한 초기 데이터 로드 비동기 처리
  useEffect(() => {
    console.log("[useNoticeFormLogic v1.7] 공지사항 작성 폼 초기화 실행 - 수정 모드 여부:", isEditMode);
    
    // 1. 기존 공지사항 수정 모드일 경우 데이터 로드
    if (isEditMode) {
      console.log("[useNoticeFormLogic v1.7] 수정 타겟 공지사항 데이터 단건 요청 ID:", id);
      getNotice(id)
        .then(data => {
          console.log("[useNoticeFormLogic v1.7] 기존 공지사항 데이터 수신 성공:", data);
          setFormData({
            title: data.title || '',
            department: data.department || '총괄관리부',
            isPinned: data.priority === 'high' || data.isPinned === true,
            content: data.content || '',
            publishAt: data.publishAt || '' 
          });
        })
        .catch((err) => {
          console.error("[useNoticeFormLogic v1.7] 공지사항 상세 데이터 로드 실패 원인:", err);
          toast.error('공지사항 데이터를 불러오는 과정에서 오류가 발생했습니다.');
          navigate('/notice');
        })
        .finally(() => setIsLoading(false));
    }

    // 2. 가로 그리드 바인딩을 위한 고정 분리형 템플릿 목록 조회
    console.log("[useNoticeFormLogic v1.7] 백엔드 템플릿 데이터 목록 API 전체 호출 시도");
    getNoticeTemplates()
      .then(data => {
        console.log("[useNoticeFormLogic v1.7] 백엔드 데이터베이스 등록 템플릿 확인 완료:", data);
        setTemplates(data || []);
      })
      .catch(err => {
        console.error("[useNoticeFormLogic v1.7] 템플릿 데이터 API 조회 오류:", err);
      });

    // 3. 내용 복사용 이전 공지사항 최신 목록 데이터 조회
    console.log("[useNoticeFormLogic v1.7] 복사 타겟용 공지사항 이력 리스트 전체 호출");
    getRecentNoticesForSelect()
      .then(data => {
        console.log("[useNoticeFormLogic v1.7] 이전 등록 공지사항 데이터 수신 검증:", data);
        setRecentNotices(data || []);
      })
      .catch(err => {
        console.error("[useNoticeFormLogic v1.7] 이전 공지사항 목록 API 불러오기 오류:", err);
      });

  }, [id, navigate, isEditMode]);

  // 입력 필드 제어용 변경 공통 핸들러
  const handleChange = (field, value) => {
    console.log(`[useNoticeFormLogic v1.7] 데이터 필드 실시간 업데이트 -> [${field}]:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 선택한 고정 서식 데이터를 본문 필드에 할당하는 매핑 제어기
  const handleApplyTemplate = (templateId) => {
    console.log("[useNoticeFormLogic v1.7] handleApplyTemplate 매핑 요청 수신 ID:", templateId);
    if (!templateId) return;
    
    const target = templates.find(t => String(t.id) === String(templateId));
    if (target) {
      console.log("[useNoticeFormLogic v1.7] 매핑 대상 타겟 데이터 매칭 확인:", target);
      setFormData(prev => ({
        ...prev,
        title: target.title || prev.title,
        content: target.content || prev.content
      }));
      toast.success('선택하신 고정 템플릿 양식이 에디터 본문에 자동 렌더링되었습니다.');
    }
  };

  // 과거에 등록한 공지 데이터를 그대로 폼에 복제하는 매핑 제어기
  const handleApplyPreviousNotice = (noticeId) => {
    console.log("[useNoticeFormLogic v1.7] handleApplyPreviousNotice 단건 이력 가져오기 시작 ID:", noticeId);
    if (!noticeId) return;

    setIsLoading(true);
    getNotice(noticeId)
      .then(data => {
        console.log("[useNoticeFormLogic v1.7] 과거 작성 이력 데이터 세부 수신 완료:", data);
        setFormData(prev => ({
          ...prev,
          title: data.title ? `[복사] ${data.title}` : prev.title,
          content: data.content || prev.content
        }));
        toast.success('선택하신 과거 공지사항 글이 현재 에디터 본문으로 완벽히 복사되었습니다.');
      })
      .catch(err => {
        console.error("[useNoticeFormLogic v1.7] 과거 공지사항 단건 세부 내역 로드 에러:", err);
        toast.error('과거 공지 내역을 역직렬화하는 중 오류가 발생했습니다.');
      })
      .finally(() => setIsLoading(false));
  };

  // 공지사항 폼 검증 및 비동기 전송 처리기
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[useNoticeFormLogic v1.7] handleSubmit 최종 백엔드 전송 절차 돌입 페이로드 데이터:", formData);

    if (!formData.title.trim() || !formData.content.trim()) {
      console.warn("[useNoticeFormLogic v1.7] 유효성 검증 실패 - 제목 혹은 내용 공백 상태");
      toast.error('제목과 본문 내용을 누락 없이 모두 입력해 주셔야 최종 등록이 가능합니다.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        publishAt: formData.publishAt ? formData.publishAt : null
      };

      console.log("[useNoticeFormLogic v1.7] 전송 직전 직렬화 페이로드 구조 점검:", payload);

      if (isEditMode) {
        await updateNotice(id, payload);
      } else {
        await createNotice(payload);
      }
      
      let successMessage = `공지사항이 정상적으로 ${isEditMode ? '수정' : '등록'}되었습니다.`;
      if (payload.publishAt) {
        successMessage = isEditMode ? '예약 공지 변경 처리가 완료되었습니다.' : '공지사항이 예약 상태로 정상 등록되었습니다.';
      }
      
      console.log("[useNoticeFormLogic v1.7] 작업 성공 처리 안내문 출력 메시지:", successMessage);
      toast.success(successMessage, { position: 'bottom-right' });
      navigate('/notice');
      
    } catch (error) {
      console.error("[useNoticeFormLogic v1.7] 공지사항 영속화 과정 중 통신 예외 발생 로그:", error);
      toast.error('공지사항 서버 저장 처리에 실패했습니다.', { position: 'bottom-right' });
    } finally {
      setIsLoading(false);
    }
  };

  // 현재 입력한 제목과 내용을 고정형 템플릿 테이블에 인서트하는 영속화 핸들러
  const handleSaveAsTemplate = async () => {
    console.log("[useNoticeFormLogic v1.7] handleSaveAsTemplate 현재 입력 폼 기준 신규 템플릿 생성 프로세스 개시:", formData);
    
    if (!formData.title.trim() || !formData.content.trim()) {
      console.warn("[useNoticeFormLogic v1.7] 템플릿 생성 실패 - 유효 데이터 미달");
      toast.error('현재 에디터에 작성된 제목과 내용을 기반으로 저장되므로, 빈 칸을 모두 채워주십시오.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        department: formData.department
      };

      console.log("[useNoticeFormLogic v1.7] 템플릿 테이블 신규 영속화 전송 페이로드 확인:", payload);
      const savedResult = await createNoticeTemplate(payload);
      console.log("[useNoticeFormLogic v1.7] 백엔드 데이터베이스 신규 템플릿 인서트 응답 개체:", savedResult);
      
      toast.success('작성하신 서식이 새로운 고정 템플릿 데이터로 영구 보관되었습니다.');

      console.log("[useNoticeFormLogic v1.7] 템플릿 추가에 따른 상단 셀렉트박스 데이터 목록 재갱신 쿼리 기동");
      const updatedTemplates = await getNoticeTemplates();
      setTemplates(updatedTemplates || []);

    } catch (error) {
      console.error("[useNoticeFormLogic v1.7] 템플릿 테이블 인서트 통신 오류 로깅:", error);
      toast.error('템플릿 서식을 추가하는 중 시스템 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 🚨 신규 추가: 등록되어 있는 고정 템플릿 양식을 삭제하는 비동기 핸들러
  const handleDeleteTemplate = async (templateId) => {
    console.log("[useNoticeFormLogic v1.7] handleDeleteTemplate 특정 템플릿 삭제 명령 수신 ID:", templateId);
    if (!templateId) return;

    if (!window.confirm("선택하신 고정 템플릿 양식을 정말 데이터베이스에서 전면 삭제하시겠습니까?")) {
      console.log("[useNoticeFormLogic v1.7] 사용자에 의한 템플릿 삭제 명령 취소");
      return;
    }

    setIsLoading(true);
    try {
      console.log("[useNoticeFormLogic v1.7] axios 라이브러리 기반 템플릿 삭제 API 호출 실행 경로 ->", `/api/notices/templates/${templateId}`);
      await axios.delete(`/api/notices/templates/${templateId}`);
      toast.success('해당 고정 템플릿 양식이 완전히 삭제되었습니다.');

      console.log("[useNoticeFormLogic v1.7] 삭제 완료 후 프론트엔드 상태값 최신 동기화 리패칭");
      const updatedTemplates = await getNoticeTemplates();
      setTemplates(updatedTemplates || []);
    } catch (error) {
      console.error("[useNoticeFormLogic v1.7] 템플릿 데이터 삭제 API 연동 에러:", error);
      toast.error('템플릿을 삭제하는 도중 백엔드 통신 실패 에러가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    console.log("[useNoticeFormLogic v1.7] handleCancel 뒤로가기 흐름 트리거");
    navigate(-1);
  };

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
    handleApplyPreviousNotice,
    handleSaveAsTemplate,
    handleDeleteTemplate // 🚨 리턴 항목에 템플릿 삭제 동작 제어 함수 추가
  };
}