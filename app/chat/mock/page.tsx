"use client";

import { useEffect, useState } from "react";
import ChatRow from "../[channelId]/ChatRow";
import type { Chat } from "../[channelId]/useChatList";
import type { TierEntry } from "../[channelId]/useTierCache";

const MOCK_TIERS: Record<string, TierEntry[]> = {
  "다이아유저": [{ game_type: "lol", tier: "Diamond", rank: "II", is_public: true }],
  "골드충": [{ game_type: "lol", tier: "Gold", rank: "IV", is_public: true }],
  "tft장인": [{ game_type: "tft", tier: "Challenger", rank: null, is_public: true }],
  "챌린저형": [{ game_type: "lol", tier: "Challenger", rank: null, is_public: true }],
};

const MOCK_CHATS: Chat[] = [
  {
    uid: "1",
    time: 0,
    nickname: "챌린저형",
    badges: [],
    color: "#ECA843",
    emojis: {},
    message: "안녕하세요 ㅎㅎ",
  },
  {
    uid: "2",
    time: 0,
    nickname: "일반시청자",
    badges: [],
    color: "#83C5D6",
    emojis: {},
    message: "오늘 방송 재밌다",
  },
  {
    uid: "3",
    time: 0,
    nickname: "다이아유저",
    badges: [],
    color: "#9F99C8",
    emojis: {},
    message: "저 다이아 왔어요!",
  },
  {
    uid: "4",
    time: 0,
    nickname: "골드충",
    badges: [],
    color: "#ABD373",
    emojis: {},
    message: "ㅋㅋㅋㅋ 골드도 나름 잘하는 편",
  },
  {
    uid: "5",
    time: 0,
    nickname: "tft장인",
    badges: [],
    color: "#E16490",
    emojis: {},
    message: "TFT 챌린저입니다 ^^",
  },
  {
    uid: "6",
    time: 0,
    nickname: "뱃지없는유저",
    badges: [],
    color: "#7994D0",
    emojis: {},
    message: "채팅창 이쁘네요",
  },
];

export default function MockChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    // 한 줄씩 500ms 간격으로 추가
    MOCK_CHATS.forEach((chat, i) => {
      setTimeout(() => {
        setChats((prev) => [...prev, { ...chat, uid: chat.uid + Date.now() }]);
      }, i * 500);
    });
  }, []);

  return (
    <div
      className="fixed inset-0 flex flex-col justify-end p-2 overflow-hidden"
      style={{
        background: "rgba(0,0,0,0.5)", // mock이라 배경 살짝 표시
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 80px)",
        maskImage: "linear-gradient(to bottom, transparent 0%, black 80px)",
      }}
    >
      <div className="flex flex-col gap-0.5 overflow-hidden">
        {chats.map((chat) => (
          <ChatRow
            key={chat.uid}
            chat={chat}
            tierEntries={MOCK_TIERS[chat.nickname] ?? []}
          />
        ))}
      </div>
    </div>
  );
}
