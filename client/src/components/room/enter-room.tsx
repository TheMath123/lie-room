'use client';

import { clientEnv } from "@/env/client";
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
  const inviteUrl =
    typeof window !== "undefined"
      ? `${clientEnv.NEXT_PUBLIC_BASE_URL}room/${roomId}`
      : "";

  const handleCopy = async () => {
    if (!inviteUrl) return;
    const res = await getRoom(roomId);
    if (isLeft(res)) {
      setError(res.value);
      return;
    }
   router.push(inviteUrl)
  };

  return (
    <div className=" max-w-xs w-full mt-4 p-4 border border-border rounded flex flex-col items-start">
      <div className="flex w-full gap-2">
        <Input
          type="text"
          value={roomId}
          placeholder="Digite o ID da sala"
          onChange={(e) => setRoomId(e.target.value)}
          className="flex-1 p-2 border rounded bg-white text-xs"
        />
        <Button
          type="button"
          onClick={handleCopy}
         
        >
          Entrar
        </Button>
        {error && (
          <span className="text-red-500 text-xs mt-2">{error}</span>)}
      </div>
    </div>
  );
}
