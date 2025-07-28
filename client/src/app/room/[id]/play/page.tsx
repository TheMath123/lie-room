"use client";

import { InviteLinkBox } from "@/components/room";
import { Button } from "@/components/ui/button";
import type { ParticipantRole } from "@/lib/schemas/room";
import { cn } from "@/lib/utils";
import { AudioSpectrum, useAudioSocket, useMicrophone } from "@/modules/audio";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoomPlayPage() {
  const router = useRouter();
  const params = useParams();
  const [role, setRole] = useState<ParticipantRole | null>(null);
  const [isTalking, setIsTalking] = useState(false);
  const [remoteVolume, setRemoteVolume] = useState(0);
  const canTalk = role === "host" || role === "player";
  const { volume } = useMicrophone(isTalking && canTalk);

  const participantId =
  typeof window !== "undefined"
    ? sessionStorage.getItem("participantId") || ""
    : "";
const roomId = params.id as string;


useEffect(() => {
  const participantRole = sessionStorage.getItem("participantRole");
  if (!participantRole) {
    router.replace(`/room/${params.id}`);
    return;
  }
  setRole(participantRole as "host" | "player" | "observer");
}, [params.id, router]);

// Só inicialize o hook se ambos existirem
useAudioSocket({
  roomId,
  participantId,
  isTalking: isTalking && canTalk,
  onRemoteVolume: setRemoteVolume,
});

  if (!role) return null;

  return (
    <div className="flex flex-col items-center">
      {role === "host" && <InviteLinkBox roomId={roomId} />}
      <main className="max-w-2xl w-full mx-auto mt-10 p-6 border rounded flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6">Sala de Interrogatório</h1>
        <AudioSpectrum
          label="Mestre"
          isActive={role === "host" && isTalking}
          volume={role === "host" && isTalking ? volume : remoteVolume}
        />
        <AudioSpectrum
          label="Jogador"
          isActive={role === "player" && isTalking}
          volume={role === "player" && isTalking ? volume : remoteVolume}
        />

        {canTalk && (
          <Button
            type="button"
            className={cn(isTalking && "bg-green-500 hover:bg-green-500 animate-pulse")}
            onMouseDown={() => setIsTalking(true)}
            onMouseUp={() => setIsTalking(false)}
            onTouchStart={() => setIsTalking(true)}
            onTouchEnd={() => setIsTalking(false)}
          >
            {isTalking ? "Gravando..." : "Apertar para Falar"}
          </Button>
        )}

        {!canTalk && (
          <div className="mt-8 text-gray-500">
            Você está como observador. Apenas escute.
          </div>
        )}
      </main>
    </div>
  );
}