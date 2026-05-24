"use client";

import React, { memo } from "react";
import Image from "next/image";
import type { Chat } from "./useChatList";
import type { TierEntry } from "./useTierCache";

interface Props {
  chat: Chat;
  tierEntries: TierEntry[];
}

const TIER_IMG_MAP: Record<string, string> = {
  IRON: "Iron", BRONZE: "Bronze", SILVER: "Silver", GOLD: "Gold",
  PLATINUM: "Platinum", EMERALD: "Emerald", DIAMOND: "Diamond",
  MASTER: "Master", GRANDMASTER: "Grandmaster", CHALLENGER: "Challenger",
};

function renderMessage(
  message: string,
  emojis: Record<string, string>
): React.ReactNode[] {
  const parts = message.split(/(\{:[^:]+:\})/g);
  return parts.map((part, i) => {
    const match = part.match(/^\{:([^:]+):\}$/);
    if (match) {
      const code = match[1];
      const url = emojis[code];
      if (url) {
        return (
          <Image
            key={i}
            src={url}
            alt={code}
            width={20}
            height={20}
            className="inline align-middle"
            unoptimized
          />
        );
      }
    }
    return <span key={i}>{part}</span>;
  });
}

function getBestTierEntry(entries: TierEntry[]): TierEntry | null {
  return entries.find((e) => e.game_type === "lol") ??
    entries.find((e) => e.game_type === "tft") ?? null;
}

const ChatRow = memo(function ChatRow({ chat, tierEntries }: Props) {
  const tierEntry = getBestTierEntry(tierEntries);
  const imgName = tierEntry ? TIER_IMG_MAP[tierEntry.tier.toUpperCase()] : null;
  const nickColor = chat.color || "#ffffff";

  return (
    <div
      className="animate-chat-in flex flex-wrap items-center gap-x-0 text-sm leading-6 break-words"
      style={{ fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif" }}
    >
      {/* badges */}
      <span className="inline-flex items-center gap-0.5 mr-1">
        {chat.badges.map((url, i) => (
          <Image
            key={i}
            src={url}
            alt="badge"
            width={20}
            height={20}
            className="shrink-0"
            unoptimized
          />
        ))}
        {imgName && (
          <Image
            src={`/images/RankedEmblemsLatest/Rank=${imgName}.png`}
            alt={tierEntry!.tier}
            width={20}
            height={20}
            className="shrink-0"
            unoptimized
          />
        )}
      </span>

      {/* nickname */}
      <span
        className="font-bold shrink-0 text-shadow-chat"
        style={{ color: nickColor }}
      >
        {chat.nickname}
      </span>

      {/* colon */}
      <span className="shrink-0 mx-1 text-[#d4d4d8] text-shadow-chat">:</span>

      {/* message */}
      <span className="text-[#d4d4d8] text-shadow-chat">
        {renderMessage(chat.message, chat.emojis)}
      </span>
    </div>
  );
});

export default ChatRow;
