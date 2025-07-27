"use client";

import { InviteLinkBox } from "@/components/room";
import type { ParticipantRole } from "@/lib/schemas/room";
import { AudioSpectrum, useAudioSocket, useMicrophone } from "@/modules/audio";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoomPlayPage() {
  const router = useRouter();
  const params = useParams();
  const [role, setRole] = useState<ParticipantRole | null>(null);
  const [isTalking, setIsTalking] = useState(false);
  const [remoteVolume, setRemoteVolume] = useState(0);

  // Recupera participantId do sessionStorage
  const participantId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("participantId") || ""
      : "";
  const roomId = params.id as string;

  const canTalk = role === "host" || role === "player";
  const { volume } = useMicrophone(isTalking && canTalk);

  useAudioSocket({
    roomId,
    participantId,
    isTalking: isTalking && canTalk,
    onRemoteVolume: setRemoteVolume,
  });

  useEffect(() => {
    // Recupera dados do participante
    const participantRole = sessionStorage.getItem("participantRole");
    if (!participantRole) {
      router.replace(`/room/${params.id}`);
      return;
    }
    setRole(participantRole as "host" | "player" | "observer");
  }, [params.id, router]);

  if (!role) return null;

  return (
    <div className="flex flex-col items-center">
      {role === "host" && <InviteLinkBox roomId={roomId} />}
      <main className="max-w-lg mx-auto mt-10 p-6 border rounded flex flex-col items-center">
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
          <button
            type="button"
            className={`mt-8 px-6 py-3 rounded text-white font-bold transition-all ${
              isTalking
                ? "bg-red-600 animate-pulse"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            onMouseDown={() => setIsTalking(true)}
            onMouseUp={() => setIsTalking(false)}
            onTouchStart={() => setIsTalking(true)}
            onTouchEnd={() => setIsTalking(false)}
          >
            {isTalking ? "Gravando..." : "Apertar para Falar"}
          </button>
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