import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { createReport } from '@/api/reportApi';

export default function useReportNewLogic() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    roadAddress: '',
    district: '',
    content: '',
  });

  // 🚨 [신규] 임시 저장 및 최초 렌더링 판별용
  const isInitialMount = useRef(true);

  // 카카오 주소 API 로드 및 임시 저장 데이터 확인
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    document.head.appendChild(script);

    // 🚨 [신규] 로드 시 작성 중이던 임시 저장 데이터가 있는지 확인
    const savedDraft = localStorage.getItem('report_draft');
    if (savedDraft) {
      if (window.confirm('작성 중이던 신고 내용이 있습니다. 이어서 작성하시겠습니까?')) {
        setFormData(JSON.parse(savedDraft));
        toast.success('임시 저장된 내용을 불러왔습니다.', { position: 'bottom-right' });
      } else {
        localStorage.removeItem('report_draft');
      }
    }
  }, []);

  // 🚨 [신규] 폼 데이터가 변경될 때마다 localStorage에 자동 임시 저장
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // 내용이 하나라도 입력된 경우에만 저장
    if (formData.title || formData.address || formData.content) {
      localStorage.setItem('report_draft', JSON.stringify(formData));
    }
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressSearch = () => {
    if (!window.daum) {
      toast.error('주소 검색 서비스를 불러올 수 없습니다.');
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data) => {
        const roadAddr = data.roadAddress;
        const jibunAddr = data.jibunAddress;
        const district = data.sigungu;
        setFormData((prev) => ({
          ...prev,
          address: roadAddr || jibunAddr,
          roadAddress: roadAddr,
          district: district,
        }));
        toast.success('주소가 입력되었습니다.', { position: 'bottom-right' });
      },
    }).open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAgreed) {
      toast.error('개인정보 수집 및 이용에 동의해 주세요.', { position: 'bottom-right' });
      return;
    }

    if (!formData.title.trim() || !formData.address.trim() || !formData.content.trim()) {
      toast.error('필수 항목(제목, 주소, 상세내용)을 입력해 주세요.', { position: 'bottom-right' });
      return;
    }
    
    setIsLoading(true);
    try {
      const districtMatch = formData.district || (formData.address.split(' ').length > 1 ? formData.address.split(' ')[1] : '기타구');

      await createReport({
        citizenId: user?.id,
        citizenName: user?.name,
        title: formData.title,
        category: 'AI 분석 대기',
        content: formData.content, 
        address: formData.address,
        district: districtMatch,
        severity: 'normal'
      });
      
      // 🚨 [신규] 성공적으로 제출되면 임시 저장 데이터 깔끔하게 삭제
      localStorage.removeItem('report_draft');
      setSuccess(true);
    } catch (error) {
      toast.error('신청에 실패했습니다.', { position: 'bottom-right' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setIsAgreed(false);
    setFormData({ title: '', address: '', roadAddress: '', district: '', content: '' });
  };

  // 🚨 [신규] 인쇄 기능
  const handlePrint = () => window.print();

  return {
    formData, isLoading, success, isAgreed, setIsAgreed,
    handleChange, handleAddressSearch, handleSubmit, resetForm, handlePrint, navigate
  };
}