
import { isRight } from "@/errors";
import { getOnlineParticipants } from "@/server/room";
import { useEffect, useState } from "react";

export function useOnlineParticipants(roomId: string) {
  const [onlineIds, setOnlineIds] = useState<string[]>([]);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    async function fetchOnline() {
    const res = await getOnlineParticipants(roomId);
      if (isRight(res)) {
        setOnlineIds(res.value);
      }
    }
    fetchOnline();
    interval = setInterval(fetchOnline, 2000);
    return () => clearInterval(interval);
  }, [roomId]);
  return onlineIds;
}