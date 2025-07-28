type AudioSpectrumProps = {
  label: string;
  spectrum?: number[];
  bars?: number;
  isActive: boolean;
};

export function AudioSpectrum({
  label,
  spectrum = Array(32).fill(0),
  bars = 32,
  isActive,
}: AudioSpectrumProps) {
  return (
    <div className="flex flex-col items-center mb-4 w-full">
      <span className="mb-1">{label}</span>
      <div
        className="flex items-end w-full h-40 rounded"
        style={{
          background: "none",
        }}
      >
        {spectrum.map((v, i) => (
          <div
            key={i}
            className={`transition-all duration-100 rounded-t ${
              isActive ? "bg-green-600" : "bg-gray-400"
            }`}
            style={{
              width: `calc(100% / ${bars} - 2px)`,
              marginLeft: i === 0 ? 0 : 2,
              height: `${(v / 255) * 100}%`,
              minHeight: 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}