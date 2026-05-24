"use client";

import { useCallback, useEffect, useRef, useState } from "react";

enum ChatCmd {
  PING = 0,
  PONG = 10000,
  CONNECT = 100,
  CONNECTED = 10100,
  REQUEST_RECENT_CHAT = 5101,
  RECENT_CHAT = 15101,
  CHAT = 93101,
}

const nicknameColors = [
  "#ECA843", "#EEA05D", "#EA723D", "#EAA35F", "#E98158", "#E97F58", "#E76D53", "#E66D5F", "#E56B79", "#E16490",
  "#E481AE", "#E68199", "#DC5E9A", "#E16CB5", "#D25FAC", "#D263AE", "#D66CB4", "#D071B6", "#BA82BE", "#AF71B5",
  "#A96BB2", "#905FAA", "#B38BC2", "#9D78B8", "#8D7AB8", "#7F68AE", "#9F99C8", "#717DC6", "#5E7DCC", "#5A90C0",
  "#628DCC", "#7994D0", "#81A1CA", "#ADD2DE", "#80BDD3", "#83C5D6", "#8BC8CB", "#91CBC6", "#83C3BB", "#7DBFB2",
  "#AAD6C2", "#84C194", "#B3DBB4", "#92C896", "#94C994", "#9FCE8E", "#A6D293", "#ABD373", "#BFDE73", "#CCE57D",
];

export interface Chat {
  uid: string;
  time: number;
  nickname: string;
  badges: string[];
  color: string;
  emojis: Record<string, string>;
  message: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertChat(raw: any, channelId: string): Chat {
  const profile = JSON.parse(raw["profile"]);
  const extras = JSON.parse(raw["extras"]);

  const nickname: string = profile.nickname;

  const badge: string | undefined = profile.badge?.imageUrl;
  const donationBadge: string | undefined =
    profile.streamingProperty?.realTimeDonationRanking?.badge?.imageUrl;
  const activityBadges: string[] =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    profile.activityBadges?.filter((b: any) => b.activated)?.map((b: any) => b.imageUrl) ?? [];
  const badges: string[] = [badge, donationBadge, ...activityBadges].filter(
    (b): b is string => b != null
  );

  const colorRaw = profile.title?.color;
  const color: string =
    colorRaw ??
    nicknameColors[
      (profile.userIdHash + channelId)
        .split("")
        .map((c: string) => c.charCodeAt(0))
        .reduce((a: number, b: number) => a + b, 0) % nicknameColors.length
    ];

  const emojis: Record<string, string> = extras?.emojis ?? {};
  const message: string = raw["msg"] || raw["content"] || "";
  const time: number = raw["msgTime"] || raw["messageTime"] || 0;

  return {
    uid: Math.random().toString(36).substring(2, 12),
    time,
    nickname,
    badges,
    color,
    emojis,
    message,
  };
}

const MAX_CHAT = 100;

export function useChatList(chatChannelId: string, accessToken: string | null) {
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [buster, setBuster] = useState(0);
  const pendingRef = useRef<Chat[]>([]);
  const isBrowserUnloadingRef = useRef(false);

  const connect = useCallback(() => {
    const ws = new WebSocket("wss://kr-ss1.chat.naver.com/chat");

    const worker = new Worker(
      URL.createObjectURL(
        new Blob(
          [
            `
            let timeout = null;
            onmessage = (e) => {
              if (e.data === "startPingTimer") {
                if (timeout != null) clearTimeout(timeout);
                timeout = setTimeout(function reservePing() {
                  postMessage("ping");
                  timeout = setTimeout(reservePing, 20000);
                }, 20000);
              }
              if (e.data === "stop") {
                if (timeout != null) clearTimeout(timeout);
              }
            };
          `,
          ],
          { type: "application/javascript" }
        )
      )
    );

    worker.onmessage = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ ver: "2", cmd: ChatCmd.PING }));
      }
    };

    const defaults = { cid: chatChannelId, svcid: "game", ver: "2" };

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          bdy: { accTkn: accessToken ?? "", auth: "READ", devType: 2001, uid: null },
          cmd: ChatCmd.CONNECT,
          tid: 1,
          ...defaults,
        })
      );
    };

    ws.onclose = () => {
      if (!isBrowserUnloadingRef.current) {
        setTimeout(() => setBuster((b) => b + 1), 1000);
      }
    };

    ws.onmessage = (event: MessageEvent) => {
      const json = JSON.parse(event.data);

      switch (json.cmd) {
        case ChatCmd.PING:
          ws.send(JSON.stringify({ ver: "2", cmd: ChatCmd.PONG }));
          break;

        case ChatCmd.CONNECTED: {
          const sid = json.bdy.sid;
          ws.send(
            JSON.stringify({
              bdy: { recentMessageCount: MAX_CHAT },
              cmd: ChatCmd.REQUEST_RECENT_CHAT,
              sid,
              tid: 2,
              ...defaults,
            })
          );
          break;
        }

        case ChatCmd.RECENT_CHAT: {
          const chats: Chat[] = (json.bdy?.messageList ?? [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((c: any) => (c.msgTypeCode ?? c.messageTypeCode) === 1)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((c: any) => (c.msgStatusType ?? c.messageStatusType) !== "HIDDEN")
            .map((c: Chat) => convertChat(c, chatChannelId));
          pendingRef.current = [];
          setChatList(chats);
          break;
        }

        case ChatCmd.CHAT: {
          const raw: unknown[] = Array.isArray(json.bdy) ? json.bdy : [json.bdy];
          const chats: Chat[] = raw
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((c: any) => (c.msgTypeCode ?? c.messageTypeCode) === 1)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((c: any) => (c.msgStatusType ?? c.messageStatusType) !== "HIDDEN")
            .map((c) => convertChat(c, chatChannelId));
          pendingRef.current = [...pendingRef.current, ...chats].slice(-MAX_CHAT);
          break;
        }
      }

      if (json.cmd !== ChatCmd.PONG) {
        worker.postMessage("startPingTimer");
      }
    };

    worker.postMessage("startPingTimer");

    return () => {
      worker.postMessage("stop");
      worker.terminate();
      ws.close();
    };
  }, [chatChannelId, accessToken]);

  useEffect(() => {
    return connect();
  }, [connect, buster]);

  useEffect(() => {
    const onUnload = () => { isBrowserUnloadingRef.current = true; };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden || pendingRef.current.length === 0) return;
      setChatList((prev) => {
        const next = [...prev, ...pendingRef.current].slice(-MAX_CHAT);
        pendingRef.current = [];
        return next;
      });
    }, 75);
    return () => clearInterval(interval);
  }, []);

  return chatList;
}
