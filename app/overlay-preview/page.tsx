import BadgeList from "@/components/overlay/BadgeList";
import TierStats from "@/components/overlay/TierStats";
import { MOCK_OVERLAY_VIEWERS as mockViewers } from "@/components/overlay/mockOverlayViewers";

export default function OverlayPreviewPage() {
  return (
    <div
      className="p-6 flex flex-wrap items-start gap-6"
      style={{
        background: "#1a1a1a",
        minHeight: "100vh",
        fontFamily: "Pretendard, sans-serif",
      }}
    >
      <div>
        <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>mode=list&amp;game=lol</p>
        <BadgeList viewers={mockViewers} gameType="lol" />
      </div>
      <div>
        <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>mode=stats&amp;game=lol</p>
        <TierStats viewers={mockViewers} gameType="lol" />
      </div>
      <div>
        <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>mode=list&amp;game=tft</p>
        <BadgeList viewers={mockViewers} gameType="tft" />
      </div>
      <div>
        <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>mode=stats&amp;game=tft</p>
        <TierStats viewers={mockViewers} gameType="tft" />
      </div>
    </div>
  );
}
