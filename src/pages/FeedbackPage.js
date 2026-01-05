import React, { useState } from "react";
import axios from "axios";
// AuthContext가 src 폴더에 있다고 가정하고,
// 현재 파일(src/pages) 기준 상대 경로를 '../'로 수정합니다.
import { useAuth } from "../AuthContext.js"; // <-- .js 확장자를 추가해 봅니다.

const API_URL = "http://localhost:4000";

export default function FeedbackPage() {
  const { user } = useAuth(); // 현재 로그인한 유저 정보
  const [feedbackContent, setFeedbackContent] = useState(""); // state 이름 변경
  const [statusMessage, setStatusMessage] = useState(""); // state 이름 변경

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage("");

    // 1. 로그인 상태 확인
    if (!user || !user.user_id) {
      setStatusMessage("로그인이 필요합니다.");
      return;
    }

    // 2. 내용이 비어있는지 확인
    if (!feedbackContent.trim()) {
      setStatusMessage("내용을 입력해주세요.");
      return;
    }

    try {
      // 3. 백엔드 API로 전송 (DB 컬럼명 'message'에 맞춤)
      const response = await axios.post(`${API_URL}/api/feedback`, {
        userId: user.user_id,
        message: feedbackContent,
      });

      // 4. 성공 처리
      setStatusMessage(response.data.message);
      setFeedbackContent("");
    } catch (err) {
      // 5. 실패 처리
      console.error("피드백 전송 실패:", err);
      setStatusMessage(err.response?.data?.message || "전송에 실패했습니다.");
    }
  };

  return (
    <div>
      <h2>피드백 및 건의사항</h2>
      <p>
        사이트에 대한 의견이나 버그, 추가하고 싶은 연습 글 등을 자유롭게
        남겨주세요.
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={feedbackContent}
          onChange={(e) => setFeedbackContent(e.target.value)}
          placeholder="여기에 내용을 입력하세요..."
          rows={10}
          style={{
            width: "100%",
            padding: "10px",
            fontFamily: "Arial, sans-serif",
            fontSize: "1rem",
          }}
          disabled={!user}
        />

        <button
          type="submit"
          disabled={!user}
          style={{
            padding: "10px 20px",
            fontSize: "1rem",
            backgroundColor: user ? "#007bff" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: user ? "pointer" : "not-allowed",
            marginTop: "10px",
          }}
        >
          전송하기
        </button>
      </form>

      {statusMessage && (
        <p
          style={{
            marginTop: "15px",
            color: statusMessage.includes("성공") ? "green" : "red",
          }}
        >
          {statusMessage}
        </p>
      )}

      {!user && (
        <p style={{ color: "red", marginTop: "10px" }}>
          피드백을 남기시려면 로그인이 필요합니다.
        </p>
      )}
    </div>
  );
}
