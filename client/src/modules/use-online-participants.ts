import { useEffect, useState } from "react";

export function useOnlineParticipants(roomId: string) {
  const [onlineIds, setOnlineIds] = useState<string[]>([]);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    async function fetchOnline() {
      const res = await fetch(`/api/room/${roomId}/online`);
      if (res.ok) {
        const data = await res.json();
        setOnlineIds(data);
      }
    }
    fetchOnline();
    interval = setInterval(fetchOnline, 2000);
    return () => clearInterval(interval);
  }, [roomId]);
  return onlineIds;
}