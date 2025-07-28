import { useRef, useState } from "react";

export function useRemoteSpectrum() {
  const [spectrum, setSpectrum] = useState<number[]>(Array(32).fill(0));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Chame esta função sempre que receber um novo chunk de áudio remoto
  function playAndAnalyzeRemoteAudio(float32Array: Float32Array) {
    if (!audioContextRef.current) {
      audioContextRef.current = new window.AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
    }
    const ctx = audioContextRef.current;
    const analyser = analyserRef.current!;

    // Cria buffer e toca o áudio
    const buffer = ctx.createBuffer(1, float32Array.length, ctx.sampleRate);
    buffer.copyToChannel(float32Array, 0);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    source.start();

    // Atualiza o espectro
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Reduz para 32 barras
    const bars = 32;
    const step = Math.floor(dataArray.length / bars);
    const spectrumArr = Array.from({ length: bars }, (_, i) => {
      const start = i * step;
      const end = start + step;
      const slice = dataArray.slice(start, end);
      return slice.length
        ? slice.reduce((a, b) => a + b, 0) / slice.length
        : 0;
    });
    setSpectrum(spectrumArr);

    // Limpa o source depois de tocar
    source.onended = () => {
      source.disconnect();
    };
  }

  return { spectrum, playAndAnalyzeRemoteAudio };
}