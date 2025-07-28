import { env } from "@/env";
import { useEffect, useRef, useState } from "react";

type UseAudioSocketProps = {
  roomId: string;
  participantId: string;
  isTalking: boolean;
  onRemoteVolume?: (volume: number) => void;
  onRemoteSpectrum?: (spectrum: number[]) => void; // NOVO!
};

export function useAudioSocket({
  roomId,
  participantId,
  isTalking,
  onRemoteVolume,
  onRemoteSpectrum, // NOVO!
}: UseAudioSocketProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [isReady, setIsReady] = useState(false);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  // Função para conectar/reconectar
  function connectWS() {
    const wsUrl = `${env.NEXT_PUBLIC_SOCKET_URL?.replace(/^http/, "ws") || "ws://localhost:5555/ws"}?roomId=${roomId}&participantId=${participantId}`;
    const ws = new WebSocket(wsUrl);
    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      setIsReady(true);
      ws.send(JSON.stringify({ type: "join", roomId, participantId }));
      console.log('Connected to WebSocket:', wsUrl);
    };

    ws.onmessage = (event) => {
      if (!audioContextRef.current) {
        audioContextRef.current = new window.AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.connect(audioContextRef.current.destination);
      }
      if (typeof event.data === "string") return;
      const float32 = new Float32Array(event.data);
      const audioBuffer = audioContextRef.current.createBuffer(
        1,
        float32.length,
        audioContextRef.current.sampleRate
      );
      audioBuffer.copyToChannel(float32, 0);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(analyserRef.current!);
      source.start();

      // Atualiza espectro enquanto toca
      const analyser = analyserRef.current!;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const bars = 32;
      function updateSpectrum() {
        analyser.getByteFrequencyData(dataArray);
        const step = Math.floor(dataArray.length / bars);
        const spectrumArr = Array.from({ length: bars }, (_, i) => {
          const start = i * step;
          const end = start + step;
          const slice = dataArray.slice(start, end);
          return slice.length
            ? slice.reduce((a, b) => a + b, 0) / slice.length
            : 0;
        });
        onRemoteSpectrum?.(spectrumArr);
        requestAnimationFrame(updateSpectrum);
      }
      updateSpectrum();

      if (onRemoteVolume) {
        const avg =
          float32.reduce((a, b) => a + Math.abs(b), 0) / float32.length;
        onRemoteVolume(avg * 255);
      }
    };

    ws.onclose = () => {
      setIsReady(false);
      reconnectTimeout.current = setTimeout(connectWS, 1000);
    };

    ws.onerror = () => {
      setIsReady(false);
      ws.close();
    };

    wsRef.current = ws;
  }

  useEffect(() => {
    if (!roomId || !participantId) return;
    connectWS();
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "leave", roomId, participantId }));
      }
      wsRef.current?.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      setIsReady(false);
    };
  }, [roomId, participantId, onRemoteVolume, onRemoteSpectrum]);

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