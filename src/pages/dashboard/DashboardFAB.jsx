// src/pages/dashboard/DashboardFAB.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Megaphone, AlertTriangle, X } from 'lucide-react';
import './DashboardFAB.css';

export default function DashboardFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div 
      className="fab-container no-print" 
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className={`fab-menu ${isOpen ? 'open' : ''}`}>
        <div className="fab-item" onClick={() => navigate('/dispatch')}>
          <span className="fab-label">파견지시</span>
          <button className="fab-btn bg-red"><AlertTriangle size={14} color="#fff" /></button>
        </div>
        <div className="fab-item" onClick={() => navigate('/notice')}>
          <span className="fab-label">공지사항</span>
          <button className="fab-btn bg-blue"><Megaphone size={14} color="#fff" /></button>
        </div>
      </div>
      <button className="fab-main" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={20} /> : <Plus size={20} />}
      </button>
    </div>
  );
}