import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext"; // AuthContext 경로 '../'로 수정

const API_URL = "http://localhost:4000";

// 기존 App.js에 있던 로그인/회원가입 UI 및 로직을 그대로 가져옵니다.
export default function HomePage() {
  const { login } = useAuth(); // 로그인 성공 시 전역 상태 변경을 위해 필요

  const [registerNickname, setRegisterNickname] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginNickname, setLoginNickname] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await axios.post(`${API_URL}/auth/users`, {
        user_nickname: registerNickname,
        user_password: registerPassword,
      });
      setMessage(response.data.message);
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message);
      } else {
        setMessage("회원가입 중 오류 발생");
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        user_nickname: loginNickname,
        user_password: loginPassword,
      });
      // ★ 로그인 성공 시 전역 상태에 저장 ★
      login(response.data.user);
      setMessage(response.data.message);
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message);
      } else {
        setMessage("로그인 중 오류 발생");
      }
    }
  };

  return (
    <div>
      <div>
        <h3>회원가입</h3>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="닉네임 입력"
            value={registerNickname}
            onChange={(e) => setRegisterNickname(e.target.value)}
          />
          <input
            type="password"
            placeholder="비밀번호 입력"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
          />
          <button type="submit">회원가입</button>
        </form>
      </div>
      <hr />
      <div>
        <h3>로그인</h3>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="닉네임 입력"
            value={loginNickname}
            onChange={(e) => setLoginNickname(e.target.value)}
          />
          <input
            type="password"
            placeholder="비밀번호 입력"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <button type="submit">로그인</button>
        </form>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
}
