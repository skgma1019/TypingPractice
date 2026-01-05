import React, { createContext, useState, useContext } from "react";

// 1. Context 보관함 생성
const AuthContext = createContext(null);

// 2. 보관함 공급자(Provider) 컴포넌트 생성
export function AuthProvider({ children }) {
  // ★★★ 수정 1: 'Lazy initial state' ★★★
  // 앱이 처음 로드될 때 'user' state를 초기화합니다.
  // localStorage에서 'user' 값을 가져와서,
  // 있으면 JSON으로 파싱해서 쓰고, 없으면 null을 씁니다.
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("LocalStorage에서 user를 파싱하는데 실패했습니다.", error);
      return null;
    }
  });

  // ★★★ 수정 2: 로그인 함수 ★★★
  // 전역으로 배포할 로그인 함수
  const login = (userData) => {
    try {
      // 1. LocalStorage에 user 정보를 '문자열'로 저장
      localStorage.setItem("user", JSON.stringify(userData));
      // 2. React state(메모리)에 user 정보 저장
      setUser(userData);
    } catch (error) {
      console.error("LocalStorage에 user를 저장하는데 실패했습니다.", error);
    }
  };

  // ★★★ 수정 3: 로그아웃 함수 ★★★
  // 전역으로 배포할 로그아웃 함수
  const logout = () => {
    // 1. LocalStorage에서 user 정보 삭제
    localStorage.removeItem("user");
    // 2. React state(메모리)에서 user 정보 삭제
    setUser(null);
  };

  // 이 보관함이 제공할 '값'들 (여기는 동일)
  const value = {
    user,
    isLoggedIn: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3. 이 보관함을 쉽게 사용할 수 있도록 'custom hook' 생성 (여기는 동일)
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
