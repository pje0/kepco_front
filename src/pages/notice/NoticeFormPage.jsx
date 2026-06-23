import React, { useMemo } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import useNoticeFormLogic from './useNoticeFormLogic';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; // 에디터 기본 CSS
import './NoticeFormPage.css';

export default function NoticeFormPage() {
  const {
    isEditMode, formData, isLoading,
    templates, recentNotices,
    handleChange, handleSubmit, handleCancel,
    handleApplyTemplate, handleApplyPreviousNotice
  } = useNoticeFormLogic();

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean']
    ],
  }), []);

  if (isLoading) return <LoadingSpinner className="nf-loading" />;

  return (
    <div className="nf-wrapper">
      <div className="nf-header">
        <h1 className="nf-title">
          공지사항 {isEditMode ? '수정' : '작성'}
        </h1>
        <p className="nf-subtitle">
          시스템 공지 및 주요 안내 사항을 {isEditMode ? '수정' : '등록'}합니다.
        </p>
      </div>

      <div className="nf-card">
        <form onSubmit={handleSubmit} className="nf-form">
          
          {/* 상단 옵션: 부서 및 상단 고정 */}
          <div className="nf-row-group">
            <div className="nf-input-group">
              <label className="nf-label">담당 부서</label>
              <select 
                className="nf-input nf-select"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
              >
                <option value="총괄관리부">총괄관리부</option>
                <option value="인사관리팀">인사관리팀</option>
                <option value="시스템운영팀">시스템운영팀</option>
                <option value="안전관리본부">안전관리본부</option>
              </select>
            </div>
            
            <div className="nf-checkbox-group">
              <input 
                type="checkbox" 
                id="isPinned" 
                className="nf-checkbox"
                checked={formData.isPinned}
                onChange={(e) => handleChange('isPinned', e.target.checked)}
              />
              <label htmlFor="isPinned" className="nf-check-label">
                <AlertCircle size={16} className="nf-check-icon" />
                [필독] 상단 고정 공지로 등록
              </label>
            </div>
          </div>

          <div className="nf-input-group">
            <label className="nf-label">예약 발행 설정</label>
            <input 
              type="datetime-local" 
              className="nf-input"
              style={{ width: '250px' }}
              value={formData.publishAt}
              onChange={(e) => handleChange('publishAt', e.target.value)}
            />
          </div>

          {/* 고정 템플릿 및 과거 글 불러오기 드롭다운 영역 */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-slate-50 border border-slate-200 rounded-md">
            <div className="flex-1">
              <label htmlFor="template-select" className="block text-sm font-semibold text-slate-700 mb-2">
                고정 템플릿 불러오기
              </label>
              <select 
                id="template-select"
                className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  // [콘솔 로그] 고정 템플릿 선택 이벤트 감지 및 처리
                  console.log("[NoticeFormPage] 고정 템플릿 선택 이벤트 발생 - 선택된 value:", e.target.value);
                  handleApplyTemplate(e.target.value);
                  // 🚨 연속 선택이 가능하도록 처리 직후 초기값으로 되돌림
                  e.target.value = ""; 
                }}
              >
                <option value="">-- 고정 양식 선택 --</option>
                {templates && templates.map(template => (
                  <option key={`tpl-${template.id}`} value={template.id}>
                    {template.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label htmlFor="recent-notice-select" className="block text-sm font-semibold text-slate-700 mb-2">
                과거 공지글 복사하기
              </label>
              <select 
                id="recent-notice-select"
                className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  // [콘솔 로그] 과거 글 복사 선택 이벤트 감지 및 처리
                  console.log("[NoticeFormPage] 과거 공지글 복사 선택 이벤트 발생 - 선택된 value:", e.target.value);
                  handleApplyPreviousNotice(e.target.value);
                  // 🚨 연속 선택이 가능하도록 처리 직후 초기값으로 되돌림
                  e.target.value = ""; 
                }}
              >
                <option value="">-- 과거 글 선택 --</option>
                {recentNotices && recentNotices.map(notice => (
                  <option key={`prev-${notice.id}`} value={notice.id}>
                    {notice.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 제목 */}
          <div className="nf-input-group">
            <label className="nf-label">제목 <span className="nf-required">*</span></label>
            <input 
              type="text" 
              className="nf-input nf-title-input"
              placeholder="공지사항 제목을 입력하세요."
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>

          {/* 내용 (🚨 ReactQuill 에디터로 교체됨) */}
          <div className="nf-input-group">
            <label className="nf-label">내용 <span className="nf-required">*</span></label>
            <ReactQuill
              theme="snow"
              modules={modules}
              value={formData.content}
              onChange={(content) => handleChange('content', content)}
              className="nf-quill-editor"
              placeholder="공지할 상세 내용을 입력하세요."
            />
          </div>

          {/* 하단 버튼 */}
          <div className="nf-footer">
            <button type="button" className="nf-btn nf-btn-cancel" onClick={handleCancel}>
              <X size={16} /> 취소
            </button>
            <button type="submit" className="nf-btn nf-btn-submit" disabled={isLoading}>
              <Save size={16} /> {isEditMode ? '수정 완료' : '등록하기'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}