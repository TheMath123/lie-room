"use client";

import { AudioSpectrum } from "@/components/audio-spectrum";
import { InviteLinkBox } from "@/components/room";
import { Button } from "@/components/ui/button";
import type { ParticipantRole } from "@/lib/schemas/room";
import { cn } from "@/lib/utils";
import { useAudioSocket, useMicrophone } from "@/modules/audio";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoomPlayPage() {
  const router = useRouter();
  const params = useParams();
  const [role, setRole] = useState<ParticipantRole | null>(null);
  const [isTalking, setIsTalking] = useState(false);
  const [remoteVolume, setRemoteVolume] = useState(0);
  const canTalk = role === "host" || role === "player";
  const { volume, spectrum: spectrumLocal } = useMicrophone(isTalking && canTalk, 32);
  const [remoteSpectrum, setRemoteSpectrum] = useState(Array(32).fill(0));

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
    onRemoteSpectrum: setRemoteSpectrum, // NOVO!
  });

  if (!role) return null;

  const handleStartTalking = () => {
    setIsTalking(true);
  };

  const handleStopTalking = () => {
    setIsTalking(false);
  };

  return (
    <div className="flex flex-col items-center">
      {role === "host" && <InviteLinkBox roomId={roomId} />}
      <main className="max-w-2xl w-full mx-auto mt-10 p-6 border rounded flex flex-col items-center">
        <AudioSpectrum
          label="Mestre"
          isActive={role === "host" && isTalking}
          spectrum={
            role === "host" && isTalking
              ? spectrumLocal
              : role === "player" && !isTalking
                ? remoteSpectrum
                : Array(32).fill(0)
          }
          bars={32}
        />
        <AudioSpectrum
          label="Jogador"
          isActive={role === "player" && isTalking}
          spectrum={
            role === "player" && isTalking
              ? spectrumLocal
              : role === "host" && !isTalking
                ? remoteSpectrum
                : Array(32).fill(0)
          }
          bars={32}
        />

        {canTalk && (
          <Button
            type="button"
            className={cn(isTalking && "bg-green-500 hover:bg-green-500 animate-pulse")}
            onMouseDown={handleStartTalking}
            onMouseUp={handleStopTalking}
            onTouchStart={handleStartTalking}
            onTouchEnd={handleStopTalking}
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