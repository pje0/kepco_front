import React from 'react';
import { Save, X, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import useNoticeFormLogic from './useNoticeFormLogic';
import './NoticeFormPage.css';

export default function NoticeFormPage() {
  const {
    isEditMode, formData, isLoading,
    handleChange, handleSubmit, handleCancel
  } = useNoticeFormLogic();

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

          {/* 내용 */}
          <div className="nf-input-group">
            <label className="nf-label">내용 <span className="nf-required">*</span></label>
            <textarea 
              className="nf-textarea"
              placeholder="공지할 상세 내용을 입력하세요."
              rows={15}
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
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