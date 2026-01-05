import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:4000";

export default function PracticePage() {
  // 1. DB에서 가져온 글 목록을 저장할 state
  const [practiceList, setPracticeList] = useState([]);
  // 2. 로딩 또는 에러 상태를 관리할 state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. useEffect: 컴포넌트가 처음 렌더링될 때 한 번만 실행
  useEffect(() => {
    // API를 호출하는 비동기 함수
    const fetchPracticeList = async () => {
      try {
        setLoading(true);
        setError(null);

        // 2단계에서 만든 백엔드 API 호출
        const response = await axios.get(`${API_URL}/api/practice`);

        // 성공 시, state에 데이터 저장
        setPracticeList(response.data.data);
      } catch (err) {
        // 실패 시, 에러 메시지 저장
        console.error("연습 목록 로딩 실패:", err);
        setError("글 목록을 불러오는 데 실패했습니다.");
      } finally {
        // 성공/실패 여부와 관계없이 로딩 상태 종료
        setLoading(false);
      }
    };

    fetchPracticeList(); // 함수 실행
  }, []); // [] (빈 배열) = 컴포넌트 마운트 시 1회만 실행

  // --- 4. UI 렌더링 ---

  // 로딩 중일 때
  if (loading) {
    return <div>로딩 중...</div>;
  }

  // 에러 발생 시
  if (error) {
    return <div>{error}</div>;
  }

  // 성공 시 (글 목록 표시)
  return (
    <div>
      <h2>타자 연습 페이지</h2>
      <p>연습할 글을 선택하세요.</p>

      <ul style={{ listStyleType: "none", padding: 0 }}>
        {practiceList.map((item) => (
          <li
            key={item.content_id}
            style={{
              border: "1px solid #ccc",
              margin: "10px",
              padding: "15px",
            }}
          >
            <h3>{item.title}</h3>
            <p>
              난이도: {item.difficulty} | 글자 수: {item.char_count}자
            </p>
            {
              <Link to={`/practice/${item.content_id}`}>
                <button>연습 시작</button>
              </Link>
            }
          </li>
        ))}
      </ul>
    </div>
  );
}
