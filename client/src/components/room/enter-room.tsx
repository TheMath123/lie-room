'use client';

import { isLeft } from "@/errors";
import { getRoom } from "@/server/room/get-room";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function EnterRoom() {
  const router = useRouter()
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');


  const handleCopy = async () => {
    const res = await getRoom(roomId);
    if (isLeft(res)) {
      setError(res.value);
      return;
    }
    router.push(`/room/${roomId}/`)
  };

  return (
    <div className="flex flex-col gap-2">
      <Input
        type="text"
        inputMode="numeric"
        value={roomId}
        placeholder="Digite o ID da sala"
        onChange={(e) => setRoomId(e.target.value)}
      />
      <Button
        type="button"
        onClick={handleCopy}

      >
        Entrar
      </Button>
      {error && (
        <span className="text-destructive text-xs mt-2">{error}</span>)}
    </div>
  );
}
