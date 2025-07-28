import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

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
		<div className=" max-w-xs w-full mt-4 p-4 border border-border rounded flex flex-col items-start">
			<span className="mb-2 font-medium">Link de convite:</span>
			<div className="flex w-full gap-2">
				<Input
					type="text"
					value={inviteUrl}
					readOnly
				/>
				<Button
					type="button"
					onClick={handleCopy}
				>
					{copied ? "Copiado!" : "Copiar"}
				</Button>
			</div>
		</div>
	);
}
