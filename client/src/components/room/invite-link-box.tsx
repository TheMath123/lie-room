import { useState } from "react";

export function InviteLinkBox({ roomId }: { roomId: string }) {
	const [copied, setCopied] = useState(false);
	const inviteUrl =
		typeof window !== "undefined"
			? `${window.location.origin}/room/${roomId}`
			: "";

	const handleCopy = async () => {
		if (!inviteUrl) return;
		await navigator.clipboard.writeText(inviteUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	return (
		<div className=" max-w-xs w-full mt-4 p-4 bg-green-100 rounded flex flex-col items-start">
			<span className="mb-2 font-medium">Link de convite:</span>
			<div className="flex w-full gap-2">
				<input
					type="text"
					value={inviteUrl}
					readOnly
					className="flex-1 p-2 border rounded bg-white text-xs"
				/>
				<button
					type="button"
					onClick={handleCopy}
					className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
				>
					{copied ? "Copiado!" : "Copiar"}
				</button>
			</div>
		</div>
	);
}
