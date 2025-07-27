import { env } from "@/env";
import { useEffect, useRef, useState } from "react";

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
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Conectar ao WebSocket
  useEffect(() => {
    if (!roomId || !participantId) return;

    // Exemplo: ws://localhost:5555/ws?roomId=abc&participantId=xyz
    const wsUrl = `${env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5555/ws"}?roomId=${roomId}&participantId=${participantId}`;
    const ws = new WebSocket(wsUrl);

    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      setIsReady(true);
      // Opcional: envie uma mensagem de "join" se quiser
      // ws.send(JSON.stringify({ type: "join", roomId, participantId }));
    };

    ws.onmessage = (event) => {
      // Recebe chunk de áudio (ArrayBuffer)
      if (!audioContextRef.current) {
        audioContextRef.current = new window.AudioContext();
      }
      let float32: Float32Array;
      if (typeof event.data === "string") {
        // Se for string, ignore ou trate mensagens de controle
        return;
      } else {
        float32 = new Float32Array(event.data);
      }
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
    };

    ws.onclose = () => {
      setIsReady(false);
    };

    ws.onerror = (err) => {
      setIsReady(false);
      console.error("WebSocket error:", err);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
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
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(new Float32Array(input).buffer);
        }
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