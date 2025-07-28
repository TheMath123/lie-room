import { useEffect, useRef, useState } from "react";

export function useMicrophone(isActive: boolean, bars = 32) {
  const [volume, setVolume] = useState(0);
  const [spectrum, setSpectrum] = useState<number[]>(Array(bars).fill(0));
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setVolume(0);
      setSpectrum(Array(bars).fill(0));
      return;
    }

    if (
      typeof window === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setVolume(0);
      setSpectrum(Array(bars).fill(0));
      return;
    }

    let audioContext: AudioContext;
    let analyser: AnalyserNode;

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        streamRef.current = stream;
        audioContext = new window.AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const update = () => {
          analyser.getByteFrequencyData(dataArray);
          // Calcula o volume médio
          const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setVolume(avg);

          // Reduza o array para o número de barras desejado
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

          animationRef.current = requestAnimationFrame(update);
        };
        update();
      })
      .catch(() => {
        setVolume(0);
        setSpectrum(Array(bars).fill(0));
      });

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isActive, bars]);

  return { volume, spectrum };
}