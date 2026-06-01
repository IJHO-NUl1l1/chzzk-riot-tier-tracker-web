export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px', fontFamily: 'sans-serif', color: '#e4e4e7', lineHeight: 1.8, background: '#0a0a0f', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>개인정보처리방침</h1>
      <p style={{ color: '#71717a', marginBottom: 40 }}>Privacy Policy · 최종 수정일: 2026-06-01</p>

      {/* ── 한국어 ── */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>1. 수집하는 정보</h2>
        <p>치지직 라이엇 티어 트래커(이하 "서비스")는 서비스 제공을 위해 아래 정보를 수집합니다.</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li><strong>치지직 계정 정보</strong> — OAuth 로그인 시 수집: 채널 ID, 채널명, 액세스 토큰, 리프레시 토큰</li>
          <li><strong>라이엇 소환사 정보</strong> — 소환사 연결 시 수집: PUUID, 게임 이름, 태그라인, 티어, 랭크, LP, 승패 수</li>
          <li><strong>기기 로컬 데이터</strong> — 익스텐션 동작을 위해 브라우저 로컬 스토리지(chrome.storage)에 저장: JWT 인증 토큰, 사용자 설정(티어 표시 여부 등), 검색 임시 데이터</li>
        </ul>
        <p style={{ marginTop: 8, color: '#a1a1aa' }}>서비스를 이용하지 않는 시청자의 데이터는 수집하지 않습니다. 티어 배지를 직접 등록한 사용자의 데이터만 처리됩니다.</p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>2. 정보 처리 목적</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>치지직 채팅창에 LoL / TFT 티어 배지를 표시하기 위함</li>
          <li>사용자가 설정한 공개/비공개 여부에 따라 배지 노출 여부를 제어하기 위함</li>
          <li>소환사 소유권 인증(프로필 아이콘 방식)을 처리하기 위함</li>
          <li>실시간 티어 업데이트를 구독자에게 전달하기 위함</li>
          <li>광고, 마케팅, 데이터 판매 목적으로 사용하지 않습니다.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>3. 데이터 저장 및 보안</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li><strong>서버 저장소</strong> — 티어 데이터, 인증 토큰은 Supabase(PostgreSQL) 데이터베이스에 저장됩니다. 데이터는 Row Level Security(RLS)로 보호됩니다.</li>
          <li><strong>로컬 저장소</strong> — JWT 토큰, 설정값은 사용자 기기의 chrome.storage.local에만 저장됩니다. 외부로 전송되지 않습니다.</li>
          <li><strong>전송 보안</strong> — 서버와의 모든 통신은 HTTPS로 암호화됩니다.</li>
          <li><strong>인증</strong> — API 접근은 JWT(30일 만료)로 보호되며, 본인 데이터에만 접근 가능합니다.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>4. 제3자 제공</h2>
        <p>수집된 정보는 아래 외부 서비스에만 전달되며, 그 외 제3자에게 판매하거나 제공하지 않습니다.</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li><strong>Naver / Chzzk</strong> — OAuth 인증을 위해 치지직 계정 정보를 Naver 플랫폼과 교환합니다.</li>
          <li><strong>Riot Games API</strong> — 소환사 티어 정보 조회 목적으로만 PUUID를 전달합니다.</li>
          <li><strong>Supabase</strong> — 데이터베이스 및 실시간 동기화 인프라로 사용됩니다. Supabase의 개인정보처리방침이 적용됩니다.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>5. 데이터 보관 기간</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>팝업에서 <strong>Logout</strong> 클릭 시 — 치지직 토큰 및 서버 데이터 즉시 삭제</li>
          <li>팝업에서 <strong>Unlink</strong> 클릭 시 — 해당 게임의 티어 데이터 즉시 삭제</li>
          <li>회원 탈퇴 요청 시 — 모든 관련 데이터(users, tier_cache, 인증 토큰) 영구 삭제</li>
          <li>인증 세션(프로필 아이콘 인증) — 발급 후 5분 후 자동 만료 및 삭제</li>
        </ul>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>6. 사용자 권리 및 데이터 삭제</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>익스텐션 팝업 내 <strong>Logout</strong> 버튼으로 즉시 데이터 삭제 가능</li>
          <li>LoL / TFT 각각 <strong>Unlink</strong>로 개별 삭제 가능</li>
          <li>공개/비공개 토글로 언제든지 배지 노출 제어 가능</li>
          <li>추가 삭제 요청: <strong>x8608666@gmail.com</strong></li>
        </ul>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>7. 미성년자 개인정보</h2>
        <p>본 서비스는 만 14세 미만 아동을 대상으로 하지 않습니다. 14세 미만 아동의 개인정보는 의도적으로 수집하지 않습니다.</p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>8. 개인정보처리방침 변경</h2>
        <p>방침이 변경될 경우 웹사이트를 통해 고지하며, 중요한 변경사항은 이메일로 별도 통지합니다. 변경 후 계속 사용하시면 변경된 방침에 동의한 것으로 간주합니다.</p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>9. Chrome 웹 스토어 제한적 사용 준수</h2>
        <p style={{ padding: '12px 16px', background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: 8 }}>
          본 서비스의 사용자 데이터 사용은 Chrome 웹 스토어 사용자 데이터 정책(제한적 사용 요건 포함)을 준수합니다.<br />
          <em>The use of information received is in compliance with the Chrome Web Store User Data Policy, including the Limited Use requirements.</em>
        </p>
      </section>

      <hr style={{ borderColor: '#27272a', margin: '40px 0' }} />

      {/* ── English ── */}
      <section>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Privacy Policy (English)</h2>

        <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>1. Information We Collect</h3>
        <ul style={{ paddingLeft: 20 }}>
          <li><strong>Chzzk account data</strong> — collected via OAuth: channel ID, channel name, access token, refresh token</li>
          <li><strong>Riot summoner data</strong> — collected when linking a summoner: PUUID, game name, tag line, tier, rank, LP, wins/losses</li>
          <li><strong>Local device data</strong> — stored in chrome.storage.local: JWT auth token, user settings (badge visibility, etc.), temporary search data</li>
        </ul>
        <p style={{ marginTop: 8, color: '#a1a1aa' }}>We do not collect data from viewers who have not registered. Only data of users who explicitly register their tier badge is processed.</p>

        <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>2. How We Use Your Data</h3>
        <ul style={{ paddingLeft: 20 }}>
          <li>To display LoL / TFT tier badges in Chzzk chat</li>
          <li>To control badge visibility based on your public/private setting</li>
          <li>To verify summoner ownership via profile icon method</li>
          <li>To deliver real-time tier updates to live viewers</li>
          <li>We do not use your data for advertising, marketing, or data sales.</li>
        </ul>

        <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>3. Data Storage &amp; Security</h3>
        <ul style={{ paddingLeft: 20 }}>
          <li><strong>Server storage</strong> — tier data and auth tokens are stored in Supabase (PostgreSQL), protected by Row Level Security (RLS).</li>
          <li><strong>Local storage</strong> — JWT tokens and settings are stored only in chrome.storage.local on your device and are never transmitted.</li>
          <li><strong>Transport security</strong> — all server communication is encrypted via HTTPS.</li>
          <li><strong>Authentication</strong> — API access is protected by JWT (30-day expiry); you can only access your own data.</li>
        </ul>

        <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>4. Third-Party Sharing</h3>
        <p>Data is shared only with the following services. We do not sell or share your data with any other third parties.</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li><strong>Naver / Chzzk</strong> — account data is exchanged with Naver for OAuth authentication.</li>
          <li><strong>Riot Games API</strong> — PUUID is sent solely to retrieve summoner tier information.</li>
          <li><strong>Supabase</strong> — used as database and real-time sync infrastructure. Supabase's privacy policy applies.</li>
        </ul>

        <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>5. Data Retention</h3>
        <ul style={{ paddingLeft: 20 }}>
          <li><strong>Logout</strong> — Chzzk tokens and all server data are deleted immediately.</li>
          <li><strong>Unlink</strong> — tier data for that specific game is deleted immediately.</li>
          <li><strong>Account deletion</strong> — all data (users, tier_cache, tokens) is permanently deleted upon request.</li>
          <li><strong>Verification sessions</strong> — automatically expire and are deleted after 5 minutes.</li>
        </ul>

        <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>6. Your Rights</h3>
        <ul style={{ paddingLeft: 20 }}>
          <li>Delete all data via <strong>Logout</strong> in the extension popup</li>
          <li>Delete per-game data via <strong>Unlink</strong> (LoL / TFT individually)</li>
          <li>Control badge visibility at any time via the public/private toggle</li>
          <li>For additional deletion requests: <strong>x8608666@gmail.com</strong></li>
        </ul>

        <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>7. Children's Privacy</h3>
        <p>This service is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13.</p>

        <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>8. Changes to This Policy</h3>
        <p>We will notify users of any changes via the website. Significant changes will be communicated by email. Continued use after changes constitutes acceptance of the updated policy.</p>

        <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>9. Chrome Web Store Limited Use Compliance</h3>
        <p style={{ padding: '12px 16px', background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: 8 }}>
          The use of information received from APIs and user data adheres to the Chrome Web Store User Data Policy, including the Limited Use requirements.
        </p>

        <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>10. Contact</h3>
        <p>For data deletion requests, questions, or concerns: <strong>x8608666@gmail.com</strong></p>
      </section>
    </main>
  );
}
