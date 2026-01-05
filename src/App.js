import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
// AuthContext.js가 src 폴더에 있다고 가정합니다.
import { AuthProvider, useAuth } from "./AuthContext.js"; // .jsx 확장자 추가

// --- 1. 모든 페이지 컴포넌트 불러오기 ---
import HomePage from "./pages/HomePage.js"; // .jsx 확장자 추가
import PracticeListPage from "./pages/PracticePage.js"; // .jsx 확장자 추가
import TypingPage from "./pages/TypingPage.js"; // .jsx 확장자 추가
import FeedbackPage from "./pages/FeedbackPage.js"; // .jsx 확장자 추가
import StatsPage from "./pages/KeystatsPage.js"; // .jsx 확장자 추가
import "./App.css"; // (CSS 파일 임포트)

// 2. AppContent 컴포넌트 (useAuth 훅을 사용하기 위해 분리)
function AppContent() {
  const { user, logout } = useAuth();

  return (
    <div className="App">
      {/* --- 3. 네비게이션 메뉴 --- */}
      <nav>
        <Link to="/">홈</Link>

        {/* 로그인 했을 때만 보이는 메뉴들 */}
        {user && <Link to="/practice">연습 시작</Link>}
        {user && <Link to="/stats">내 통계</Link>}
        {user && <Link to="/feedback">피드백</Link>}

        {user ? (
          // 로그인 상태: 닉네임과 로그아웃 버튼 표시
          <button onClick={logout} className="logout-button">
            로그아웃 ({user.nickname})
          </button>
        ) : (
          // 로그아웃 상태: (아무것도 표시 안 하거나, 홈 링크로 안내)
          <span style={{ paddingLeft: "10px" }}>(로그인 하려면 '홈'으로)</span>
        )}
      </nav>

      {/* --- 4. 페이지 뷰 (경로 설정) --- */}
      <main>
        <Routes>
          {/* 홈 (로그인/회원가입 페이지) */}
          {/* 만약 로그인했다면, '홈' 대신 '연습 목록'으로 자동 이동 */}
          <Route
            path="/"
            element={user ? <Navigate to="/practice" /> : <HomePage />}
          />

          {/* 연습 목록 (로그인 필수) */}
          <Route
            path="/practice"
            element={user ? <PracticeListPage /> : <Navigate to="/" />}
          />

          {/* 타자 연습 (로그인 필수) */}
          <Route
            path="/practice/:id"
            element={user ? <TypingPage /> : <Navigate to="/" />}
          />

          {/* 피드백 (로그인 필수) */}
          <Route
            path="/feedback"
            element={user ? <FeedbackPage /> : <Navigate to="/" />}
          />

          {/* 내 통계 (로그인 필수) */}
          <Route
            path="/stats"
            element={user ? <StatsPage /> : <Navigate to="/" />}
          />
        </Routes>
      </main>
    </div>
  );
}

// --- 5. 최상위 App 컴포넌트 ---
// AuthProvider와 Router가 AppContent를 감싸야 합니다.
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
