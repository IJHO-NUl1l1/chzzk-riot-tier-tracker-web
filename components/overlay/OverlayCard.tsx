import type { ReactNode } from "react";
import { OVERLAY_CARD_STYLE } from "./tierConstants";

interface OverlayCardProps {
  /** 헤더 좌측에 붙는 이모지 아이콘. */
  icon: string;
  /** 헤더 좌측 타이틀. 예: "시청자 랭킹 (LoL)" */
  title: string;
  /** 헤더 우측 배지 텍스트. 예: "총 17명" */
  badge: string;
  /** 값이 있으면 children 대신 이 안내 문구를 렌더링한다(데이터 없음 상태). */
  emptyMessage?: string;
  children: ReactNode;
}

/**
 * BadgeList(시청자 랭킹)와 TierStats(티어 분포)가 공유하는 카드 셸.
 * 두 위젯이 같은 크기/같은 헤더 레이아웃으로 보이도록(데이터가 0개인
 * 상태까지 포함해서) 여기 한 곳에서만 관리한다. 행 내부 구성(랭킹 vs
 * 분포)은 각자 다르므로 children으로 넘긴다.
 */
export default function OverlayCard({ icon, title, badge, emptyMessage, children }: OverlayCardProps) {
  return (
    <div style={OVERLAY_CARD_STYLE}>
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <span className="text-xs font-bold" style={{ color: "#e4e4e7", letterSpacing: 0.2 }}>
          {icon} {title}
        </span>
        <span
          className="text-xs font-bold"
          style={{
            color: "rgba(255,255,255,0.5)",
            background: "rgba(255,255,255,0.08)",
            borderRadius: 999,
            padding: "1px 8px",
          }}
        >
          {badge}
        </span>
      </div>

      {emptyMessage ? (
        <div className="text-sm" style={{ color: "rgba(255,255,255,0.3)", padding: "8px 2px" }}>
          {emptyMessage}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
