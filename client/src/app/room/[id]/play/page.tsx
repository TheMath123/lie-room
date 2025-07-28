"use client";

import { AudioSpectrum } from "@/components/audio-spectrum";
import { InviteLinkBox } from "@/components/room";
import { Button } from "@/components/ui/button";
import { isRight } from "@/errors";
import type { ParticipantRole } from "@/lib/schemas/room";
import { cn } from "@/lib/utils";
import { useAudioSocket, useMicrophone } from "@/modules/audio";
import { useOnlineParticipants } from "@/modules/use-online-participants";
import { getParticipants } from "@/server/room/get-participants";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoomPlayPage() {
  const router = useRouter();
  const params = useParams();
  const [role, setRole] = useState<ParticipantRole | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(true);
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
  const onlineIds = useOnlineParticipants(roomId);

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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    async function fetchParticipants() {
      setLoadingParticipants(true);
      const res = await getParticipants(roomId);
      setLoadingParticipants(false);
      if (isRight(res)) setParticipants(res.value);
    }
    fetchParticipants();
    // Atualiza a cada 2s para refletir conexões/desconexões
    interval = setInterval(fetchParticipants, 2000);
    return () => clearInterval(interval);
  }, [roomId]);

  if (!role) return null;

  const handleStartTalking = () => {
    setIsTalking(true);
  };

  const handleStopTalking = () => {
    setIsTalking(false);
  };

  function getStatusDot(id: string) {
    console.log('ID:', id);
    console.log('Online IDs:', onlineIds);
    return (
      <span
        className={`inline-block w-2 h-2 rounded-full ml-2 ${onlineIds.includes(id) ? "bg-green-500" : "bg-muted-foreground"
          }`}
        title={onlineIds.includes(id) ? "Conectado" : "Desconectado"}
      />
    );
  }

  const host = participants.find(p => p.role === "host");
  const player = participants.find(p => p.role === "player");
  const observers = participants.filter(p => p.role === "observer");

  return (
    <div className="flex flex-col items-center">
      {role === "host" && <InviteLinkBox roomId={roomId} />}
      <main className="max-w-2xl w-full mx-auto mt-10 p-6 border border-border rounded flex flex-col items-center">

        <AudioSpectrum
          label={
            <>
              {host ? host.name : "Anfitrião"}
              <span className="text-xs text-muted-foreground">{host && host.id === participantId && " (Você)"}</span>
              {host && getStatusDot(host.id)}
            </>
          }
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
          label={
            <>
              {player ? player.name : "Convidado"}
              <span className="text-xs text-muted-foreground">{player && player.id === participantId && " (Você)"}</span>
              {player && getStatusDot(player.id)}
            </>
          }
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
          <div className="mt-8 text-muted-foreground">
            Você está como observador. Apenas escute.
          </div>
        )}
      </main>
      <div className="mt-4 w-full mx-auto max-w-2xl p-6 border rounded text-xs">
        <h3 className="font-semibold mb-2">Observadores:</h3>
        {observers.length === 0 && <div className="text-muted-foreground">Nenhum observador</div>}
        <ul>
          {observers.map(obs => (
            <li key={obs.id} className="flex items-center gap-2">
              <span>{obs.name}</span>
              {obs.id === participantId && <span className="text-xs text-green-600">(Você)</span>}
              {getStatusDot(obs.id)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}