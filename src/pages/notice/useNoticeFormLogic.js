import { useState, useEffect, useRef } from 'react'; // 🚨 useRef 추가
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
// 🚨 DB 상용구 연동용 API(getAutoTexts, createAutoText, deleteAutoText) 추가 완료
import { getNotice, createNotice, updateNotice, getNoticeTemplates, getRecentNoticesForSelect, createNoticeTemplate, getAutoTexts, createAutoText, deleteAutoText } from '@/api/noticeApi';
import axios from 'axios'; 

export default function useNoticeFormLogic() {
  const { id } = useParams(); 
  const navigate = useNavigate(); 
  const { user } = useAuth(); 
  
  const isEditMode = !!id; 
  const [isLoading, setIsLoading] = useState(isEditMode); 

  const [templates, setTemplates] = useState([]); 
  const [recentNotices, setRecentNotices] = useState([]); 

  // 🚨 [신규] 상용구 DB 목록 및 모달 상태 제어
  const [autoTextList, setAutoTextList] = useState([]);
  const [isMacroModalOpen, setIsMacroModalOpen] = useState(false);
  const autoTextDictRef = useRef({}); 

  const [formData, setFormData] = useState({
    title: '',
    department: user?.department || '총괄관리부',
    isPinned: false,
    content: '',
    publishAt: ''
  });

  useEffect(() => {
    console.log("[useNoticeFormLogic v1.8] 공지사항 작성 폼 초기화 실행 - 수정 모드 여부:", isEditMode);
    
    if (isEditMode) {
      console.log("[useNoticeFormLogic v1.8] 수정 타겟 공지사항 데이터 단건 요청 ID:", id);
      getNotice(id)
        .then(data => {
          console.log("[useNoticeFormLogic v1.8] 기존 공지사항 데이터 수신 성공:", data);
          setFormData({
            title: data.title || '',
            department: data.department || '총괄관리부',
            isPinned: data.priority === 'high' || data.isPinned === true,
            content: data.content || '',
            publishAt: data.publishAt || '' 
          });
        })
        .catch((err) => {
          console.error("[useNoticeFormLogic v1.8] 공지사항 상세 데이터 로드 실패 원인:", err);
          toast.error('공지사항 데이터를 불러오는 과정에서 오류가 발생했습니다.');
          navigate('/notice');
        })
        .finally(() => setIsLoading(false));
    }

    console.log("[useNoticeFormLogic v1.8] 백엔드 템플릿 데이터 목록 API 전체 호출 시도");
    getNoticeTemplates()
      .then(data => {
        console.log("[useNoticeFormLogic v1.8] 백엔드 데이터베이스 등록 템플릿 확인 완료:", data);
        setTemplates(data || []);
      })
      .catch(err => {
        console.error("[useNoticeFormLogic v1.8] 템플릿 데이터 API 조회 오류:", err);
      });

    console.log("[useNoticeFormLogic v1.8] 복사 타겟용 공지사항 이력 리스트 전체 호출");
    getRecentNoticesForSelect()
      .then(data => {
        console.log("[useNoticeFormLogic v1.8] 이전 등록 공지사항 데이터 수신 검증:", data);
        setRecentNotices(data || []);
      })
      .catch(err => {
        console.error("[useNoticeFormLogic v1.8] 이전 공지사항 목록 API 불러오기 오류:", err);
      });

    // 🚨 컴포넌트 마운트 시 DB에서 상용구 목록 불러오기
    fetchAutoTexts();
  }, [id, navigate, isEditMode]);

  // DB 목록을 실시간으로 가져와 에디터용 참조 사전 업데이트
  const fetchAutoTexts = async () => {
    try {
      console.log("[useNoticeFormLogic v1.8] 상용구 DB 전체 목록 호출");
      const data = await getAutoTexts();
      setAutoTextList(data || []);
      const dict = {};
      (data || []).forEach(item => { dict[item.shortcut] = item.replacement; });
      autoTextDictRef.current = dict; 
      console.log("[useNoticeFormLogic v1.8] 상용구 사전 갱신 완료:", dict);
    } catch (err) {
      console.error("[useNoticeFormLogic v1.8] 상용구 목록 조회 실패", err);
    }
  };

  const handleAddAutoText = async (shortcut, replacement) => {
    if (!shortcut.trim() || !replacement.trim()) return toast.error("단축어와 변환할 단어를 모두 입력하세요.");
    try {
      console.log("[useNoticeFormLogic v1.8] 상용구 추가 API 호출:", { shortcut, replacement });
      await createAutoText({ shortcut, replacement });
      toast.success("상용구가 추가되었습니다.");
      fetchAutoTexts();
    } catch (err) {
      toast.error("추가에 실패했습니다. (단축어 중복 여부를 확인하세요)");
    }
  };

  const handleDeleteAutoText = async (targetId) => {
    try {
      console.log("[useNoticeFormLogic v1.8] 상용구 삭제 API 호출 ID:", targetId);
      await deleteAutoText(targetId);
      toast.success("상용구가 삭제되었습니다.");
      fetchAutoTexts();
    } catch (err) {
      toast.error("삭제에 실패했습니다.");
    }
  };

  const handleChange = (field, value) => {
    console.log(`[useNoticeFormLogic v1.8] 데이터 필드 실시간 업데이트 -> [${field}]:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyTemplate = (templateId) => {
    console.log("[useNoticeFormLogic v1.8] handleApplyTemplate 매핑 요청 수신 ID:", templateId);
    if (!templateId) return;
    
    const target = templates.find(t => String(t.id) === String(templateId));
    if (target) {
      console.log("[useNoticeFormLogic v1.8] 매핑 대상 타겟 데이터 매칭 확인:", target);
      setFormData(prev => ({
        ...prev,
        title: target.title || prev.title,
        content: target.content || prev.content
      }));
      toast.success('선택하신 고정 템플릿 양식이 에디터 본문에 자동 렌더링되었습니다.');
    }
  };

  const handleApplyPreviousNotice = (noticeId) => {
    console.log("[useNoticeFormLogic v1.8] handleApplyPreviousNotice 단건 이력 가져오기 시작 ID:", noticeId);
    if (!noticeId) return;

    setIsLoading(true);
    getNotice(noticeId)
      .then(data => {
        console.log("[useNoticeFormLogic v1.8] 과거 작성 이력 데이터 세부 수신 완료:", data);
        setFormData(prev => ({
          ...prev,
          title: data.title ? `[복사] ${data.title}` : prev.title,
          content: data.content || prev.content
        }));
        toast.success('선택하신 과거 공지사항 글이 현재 에디터 본문으로 완벽히 복사되었습니다.');
      })
      .catch(err => {
        console.error("[useNoticeFormLogic v1.8] 과거 공지사항 단건 세부 내역 로드 에러:", err);
        toast.error('과거 공지 내역을 역직렬화하는 중 오류가 발생했습니다.');
      })
      .finally(() => setIsLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[useNoticeFormLogic v1.8] handleSubmit 최종 백엔드 전송 절차 돌입 페이로드 데이터:", formData);

    if (!formData.title.trim() || !formData.content.trim()) {
      console.warn("[useNoticeFormLogic v1.8] 유효성 검증 실패 - 제목 혹은 내용 공백 상태");
      toast.error('제목과 본문 내용을 누락 없이 모두 입력해 주셔야 최종 등록이 가능합니다.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        publishAt: formData.publishAt ? formData.publishAt : null
      };

      console.log("[useNoticeFormLogic v1.8] 전송 직전 직렬화 페이로드 구조 점검:", payload);

      if (isEditMode) {
        await updateNotice(id, payload);
      } else {
        await createNotice(payload);
      }
      
      let successMessage = `공지사항이 정상적으로 ${isEditMode ? '수정' : '등록'}되었습니다.`;
      if (payload.publishAt) {
        successMessage = isEditMode ? '예약 공지 변경 처리가 완료되었습니다.' : '공지사항이 예약 상태로 정상 등록되었습니다.';
      }
      
      console.log("[useNoticeFormLogic v1.8] 작업 성공 처리 안내문 출력 메시지:", successMessage);
      toast.success(successMessage, { position: 'bottom-right' });
      navigate('/notice');
      
    } catch (error) {
      console.error("[useNoticeFormLogic v1.8] 공지사항 영속화 과정 중 통신 예외 발생 로그:", error);
      toast.error('공지사항 서버 저장 처리에 실패했습니다.', { position: 'bottom-right' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    console.log("[useNoticeFormLogic v1.8] handleSaveAsTemplate 현재 입력 폼 기준 신규 템플릿 생성 프로세스 개시:", formData);
    
    if (!formData.title.trim() || !formData.content.trim()) {
      console.warn("[useNoticeFormLogic v1.8] 템플릿 생성 실패 - 유효 데이터 미달");
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

      console.log("[useNoticeFormLogic v1.8] 템플릿 테이블 신규 영속화 전송 페이로드 확인:", payload);
      const savedResult = await createNoticeTemplate(payload);
      console.log("[useNoticeFormLogic v1.8] 백엔드 데이터베이스 신규 템플릿 인서트 응답 개체:", savedResult);
      
      toast.success('작성하신 서식이 새로운 고정 템플릿 데이터로 영구 보관되었습니다.');

      console.log("[useNoticeFormLogic v1.8] 템플릿 추가에 따른 상단 셀렉트박스 데이터 목록 재갱신 쿼리 기동");
      const updatedTemplates = await getNoticeTemplates();
      setTemplates(updatedTemplates || []);

    } catch (error) {
      console.error("[useNoticeFormLogic v1.8] 템플릿 테이블 인서트 통신 오류 로깅:", error);
      toast.error('템플릿 서식을 추가하는 중 시스템 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    console.log("[useNoticeFormLogic v1.8] handleDeleteTemplate 특정 템플릿 삭제 명령 수신 ID:", templateId);
    if (!templateId) return;

    if (!window.confirm("선택하신 고정 템플릿 양식을 정말 데이터베이스에서 전면 삭제하시겠습니까?")) {
      console.log("[useNoticeFormLogic v1.8] 사용자에 의한 템플릿 삭제 명령 취소");
      return;
    }

    setIsLoading(true);
    try {
      console.log("[useNoticeFormLogic v1.8] axios 라이브러리 기반 템플릿 삭제 API 호출 실행 경로 ->", `/api/notices/templates/${templateId}`);
      await axios.delete(`/api/notices/templates/${templateId}`);
      toast.success('해당 고정 템플릿 양식이 완전히 삭제되었습니다.');

      console.log("[useNoticeFormLogic v1.8] 삭제 완료 후 프론트엔드 상태값 최신 동기화 리패칭");
      const updatedTemplates = await getNoticeTemplates();
      setTemplates(updatedTemplates || []);
    } catch (error) {
      console.error("[useNoticeFormLogic v1.8] 템플릿 데이터 삭제 API 연동 에러:", error);
      toast.error('템플릿을 삭제하는 도중 백엔드 통신 실패 에러가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    console.log("[useNoticeFormLogic v1.8] handleCancel 뒤로가기 흐름 트리거");
    navigate(-1);
  };

  return {
    isEditMode, formData, isLoading, templates, recentNotices,
    autoTextList, isMacroModalOpen, setIsMacroModalOpen, autoTextDictRef, handleAddAutoText, handleDeleteAutoText, // 🚨 반환 필수 
    handleChange, handleSubmit, handleCancel, handleApplyTemplate, handleApplyPreviousNotice, handleSaveAsTemplate, handleDeleteTemplate 
  };
}