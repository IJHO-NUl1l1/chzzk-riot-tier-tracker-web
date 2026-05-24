"use client";

import { useEffect, useRef, useState } from "react";
import { useChatList } from "./useChatList";
import { useTierCache } from "./useTierCache";
import type { TierEntry } from "./useTierCache";
import ChatRow from "./ChatRow";

interface Props {
  chatChannelId: string;
  accessToken: string | null;
}

export default function ChatBox({ chatChannelId, accessToken }: Props) {
  const chats = useChatList(chatChannelId, accessToken);
  const { getTier } = useTierCache();
  const [tierMap, setTierMap] = useState<Map<string, TierEntry[]>>(new Map());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chats.length === 0) return;
    const lastChat = chats[chats.length - 1];
    const nick = lastChat.nickname;
    if (!nick || tierMap.has(nick)) return;

    getTier(nick).then((entries) => {
      setTierMap((prev) => {
        const next = new Map(prev);
        next.set(nick, entries);
        return next;
      });
    });
  }, [chats, getTier, tierMap]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  return (
    <div
      className="fixed inset-0 flex flex-col justify-end p-2 overflow-hidden"
      style={{
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 80px)",
        maskImage: "linear-gradient(to bottom, transparent 0%, black 80px)",
      }}
    >
      <div className="flex flex-col gap-0.5 overflow-hidden">
        {chats.map((chat) => (
          <ChatRow
            key={chat.uid}
            chat={chat}
            tierEntries={tierMap.get(chat.nickname) ?? []}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
