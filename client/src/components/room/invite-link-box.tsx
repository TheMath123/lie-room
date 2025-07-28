import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function InviteLinkBox({ roomId }: { roomId: string }) {
	const [copiedLink, setCopiedLink] = useState(false);
	const [copied, setCopied] = useState(false);
	const inviteUrl =
		typeof window !== "undefined"
			? `${window.location.origin}/room/${roomId}`
			: "";

	const handleCopyLink = async () => {
		if (!inviteUrl) return;
		await navigator.clipboard.writeText(inviteUrl);
		setCopiedLink(true);
		setTimeout(() => setCopied(false), 1500);
	};

	const handleCopy = async () => {
		if (!roomId) return;
		await navigator.clipboard.writeText(roomId);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	return (
		<div className=" max-w-xs w-full mt-4 p-4 border border-border rounded flex flex-col items-start gap-2">
			<span className="mb-2 font-medium">Link de convite:</span>
			<div className="flex w-full gap-2">
				<Input
					type="text"
					value={inviteUrl}
					readOnly
				/>
				<Button
					type="button"
					onClick={handleCopyLink}
				>
					{copiedLink ? "Copiado!" : "Copiar"}
				</Button>
			</div>
			<div className="flex w-full gap-2">
				<Input
					type="text"
					inputMode="numeric"
					value={roomId}
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
