import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAuth } from "../AuthContext"; // useAuth 임포트

// (CSS 임포트는 App.js에서 한 번만 하면 됩니다)

const API_URL = "http://localhost:4000";

export default function TypingPage() {
  // 1. useParams()에서 'id'를 'contentId'라는 이름으로 받습니다.
  const { id: contentId } = useParams();
  const { user } = useAuth(); // 로그인한 사용자 정보

  const [practiceContent, setPracticeContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [isInputCorrect, setIsInputCorrect] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPracticeFinished, setIsPracticeFinished] = useState(false);
  const [results, setResults] = useState(null);

  // (데이터 로딩 useEffect - 동일)
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        // 2. contentId 변수 사용
        const response = await axios.get(
          `${API_URL}/api/practice/${contentId}`
        );
        setPracticeContent(response.data.data);
      } catch (err) {
        console.error("연습 내용 로딩 실패:", err);
        setError("연습 내용을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [contentId]); // 'id' 대신 'contentId'

  // (원본 텍스트 쪼개는 useMemo - 동일)
  const originalChars = useMemo(() => {
    return practiceContent ? practiceContent.content.split("") : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceContent]);

  // (타이머 useEffect - 동일)
  useEffect(() => {
    let interval;
    if (startTime && !isPracticeFinished) {
      interval = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [startTime, isPracticeFinished]);

  // --- 3. 오타 목록과 결과를 DB에 저장하는 함수 ---
  // (중복 제거 및 로직 수정)
  const saveResultsToDB = async (kpm, accuracy, errorCount, errors) => {
    if (!user || !user.user_id) {
      console.error("사용자 정보가 없습니다. DB 저장 실패.");
      return;
    }

    try {
      // 4. 백엔드 API로 모든 데이터를 한 번에 전송
      const response = await axios.post(`${API_URL}/api/typing`, {
        userId: user.user_id,
        contentId: contentId,
        kpm: kpm,
        accuracy: accuracy,
        errorCount: errorCount, // 'error_count' 추가
        errors: errors, // '오타 목록' 추가
      });

      console.log("DB 저장 성공:", response.data);
      // (이 sessionId는 나중에 통계 페이지에서 사용 가능)
      // const sessionId = response.data.sessionId;
    } catch (err) {
      console.error("DB 저장 실패:", err);
    }
  };

  // --- 5. 연습 완료 시 실행되는 메인 함수 (calculateResults에서 이름 변경) ---
  const finishPractice = async (finalInput) => {
    const finalElapsedTimeInMinutes = (Date.now() - startTime) / 1000 / 60;
    const originalText = practiceContent.content;

    let correctChars = 0;
    let errorCount = 0;
    const errors = []; // 오타 목록 (ERRORS 테이블 용)

    // 원본 텍스트 길이만큼만 루프
    for (let i = 0; i < originalText.length; i++) {
      const correctChar = originalText[i];
      const userChar = finalInput[i] || null; // 사용자가 덜 입력한 경우 null

      if (correctChar === userChar) {
        correctChars++;
      } else {
        // 오타 발생!
        errorCount++;
        errors.push({
          correct: correctChar, // '뭘로'
          wrong: userChar, // '잘못 쳤는지'
          index: i, // '어디서'
        });
      }
    }

    // 타속 (맞은 글자 기준)
    const kpm = Math.round(correctChars / finalElapsedTimeInMinutes);
    // 정확도
    const accuracy = parseFloat(
      ((correctChars / originalText.length) * 100).toFixed(1)
    );

    // 1. UI에 결과 표시
    setResults({ kpm, accuracy, errorCount });

    // 2. DB에 모든 결과 전송
    await saveResultsToDB(kpm, accuracy, errorCount, errors);
  };

  // --- 6. 사용자 입력 처리 함수 (async 추가) ---
  const handleTyping = async (e) => {
    if (isPracticeFinished) return;
    const inputText = e.target.value;

    if (inputText.length > 0 && startTime === null) {
      setStartTime(Date.now());
    }
    setUserInput(inputText);

    // 오타 검사 (테두리 색 변경용)
    const originalText = practiceContent.content;
    const isCurrentlyCorrect = originalText.startsWith(inputText);
    setIsInputCorrect(isCurrentlyCorrect);

    // 연습 종료
    if (inputText.length >= originalChars.length) {
      setIsPracticeFinished(true);
      await finishPractice(inputText); // 5번 함수 호출 (await 추가)
    }
  };

  // (로딩 및 에러 UI - 동일)
  if (loading) return <div>연습 내용 로딩 중...</div>;
  if (error) return <div>{error}</div>;
  if (!practiceContent) return <div>내용이 없습니다.</div>;

  // (최종 JSX 렌더링 - '총 오타' 표시 추가)
  return (
    <div>
      <h2>{practiceContent.title}</h2>

      <div className="practice-text-container">
        {originalChars.map((char, index) => {
          let className = "char-pending";
          if (index < userInput.length) {
            className =
              char === userInput[index] ? "char-correct" : "char-incorrect";
          }
          return (
            <span key={index} className={className}>
              {char}
            </span>
          );
        })}
      </div>

      <textarea
        value={userInput}
        onChange={handleTyping}
        disabled={isPracticeFinished}
        placeholder="여기에 입력하세요..."
        autoFocus
        className={isInputCorrect ? "input-correct" : "input-incorrect"}
        style={{
          width: "100%",
          height: "200px",
          fontFamily: "Courier New, Courier, monospace",
          fontSize: "1.2rem",
          lineHeight: "1.8",
          letterSpacing: "1px",
        }}
      />

      <div>
        <h3>현재 상태</h3>
        <p>경과 시간: {elapsedTime.toFixed(1)}초</p>

        {isPracticeFinished && results && (
          <div
            style={{
              border: "2px solid green",
              padding: "10px",
              marginTop: "20px",
            }}
          >
            <h3>🎉 연습 완료!</h3>
            <p>
              <strong>타속: {results.kpm} 타/분</strong>
            </p>
            <p>
              <strong>정확도: {results.accuracy}%</strong>
            </p>
            {/* 7. 총 오타 수 UI에 표시 */}
            <p>
              <strong>총 오타: {results.errorCount} 개</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
