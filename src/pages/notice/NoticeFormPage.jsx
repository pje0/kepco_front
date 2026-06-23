// src/pages/notice/NoticeFormPage.jsx (v1.5)
import React, { useMemo } from 'react';
import { Save, X, AlertCircle, FilePlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner'; // 🚨 추가: toast 참조 에러 해결
import LoadingSpinner from '@/components/common/LoadingSpinner';
import useNoticeFormLogic from './useNoticeFormLogic';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './NoticeFormPage.css';

export default function NoticeFormPage() {
  const {
    isEditMode, formData, isLoading,
    templates, recentNotices,
    handleChange, handleSubmit, handleCancel,
    handleApplyTemplate, handleApplyPreviousNotice,
    handleSaveAsTemplate, handleDeleteTemplate
  } = useNoticeFormLogic();

  // 리치 텍스트 에디터 플러그인 툴바 컴포넌트 세팅
  const modules = useMemo(() => {
    console.log("[NoticeFormPage v1.5] 텍스트 렌더링용 에디터 모듈 정보 로드");
    return {
      toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['clean']
      ],
    };
  }, []);

  if (isLoading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 relative">
      {/* 1. 상단 타이틀 영역 */}
      <div className="mb-6 pb-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          공지사항 {isEditMode ? '수정' : '작성'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          시스템 공지 및 주요 안내 사항을 {isEditMode ? '수정' : '등록'}합니다.
        </p>
      </div>

      {/* 2. 전체 입력 컨테이너 */}
      <div className="bg-transparent">
        <form onSubmit={handleSubmit} className="py-2">
          
          {/* 3. 옵션 제어 가로 압축형 상단 그리드 패널 */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-md p-5 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* 부서 선택 셀렉트박스 */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">담당 부서</label>
                <select 
                  className="w-full text-sm px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  value={formData.department}
                  onChange={(e) => {
                    console.log("[NoticeFormPage v1.5] 부서 변경 수신:", e.target.value);
                    handleChange('department', e.target.value);
                  }}
                >
                  <option value="총괄관리부">총괄관리부</option>
                  <option value="인사관리팀">인사관리팀</option>
                  <option value="시스템운영팀">시스템운영팀</option>
                  <option value="안전관리본부">안전관리본부</option>
                </select>
              </div>

              {/* 예약 발행 타임 스탬프 인풋 */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">예약 발행 (선택)</label>
                <input 
                  type="datetime-local" 
                  className="w-full text-sm px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  value={formData.publishAt}
                  onChange={(e) => {
                    console.log("[NoticeFormPage v1.5] 예약 발행 설정 변경 수신:", e.target.value);
                    handleChange('publishAt', e.target.value);
                  }}
                />
              </div>

              {/* 🚨 수정: 고정 템플릿 적용 및 삭제 기능 분리 (자동 초기화 방지) */}
              <div>
                <label className="block text-xs font-bold text-blue-700 dark:text-blue-400 mb-1.5">고정 템플릿 관리</label>
                <div className="flex gap-1.5">
                  <select 
                    id="page-template-selector"
                    className="flex-1 text-sm px-2 py-2 border border-blue-200 dark:border-blue-500/50 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="">-- 양식 선택 --</option>
                    {templates && templates.map(template => (
                      <option key={`tpl-${template.id}`} value={template.id}>{template.title}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    title="선택된 템플릿을 에디터에 적용합니다"
                    className="px-2.5 py-2 text-xs font-bold border border-blue-600 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    onClick={() => {
                      const selectedVal = document.getElementById("page-template-selector").value;
                      console.log("[NoticeFormPage v1.5] 템플릿 적용 버튼 클릭 ID:", selectedVal);
                      if (!selectedVal) {
                        toast.error("적용할 템플릿 서식을 지정해 주십시오.");
                        return;
                      }
                      handleApplyTemplate(selectedVal);
                      document.getElementById("page-template-selector").value = ""; 
                    }}
                  >
                    적용
                  </button>
                  <button
                    type="button"
                    title="선택된 템플릿 데이터베이스에서 영구 삭제"
                    className="px-2.5 py-2 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded hover:bg-red-100 transition-colors"
                    onClick={() => {
                      const selectedVal = document.getElementById("page-template-selector").value;
                      console.log("[NoticeFormPage v1.5] 템플릿 삭제 버튼 클릭 ID:", selectedVal);
                      if (!selectedVal) {
                        toast.error("삭제할 템플릿 서식을 지정해 주십시오.");
                        return;
                      }
                      handleDeleteTemplate(selectedVal);
                      document.getElementById("page-template-selector").value = ""; 
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* 과거 공지글 데이터 이력 호출 셀렉트박스 */}
              <div>
                <label className="block text-xs font-bold text-blue-700 dark:text-blue-400 mb-1.5">과거 공지글 복사하기</label>
                <select 
                  className="w-full text-sm px-3 py-2 border border-blue-200 dark:border-blue-500/50 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
                  onChange={(e) => {
                    console.log("[NoticeFormPage v1.5] 이전 작성 글 이력 복사 매핑 ID:", e.target.value);
                    handleApplyPreviousNotice(e.target.value);
                    e.target.value = ""; 
                  }}
                >
                  <option value="">-- 과거 글 선택 --</option>
                  {recentNotices && recentNotices.map(notice => (
                    <option key={`prev-${notice.id}`} value={notice.id}>{notice.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 필독 상단 고정 체크 여부 토글 라인 */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                ※ 시스템 주요 점검 등 즉각 인지가 필요한 고정 안내의 경우에만 상단 고정을 활성화하십시오.
              </span>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 cursor-pointer accent-red-600 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                  checked={formData.isPinned}
                  onChange={(e) => {
                    console.log("[NoticeFormPage v1.5] 고정 플래그 체크 상태 반전:", e.target.checked);
                    handleChange('isPinned', e.target.checked);
                  }}
                />
                <span className={`text-sm font-bold flex items-center gap-1 transition-colors ${formData.isPinned ? 'text-red-600 dark:text-red-500' : 'text-slate-600 dark:text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-400'}`}>
                  <AlertCircle size={16} />
                  [필독] 상단 고정 공지로 등록
                </span>
              </label>
            </div>
          </div>

          {/* 4. 제목 입력 블록 */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              className="w-full px-4 py-2.5 text-base border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="공지사항 제목을 입력하세요."
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>

          {/* 5. 리치 텍스트 본문 에디터 컴포넌트 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
              내용 <span className="text-red-500">*</span>
            </label>
            <div className="quill-custom-wrapper">
              <ReactQuill
                theme="snow"
                modules={modules}
                value={formData.content}
                onChange={(content) => handleChange('content', content)}
                placeholder="공지할 상세 내용을 입력하세요."
              />
            </div>
          </div>

          {/* 6. 하단 액션 버튼 배치 영역 (취소 및 제출용으로 가로 폭 컴팩트하게 정렬) */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-200 dark:border-slate-700">
            <button 
              type="button" 
              className="px-5 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5"
              onClick={handleCancel}
            >
              <X size={16} /> 취소
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 text-sm font-bold text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <Save size={16} /> {isEditMode ? '수정 완료' : '등록하기'}
            </button>
          </div>

        </form>
      </div>

      {/* 🚨 7. 우측 하단 고정식 플로팅 액션 버튼 (FAB) 배치 - 소형 원형, 마우스 오버 툴팁 적용 */}
      <div className="fixed bottom-8 right-8 z-50 group">
        <button
          type="button"
          onClick={() => {
            console.log("[NoticeFormPage v1.5] FAB 플로팅 템플릿 저장 기능 수행 호출");
            handleSaveAsTemplate();
          }}
          className="flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 focus:outline-none"
        >
          <FilePlus size={24} />
        </button>
        {/* 마우스 오버 시 나타나는 툴팁 영역 */}
        <div className="absolute bottom-full right-0 mb-3 hidden group-hover:block w-max px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded shadow-md pointer-events-none">
          현재 본문 서식 저장
          {/* 툴팁 말풍선 하단 꼬리 */}
          <div className="absolute -bottom-1 right-5 w-2 h-2 bg-slate-800 transform rotate-45"></div>
        </div>
      </div>

    </div>
  );
}