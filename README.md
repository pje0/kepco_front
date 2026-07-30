
<div align="center">

# ⚡ 한전(KEPCO) 정전·장애 대응 MIS — Frontend

시민 신고 접수부터 직원용 대시보드, 자료실, 출동확인까지 제공하는 정전·장애 대응 관리 시스템

[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](.)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](.)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwindcss&logoColor=white)](.)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-black?logo=shadcnui&logoColor=white)](.)

백엔드 레포 → [kepco-back](https://github.com/pje0/kepco_back)

</div>

---

## 📋 목차

- [소개](#-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [라우팅 구조](#-라우팅-구조)
- [시작하기](#-시작하기)
- [폴더 구조](#-폴더-구조)
- [팀원](#-팀원)

---

## 📖 소개

- 역할 기반(시민/직원) 화면 분기 및 접근 제어
- 직관적인 신고 접수 UX (카카오 우편번호 API 연동)
- 인증이 필요한 파일 다운로드 UX
- 재사용 가능한 공통 레이아웃 및 컴포넌트 설계

---

## ✨ 주요 기능

| 기능 | 설명 |
|---|---|
| 공통 레이아웃 | 역할별 메뉴 노출 분기, 반응형 사이드바 |
| 신고 접수 | 시민용 정전·장애 신고 화면 |
| 대시보드 | 직원용 신고 현황 및 통계 |
| 자료실 | 파일 업로드/다운로드 (인증 기반) |
| 출동확인 | 본인 배정 출동 건 조회 및 상태 변경 |
| 마이페이지 | 개인정보 조회/수정 |

---

## 🛠 기술 스택

**Library** · React

**Build Tool** · Vite

**Styling** · Tailwind CSS v4

**UI Component** · shadcn/ui

**인증** · JWT (Authorization 헤더)

**HTTP Client** · axios

**Tool** · VSCode, Git, Notion

---

## 🧭 라우팅 구조

```
/                       # 랜딩 페이지
/login                  # 로그인
/report                 # 시민 신고 접수
/mypage                 # 마이페이지
/dashboard              # 직원 대시보드
/archive                # 자료실 목록
/archive/upload         # 자료실 업로드 (직원 전용)
/work                   # 출동확인 (출동요원 전용)
/admin/users            # 인사관리
```

`AppRouter.jsx`에서 역할 기반 `ProtectedRoute`로 접근을 분기합니다.

---

## 🚀 시작하기

### 요구 사항
- Node.js 18+
- 백엔드 서버(kepco-mis-backend) 실행 필요

### 설치 및 실행

```bash
git clone https://github.com/{your-org}/kepco-mis-frontend.git
cd kepco-mis-frontend
npm install
```

`.env`에 API 서버 주소, 카카오 우편번호 키 입력 후:

```bash
npm run dev
```

```
http://localhost:5173
```

---

## 📁 폴더 구조

```
kepco-mis-frontend
├── src
│   ├── components
│   │   ├── layout
│   │   └── ui
│   ├── pages
│   │   ├── LandingPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── MyPage.jsx
│   │   ├── ResourcePage.jsx
│   │   ├── UploadResourcePage.jsx
│   │   └── WorkPage.jsx
│   ├── routes
│   │   └── AppRouter.jsx
│   ├── api
│   └── hooks
├── .env
└── vite.config.js
```

