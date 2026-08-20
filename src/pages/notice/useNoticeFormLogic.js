// src/pages/notice/useNoticeFormLogic.js
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
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

  const [autoTextList, setAutoTextList] = useState([]);
  const [isMacroModalOpen, setIsMacroModalOpen] = useState(false);
  const autoTextDictRef = useRef({});

  // 🚨 [수정] 폼 초기 상태값을 대문자 'PUBLISHED'로 설정
  const [formData, setFormData] = useState({
    title: '',
    department: user?.department || '총괄관리부',
    isPinned: false,
    content: '',
    publishAt: '',
    status: 'PUBLISHED' 
  });

  useEffect(() => {
    if (isEditMode) {
      getNotice(id)
        .then(data => {
          setFormData({
            title: data.title || '',
            department: data.department || '총괄관리부',
            isPinned: data.priority === 'high' || data.isPinned === true,
            content: data.content || '',
            publishAt: data.publishAt || '',
            status: data.status ? data.status.toUpperCase() : 'PUBLISHED'
          });
        })
        .catch((err) => {
          toast.error('공지사항 데이터를 불러오는 과정에서 오류가 발생했습니다.');
          navigate('/notice');
        })
        .finally(() => setIsLoading(false));
    }

    getNoticeTemplates().then(data => setTemplates(data || [])).catch(console.error);
    getRecentNoticesForSelect().then(data => setRecentNotices(data || [])).catch(console.error);
    fetchAutoTexts();
  }, [id, navigate, isEditMode]);

  const fetchAutoTexts = async () => {
    try {
      const data = await getAutoTexts();
      setAutoTextList(data || []);
      const dict = {};
      (data || []).forEach(item => { dict[item.shortcut] = item.replacement; });
      autoTextDictRef.current = dict;
    } catch (err) {}
  };

  const handleAddAutoText = async (shortcut, replacement) => {
    if (!shortcut.trim() || !replacement.trim()) return toast.error("단축어와 변환할 단어를 모두 입력하세요.");
    try {
      await createAutoText({ shortcut, replacement });
      toast.success("상용구가 추가되었습니다.");
      fetchAutoTexts();
    } catch (err) {
      toast.error("추가에 실패했습니다.");
    }
  };

  const handleDeleteAutoText = async (targetId) => {
    try {
      await deleteAutoText(targetId);
      toast.success("상용구가 삭제되었습니다.");
      fetchAutoTexts();
    } catch (err) {
      toast.error("삭제에 실패했습니다.");
    }
  };

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  // 1. 템플릿 불러와서 덮어쓰기
  const handleApplyTemplate = (templateId) => {
    if (!templateId) return;
    const target = templates.find(t => String(t.id) === String(templateId));
    if (target) {
      // 기존 데이터(prev)를 유지하되, 템플릿에 있는 제목과 내용만 덮어씌움
      setFormData(prev => ({ ...prev, title: target.title || prev.title, content: target.content || prev.content }));
      toast.success('선택하신 고정 템플릿 양식이 에디터 본문에 자동 렌더링되었습니다.');
    }
  };

  const handleApplyPreviousNotice = (noticeId) => {
    if (!noticeId) return;
    setIsLoading(true);
    getNotice(noticeId)
      .then(data => {
        setFormData(prev => ({ ...prev, title: data.title ? `[복사] ${data.title}` : prev.title, content: data.content || prev.content }));
        toast.success('과거 공지사항 글이 복사되었습니다.');
      })
      .finally(() => setIsLoading(false));
  };

  const handleSaveDraft = async () => {
    if (!formData.title.trim() && !formData.content.trim()) {
      return toast.error('임시 저장을 위해 제목이나 내용을 입력해 주세요.');
    }
    setIsLoading(true);
    try {
      // 🚨 [수정] 임시 저장 시 대문자 'DRAFT' 전송
      const payload = { ...formData, status: 'DRAFT', publishAt: formData.publishAt ? formData.publishAt : null };
      if (isEditMode) await updateNotice(id, payload);
      else await createNotice(payload);

      localStorage.removeItem('notice_draft_new');
      toast.success('공지사항이 임시 저장 보관함으로 이동되었습니다.', { position: 'bottom-right' });
      navigate('/notice');
    } catch (error) {
      toast.error('임시 저장 통신에 실패했습니다.', { position: 'bottom-right' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      return toast.error('제목과 본문 내용을 누락 없이 모두 입력해 주셔야 최종 등록이 가능합니다.');
    }
    setIsLoading(true);
    try {
      // 🚨 [수정] 최종 등록 시 대문자 'PUBLISHED' 전송
      const payload = { ...formData, status: 'PUBLISHED', publishAt: formData.publishAt ? formData.publishAt : null };
      if (isEditMode) await updateNotice(id, payload);
      else await createNotice(payload);

      localStorage.removeItem('notice_draft_new');
      toast.success(`공지사항이 정상적으로 ${isEditMode ? '수정' : '등록'}되었습니다.`, { position: 'bottom-right' });
      navigate('/notice');
    } catch (error) {
      toast.error('공지사항 서버 저장 처리에 실패했습니다.', { position: 'bottom-right' });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 현재 작성 중인 글을 템플릿으로 영구 보관
  const handleSaveAsTemplate = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return toast.error('등록을 위해 빈 칸을 모두 채워주십시오.');
    setIsLoading(true);
    try {
      await createNoticeTemplate({ title: formData.title, content: formData.content, department: formData.department });
      toast.success('작성하신 서식이 새로운 고정 템플릿 데이터로 영구 보관되었습니다.');
      // 템플릿 목록 새로고침
      const updatedTemplates = await getNoticeTemplates();
      setTemplates(updatedTemplates || []);
    } catch (error) { toast.error('템플릿 추가 중 시스템 오류가 발생했습니다.'); }
    finally { setIsLoading(false); }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!templateId) return;
    if (!window.confirm("선택하신 고정 템플릿 양식을 정말 전면 삭제하시겠습니까?")) return;
    setIsLoading(true);
    try {
      await axios.delete(`/api/notices/templates/${templateId}`);
      toast.success('해당 고정 템플릿 양식이 완전히 삭제되었습니다.');
      const updatedTemplates = await getNoticeTemplates();
      setTemplates(updatedTemplates || []);
    } catch (error) { toast.error('템플릿 삭제 백엔드 통신 실패'); }
    finally { setIsLoading(false); }
  };

  const handleCancel = () => navigate(-1);

  return {
    isEditMode, formData, isLoading, templates, recentNotices,
    autoTextList, isMacroModalOpen, setIsMacroModalOpen, autoTextDictRef, handleAddAutoText, handleDeleteAutoText,
    handleChange, handleSubmit, handleSaveDraft, handleCancel,
    handleApplyTemplate, handleApplyPreviousNotice, handleSaveAsTemplate, handleDeleteTemplate
  };
}