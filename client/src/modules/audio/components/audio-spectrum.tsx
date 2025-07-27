type AudioSpectrumProps = {
	label: string;
	volume?: number;
	isActive: boolean;
};

export function AudioSpectrum({
	label,
	volume = 0,
	isActive,
}: AudioSpectrumProps) {
	// O volume vai de 0 a 255
	const barWidth = Math.min(100, (volume / 255) * 100);

	return (
		<div className="flex flex-col items-center mb-4">
			<span className="mb-1">{label}</span>
			<div className="w-64 h-8 rounded bg-gray-200 flex items-center">
				<div
					className={`h-8 rounded transition-all duration-100 ${isActive ? "bg-green-500" : "bg-gray-400"}`}
					style={{ width: `${barWidth}%` }}
				/>
			</div>
		</div>
	);
}
