export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import ChatBox from "./ChatBox";

interface Props {
  params: Promise<{ channelId: string }>;
}

async function getChatTokens(channelId: string) {
  const liveRes = await fetch(
    `https://api.chzzk.naver.com/polling/v2/channels/${channelId}/live-status`,
    { cache: "no-store" }
  );
  if (!liveRes.ok) return null;
  const liveJson = await liveRes.json();
  const chatChannelId = liveJson?.content?.chatChannelId as string | undefined;
  if (!chatChannelId) return null;

  const tokenRes = await fetch(
    `https://comm-api.game.naver.com/nng_main/v1/chats/access-token?chatType=STREAMING&channelId=${chatChannelId}`,
    { cache: "no-store" }
  );
  if (!tokenRes.ok) return null;
  const tokenJson = await tokenRes.json();
  const accessToken = tokenJson?.content?.accessToken as string | undefined;

  return { chatChannelId, accessToken: accessToken ?? null };
}

export default async function ChatPage({ params }: Props) {
  const { channelId } = await params;
  const tokens = await getChatTokens(channelId);
  if (!tokens) notFound();

  return (
    <ChatBox
      chatChannelId={tokens.chatChannelId}
      accessToken={tokens.accessToken}
    />
  );
}
