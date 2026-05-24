export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px', fontFamily: 'sans-serif', color: '#e4e4e7', lineHeight: 1.8 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>개인정보처리방침</h1>
      <p style={{ color: '#71717a', marginBottom: 40 }}>Privacy Policy · 최종 수정일: 2026-05-24</p>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>1. 수집하는 정보</h2>
        <p>치지직 라이엇 티어 트래커는 서비스 제공을 위해 아래 정보를 수집합니다.</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li>치지직 채널 ID 및 닉네임 (OAuth 로그인 시)</li>
          <li>라이엇 소환사 PUUID, 닉네임, 티어 정보 (소환사 연결 시)</li>
        </ul>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>2. 수집 목적</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>치지직 채팅창에 라이엇 티어 배지를 표시하기 위함</li>
          <li>사용자가 설정한 공개/비공개 여부에 따라 배지 노출 여부를 제어하기 위함</li>
        </ul>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>3. 제3자 제공</h2>
        <p>수집된 정보는 아래 외부 서비스에만 전달됩니다.</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li><strong>Riot Games API</strong> — 소환사 티어 정보 조회</li>
          <li><strong>Supabase</strong> — 티어 데이터 저장 및 실시간 동기화</li>
        </ul>
        <p style={{ marginTop: 8 }}>그 외 제3자에게 판매하거나 제공하지 않습니다.</p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>4. 보관 기간</h2>
        <p>사용자가 익스텐션 팝업에서 <strong>Logout</strong> 또는 <strong>Unlink</strong>를 실행하면 관련 데이터가 즉시 삭제됩니다.</p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>5. 데이터 삭제 요청</h2>
        <p>데이터 삭제를 원하시면 익스텐션 팝업 내 Logout 버튼을 이용하거나 아래 이메일로 문의해 주세요.</p>
        <p style={{ marginTop: 8 }}>📧 x8608666@gmail.com</p>
      </section>

      <hr style={{ borderColor: '#27272a', margin: '40px 0' }} />

      <section>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Privacy Policy (English)</h2>

        <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>1. Information We Collect</h3>
        <ul style={{ paddingLeft: 20 }}>
          <li>Chzzk channel ID and nickname (via OAuth login)</li>
          <li>Riot summoner PUUID, game name, and tier data (when linking a summoner)</li>
        </ul>

        <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>2. Purpose</h3>
        <ul style={{ paddingLeft: 20 }}>
          <li>To display LoL / TFT tier badges in Chzzk chat</li>
          <li>To control badge visibility based on the user's public/private setting</li>
        </ul>

        <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>3. Third-Party Sharing</h3>
        <p>Data is only shared with:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li><strong>Riot Games API</strong> — to fetch summoner tier information</li>
          <li><strong>Supabase</strong> — to store and sync tier data in real time</li>
        </ul>
        <p style={{ marginTop: 8 }}>We do not sell or share your data with any other third parties.</p>

        <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>4. Data Retention</h3>
        <p>Your data is deleted immediately when you click <strong>Logout</strong> or <strong>Unlink</strong> in the extension popup.</p>

        <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>5. Contact</h3>
        <p>For data deletion requests or questions, please contact: x8608666@gmail.com</p>
      </section>
    </main>
  );
}
