// src/pages/notice/NoticeFormPage.jsx
import React, { useMemo, useRef, useState } from 'react';
import { Save, X, AlertCircle, FilePlus, Trash2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import useNoticeFormLogic from './useNoticeFormLogic';
import AutoTextModal from './components/AutoTextModal';
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import './NoticeFormPage.css';

//  1. 단어 치환 핵심 알고리즘
const attemptAutoCorrect = (quill, range, dictRef) => {
  if (!quill || !range || range.length > 0) return false;

  const cursorIndex = range.index;
  const lengthToFetch = Math.min(cursorIndex, 30);
  const textBefore = quill.getText(cursorIndex - lengthToFetch, lengthToFetch);

  // 정규식: 공백 전까지의 마지막 단어 추출
  const match = textBefore.match(/(\S+)$/);

  if (match) {
    const typedWord = match[1];
    const currentDict = dictRef.current;

    if (currentDict && currentDict[typedWord]) {
      const replacement = currentDict[typedWord];
      const startIdx = cursorIndex - typedWord.length;

      // 기존 단어 삭제 후 새 단어 삽입
      quill.deleteText(startIdx, typedWord.length, 'user');
      quill.insertText(startIdx, replacement, 'user');
      quill.setSelection(startIdx + replacement.length, 0, 'user');
      return true;
    }
  }
  return false;
};

export default function NoticeFormPage() {
  const logic = useNoticeFormLogic();

  // 🚨 안전장치: 로직 객체나 formData가 유실되었을 경우 하얀 화면 대신 로딩 스피너로 방어
  if (!logic || !logic.formData) {
    return <LoadingSpinner className="nf-spinner-wrap" />;
  }

  const {
    isEditMode, formData, isLoading, templates, recentNotices,
    autoTextList, isMacroModalOpen, setIsMacroModalOpen, autoTextDictRef, handleAddAutoText, handleDeleteAutoText,
    handleChange, handleSubmit, handleSaveDraft, handleCancel,
    handleApplyTemplate, handleApplyPreviousNotice, handleSaveAsTemplate, handleDeleteTemplate
  } = logic;

  const quillRef = useRef(null);
  const [isAutoTextOn, setIsAutoTextOn] = useState(true);
  const autoTextEnabledRef = useRef(true);

  const toggleAutoText = () => {
    const newState = !isAutoTextOn;
    setIsAutoTextOn(newState);
    autoTextEnabledRef.current = newState;
    toast.success(`자동 상용구 기능이 ${newState ? '켜졌습니다' : '꺼졌습니다'}.`, { position: 'bottom-right' });
  };

  // 2. ReactQuill 키보드 이벤트 바인딩
  const modules = useMemo(() => {
    return {
      toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['clean']
      ],
      keyboard: {
        bindings: {
          spaceAutoCorrectCode: {
            key: 32, // 스페이스바 감지
            handler: function(range) {
              if (!autoTextEnabledRef.current) return true;
              const replaced = attemptAutoCorrect(this.quill, range, autoTextDictRef);
              return !replaced;
            }
          }
        }
      }
    };
  }, []);

  if (isLoading) return <LoadingSpinner className="nf-spinner-wrap" />;

  return (
    <div className="nf-container">
      <div className="nf-header">
        <h1 className="nf-title">공지사항 {isEditMode ? '수정' : '작성'}</h1>
        <p className="nf-subtitle">시스템 공지 및 주요 안내 사항을 {isEditMode ? '수정' : '등록'}합니다.</p>
      </div>

      <div className="nf-form-wrapper">
        <form onSubmit={handleSubmit} className="nf-form">
          <div className="nf-options-panel">
            <div className="nf-grid">
              <div className="nf-grid-item">
                <label className="nf-label">담당 부서</label>
                <select className="nf-input" value={formData.department} onChange={(e) => handleChange('department', e.target.value)}>
                  <option value="총괄관리부">총괄관리부</option>
                  <option value="인사관리팀">인사관리팀</option>
                  <option value="시스템운영팀">시스템운영팀</option>
                  <option value="안전관리본부">안전관리본부</option>
                </select>
              </div>

              <div className="nf-grid-item">
                <label className="nf-label">예약 발행 (선택)</label>
                <input type="datetime-local" className="nf-input" value={formData.publishAt} onChange={(e) => handleChange('publishAt', e.target.value)} />
              </div>

              <div className="nf-grid-item">
                <label className="nf-label highlight">고정 템플릿 관리</label>
                <div className="nf-input-group">
                  <select id="page-template-selector" className="nf-input highlight-input">
                    <option value="">-- 양식 선택 --</option>
                    {templates && templates.map(template => (
                      <option key={`tpl-${template.id}`} value={template.id}>{template.title}</option>
                    ))}
                  </select>
                  <button type="button" className="nf-btn-apply" onClick={() => {
                      const selectedVal = document.getElementById("page-template-selector").value;
                      if (!selectedVal) return toast.error("적용할 템플릿을 지정하세요.");
                      handleApplyTemplate(selectedVal);
                      document.getElementById("page-template-selector").value = "";
                    }}>적용</button>
                  <button type="button" className="nf-btn-delete" onClick={() => {
                      const selectedVal = document.getElementById("page-template-selector").value;
                      if (!selectedVal) return toast.error("삭제할 템플릿을 지정하세요.");
                      handleDeleteTemplate(selectedVal);
                      document.getElementById("page-template-selector").value = "";
                    }}><Trash2 size={15} /></button>
                </div>
              </div>

              <div className="nf-grid-item">
                <label className="nf-label highlight">과거 공지글 복사하기</label>
                <select className="nf-input highlight-input" onChange={(e) => {
                    handleApplyPreviousNotice(e.target.value);
                    e.target.value = "";
                  }}>
                  <option value="">-- 과거 글 선택 --</option>
                  {recentNotices && recentNotices.map(notice => (
                    <option key={`prev-${notice.id}`} value={notice.id}>{notice.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="nf-pinned-section">
              <span className="nf-pinned-desc">※ 시스템 주요 점검 등 즉각 인지가 필요한 고정 안내의 경우에만 상단 고정을 활성화하십시오.</span>
              <label className="nf-pinned-label">
                <input type="checkbox" className="nf-checkbox" checked={formData.isPinned} onChange={(e) => handleChange('isPinned', e.target.checked)} />
                <span className={`nf-pinned-text ${formData.isPinned ? 'active' : ''}`}><AlertCircle size={16} />[필독] 상단 고정 공지로 등록</span>
              </label>
            </div>
          </div>

          <div className="nf-input-section">
            <label className="nf-main-label">제목 <span className="nf-required">*</span></label>
            <input
              type="text"
              className="nf-title-input"
              placeholder="공지사항 제목을 입력하세요."
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              onKeyDown={(e) => {
                // 🚨 제목에서 Tab 키를 누르면 툴바를 건너뛰고 에디터 본문으로 직행
                if (e.key === 'Tab' && !e.shiftKey) {
                  e.preventDefault();
                  if (quillRef.current) {
                    quillRef.current.getEditor().focus();
                  }
                }
              }}
            />
          </div>

          <div className="nf-editor-section">
            <div className="nf-editor-header">
              <label className="nf-main-label">내용 <span className="nf-required">*</span></label>
            </div>
            <div className="quill-custom-wrapper">
              <ReactQuill ref={quillRef} theme="snow" modules={modules} value={formData.content} onChange={(content) => handleChange('content', content)} placeholder="공지할 상세 내용을 입력하세요." />
            </div>
          </div>

          <div className="nf-footer">
            <button type="button" className="nf-btn-cancel" onClick={handleCancel}><X size={16} /> 취소</button>
            <button type="button" className="nf-btn-draft" onClick={handleSaveDraft} disabled={isLoading}>
              <Save size={16} /> 임시 저장
            </button>
            <button type="submit" className="nf-btn-submit" disabled={isLoading}><Save size={16} /> {isEditMode ? '수정 완료' : '등록하기'}</button>
          </div>
        </form>
      </div>

      <div className="nf-fab-container">
        <div className="nf-fab-group">
          <button
            type="button"
            onClick={toggleAutoText}
            onContextMenu={(e) => {
              e.preventDefault();
              setIsMacroModalOpen(true);
            }}
            className={`nf-fab-btn ${!isAutoTextOn ? 'disabled' : ''}`}
          >
            <Wand2 size={20} />
          </button>
          <div className="nf-fab-tooltip">
            좌클릭: 기능 ON/OFF <br/>우클릭: 상용구 DB 관리
            <div className="nf-fab-tooltip-arrow"></div>
          </div>
        </div>

        <div className="nf-fab-group">
          <button type="button" onClick={handleSaveAsTemplate} className="nf-fab-btn"><FilePlus size={20} /></button>
          <div className="nf-fab-tooltip">현재 본문 서식 저장<div className="nf-fab-tooltip-arrow"></div></div>
        </div>
      </div>

      <AutoTextModal
        isOpen={isMacroModalOpen}
        onClose={() => setIsMacroModalOpen(false)}
        autoTextList={autoTextList}
        onAddAutoText={handleAddAutoText}
        onDeleteAutoText={handleDeleteAutoText}
      />
    </div>
  );
}