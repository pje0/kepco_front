import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  // <StrictMode> 공지사항 조회수 +2 방지
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>,
  // </StrictMode>,
)