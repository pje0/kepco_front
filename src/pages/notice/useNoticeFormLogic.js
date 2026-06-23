import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
// 🚨 알림: api/noticeApi.js에 createNotice, updateNotice 함수가 필요합니다.
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
    content: ''
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
            content: data.content || ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // 🚨 가짜 타이머 지우고 진짜 DB 연동!
      if (isEditMode) {
        await updateNotice(id, formData);
      } else {
        await createNotice(formData);
      }
      
      toast.success(`공지사항이 ${isEditMode ? '수정' : '등록'}되었습니다.`, { position: 'bottom-right' });
      navigate('/notice');
    } catch (error) {
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