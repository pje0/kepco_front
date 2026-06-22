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
    title: '', address: '', roadAddress: '', district: '', content: '',
  });

  const isInitialMount = useRef(true);
  const [zoomLevel, setZoomLevel] = useState(1.0);

  // 🚨 휠 스크롤 방지 및 줌 컨트롤을 위한 센서
  const zoomControlRef = useRef(null);

  // 카카오 주소 API 로드 및 임시 저장 데이터 확인
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    document.head.appendChild(script);

    const savedDraft = localStorage.getItem(`report_draft_${user?.id || 'guest'}`);
    if (savedDraft) {
      if (window.confirm('작성 중이던 신고 내용이 있습니다. 이어서 작성하시겠습니까?')) {
        setFormData(JSON.parse(savedDraft));
        toast.success('임시 저장된 내용을 불러왔습니다.', { position: 'bottom-right' });
      } else {
        localStorage.removeItem(`report_draft_${user?.id || 'guest'}`);
      }
    }
  }, [user?.id]);

  // 폼 데이터 변경 시 자동 임시 저장
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (formData.title || formData.address || formData.content) {
      localStorage.setItem(`report_draft_${user?.id || 'guest'}`, JSON.stringify(formData));
    }
  }, [formData, user?.id]);

  // 🚨 순수 JS 이벤트로 강제 차단 로직 생성 (중략 없음)
  useEffect(() => {
    const el = zoomControlRef.current;
    if (!el) return;

    const handleNativeWheel = (e) => {
      e.preventDefault(); // 브라우저 스크롤 완벽 차단

      if (e.deltaY < 0) {
        setZoomLevel((prev) => Math.min(prev + 0.1, 2.0));
      } else if (e.deltaY > 0) {
        setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
      }
    };

    el.addEventListener('wheel', handleNativeWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', handleNativeWheel);
    };
  }, []);

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

    // 🚨 유저 ID 누락 방지 철통 방어막
    if (!user || user.id === undefined || user.id === null) {
      toast.error('로그인 세션이 만료되었거나 정보가 유실되었습니다. 🚨로그아웃 후 다시 로그인🚨해 주세요.', { position: 'bottom-right' });
      return;
    }

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
        citizenId: Number(user.id),
        citizenName: user.name,
        title: formData.title,
        category: 'AI 분석 대기',
        content: formData.content,
        address: formData.address,
        district: districtMatch,
        severity: 'normal'
      });

      localStorage.removeItem(`report_draft_${user?.id || 'guest'}`);
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

  const handlePrint = () => window.print();

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 2.0));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));

  return {
    formData, isLoading, success, isAgreed, setIsAgreed, zoomLevel,
    handleChange, handleAddressSearch, handleSubmit, resetForm, handlePrint, navigate,
    zoomIn, zoomOut, zoomControlRef
  };
}