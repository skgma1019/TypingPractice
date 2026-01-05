import React, { useState, useEffect } from "react";
import axios from "axios";
// AuthContext 파일이 StatsPage와 같은 'pages' 폴더 안에 있다고 가정하고
// 경로를 './AuthContext'로 수정해 봅니다.
import { useAuth } from "../AuthContext";

const API_URL = "http://localhost:4000";

export default function StatsPage() {
  const { user } = useAuth(); // 현재 로그인한 유저
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. 로그인한 유저의 ID로 통계 API를 호출합니다.
    const fetchStats = async () => {
      if (!user || !user.user_id) {
        setLoading(false);
        setError("통계를 보려면 로그인이 필요합니다.");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/api/stats/${user.user_id}`
        );
        setStats(response.data.data);
      } catch (err) {
        console.error("통계 데이터 로딩 실패:", err);
        setError("통계 데이터를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]); // user 정보가 바뀔 때마다 다시 로드

  // --- 렌더링 ---

  if (loading) {
    return <div>통계 데이터 로딩 중...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (!stats) {
    return <div>데이터가 없습니다.</div>;
  }

  // 통계 데이터 (basicStats, topTypos)
  const { basicStats, topTypos } = stats;

  // 'null' 대신 '아직 연습 기록이 없습니다'를 표시
  const totalPractices = basicStats.totalPractices || 0;

  return (
    <div>
      <h2>{user.nickname}님의 연습 통계</h2>

      {/* 1. 기본 통계 카드 */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: "15px",
          borderRadius: "8px",
        }}
      >
        <h3>요약</h3>
        {totalPractices > 0 ? (
          <>
            <p>
              <strong>총 연습 횟수:</strong> {totalPractices}회
            </p>
            <p>
              <strong>평균 타속:</strong> {Math.round(basicStats.avgKpm || 0)}{" "}
              타/분
            </p>
            <p>
              <strong>평균 정확도:</strong>{" "}
              {parseFloat(basicStats.avgAccuracy || 0).toFixed(1)} %
            </p>
          </>
        ) : (
          <p>아직 연습 기록이 없습니다. 연습을 완료하고 다시 확인해주세요!</p>
        )}
      </div>

      {/* 2. 오타 분석 (기록이 있을 때만 표시) */}
      {totalPractices > 0 && (
        <div
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            borderRadius: "8px",
            marginTop: "20px",
          }}
        >
          <h3>주요 오타 분석 (TOP 5)</h3>
          {topTypos && topTypos.length > 0 ? (
            <ul style={{ paddingLeft: "20px" }}>
              {topTypos.map((typo, index) => (
                <li
                  key={index}
                  style={{ fontSize: "1.1rem", margin: "10px 0" }}
                >
                  <strong>'{typo.correct_key}'</strong>
                  &nbsp;➡️&nbsp;
                  <strong>'{typo.wrong_key || " (입력 안함)"}'</strong>
                  &nbsp; (총 {typo.error_count}회)
                </li>
              ))}
            </ul>
          ) : (
            <p>오타 기록이 없습니다. 완벽하시네요! 👍</p>
          )}
        </div>
      )}
    </div>
  );
}
