"use client";

import { isLeft } from "@/errors";
import { createRoom } from "@/server/room";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateRoomPage() {
	const router = useRouter();
	const [hostName, setHostName] = useState("");
	const [inviteUrl, setInviteUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!hostName) return;
		const res = await createRoom(hostName);
		if (isLeft(res)) { 
			setError(res.value);
			return;
		}

		const { roomId, hostId } = res.value;

		// Salva o host como participante
		sessionStorage.setItem("participantId", hostId);
		sessionStorage.setItem("participantRole", "host");

		// Redireciona para a sala
		router.push(`/room/${roomId}/play`);
	};

	return (
		<div className="max-w-md mx-auto mt-10 p-6 border rounded">
			<h1 className="text-2xl font-bold mb-4">Criar Sala de Interrogatório</h1>
			<form onSubmit={handleCreate} className="flex flex-col gap-4">
				<input
					type="text"
					placeholder="Seu nome (Mestre)"
					value={hostName}
					onChange={(e) => setHostName(e.target.value)}
					className="border p-2 rounded"
					required
				/>
				<button
					type="submit"
					className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
				>
					Criar Sala
				</button>
					{error && <div className="text-red-600">{error}</div>}
			</form>
			{inviteUrl && (
				<div className="mt-6 p-4 bg-green-100 rounded">
					<p>Sala criada! Compartilhe o link:</p>
					<a href={inviteUrl} className="text-blue-700 underline break-all">
						{inviteUrl}
					</a>
				</div>
			)}
		</div>
	);
}
