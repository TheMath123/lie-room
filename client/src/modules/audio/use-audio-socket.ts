import { env } from "@/env";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type UseAudioSocketProps = {
  roomId: string;
  participantId: string;
  isTalking: boolean;
  onRemoteVolume?: (volume: number) => void;
};

export function useAudioSocket({
  roomId,
  participantId,
  isTalking,
  onRemoteVolume,
}: UseAudioSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Conectar ao socket
  useEffect(() => {
    if (!roomId || !participantId) return;
    const socket = io(env.NEXT_PUBLIC_SOCKET_URL!, {
      transports: ["websocket"],
    });
    console.log(socket);
    socket.emit("join-room", { roomId, from: participantId });
    socketRef.current = socket;
    setIsReady(true);

    // Receber chunks de áudio e tocar
    socket.on("audio-chunk", ({ chunk }) => {
      if (!audioContextRef.current) {
        audioContextRef.current = new window.AudioContext();
      }
      // Decodifica e toca o áudio recebido
      const float32 = new Float32Array(chunk);
      const audioBuffer = audioContextRef.current.createBuffer(
        1,
        float32.length,
        audioContextRef.current.sampleRate
      );
      audioBuffer.copyToChannel(float32, 0);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();

      // Calcula volume para espectro remoto
      if (onRemoteVolume) {
        const avg =
          float32.reduce((a, b) => a + Math.abs(b), 0) / float32.length;
        onRemoteVolume(avg * 255); // normaliza para 0-255
      }
    });

    return () => {
      socket.disconnect();
      setIsReady(false);
    };
  }, [roomId, participantId, onRemoteVolume]);

  // Capturar e enviar áudio
  useEffect(() => {
    if (!isTalking || !isReady) return;
    let stream: MediaStream;
    let audioContext: AudioContext;
    let source: MediaStreamAudioSourceNode;
    let processor: ScriptProcessorNode;

    navigator.mediaDevices.getUserMedia({ audio: true }).then((s) => {
      stream = s;
      audioContext = new window.AudioContext();
      source = audioContext.createMediaStreamSource(stream);
      processor = audioContext.createScriptProcessor(2048, 1, 1);

      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        // Envia como Float32Array (pode otimizar para Int16Array se quiser)
        socketRef.current?.emit("audio-chunk", {
          roomId,
          chunk: Array.from(input),
          from: participantId,
        });
      };
    });

    return () => {
      processor?.disconnect();
      source?.disconnect();
      audioContext?.close();
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [isTalking, isReady, roomId, participantId]);
}