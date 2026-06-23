import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import './AutoTextModal.css';

export default function AutoTextModal({ 
  isOpen, 
  onClose, 
  autoTextList, 
  onAddAutoText, 
  onDeleteAutoText 
}) {
  const [newShortcut, setNewShortcut] = useState('');
  const [newReplacement, setNewReplacement] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    onAddAutoText(newShortcut, newReplacement);
    setNewShortcut(''); 
    setNewReplacement('');
  };

  return (
    <div className="nf-modal-overlay" onClick={onClose}>
      <div className="nf-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="nf-modal-header">
          <h2>자동 상용구 DB 관리</h2>
          <button type="button" onClick={onClose}><X size={18} /></button>
        </div>
        
        <div className="nf-modal-add-form">
          <input 
            type="text" 
            placeholder="단축어 (예: 있따)" 
            value={newShortcut} 
            onChange={(e) => setNewShortcut(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <input 
            type="text" 
            placeholder="변환될 단어 (예: 있다)" 
            value={newReplacement} 
            onChange={(e) => setNewReplacement(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button type="button" onClick={handleAdd}>추가</button>
        </div>

        <div className="nf-modal-list">
          {autoTextList.length === 0 ? (
            <div className="nf-modal-empty">등록된 상용구가 없습니다.</div>
          ) : (
            autoTextList.map(item => (
              <div key={item.id} className="nf-modal-list-item">
                <div className="nf-macro-text">
                  <span className="macro-short">{item.shortcut}</span>
                  <span className="macro-arrow">➔</span>
                  <span className="macro-replace">{item.replacement}</span>
                </div>
                <button type="button" onClick={() => onDeleteAutoText(item.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}