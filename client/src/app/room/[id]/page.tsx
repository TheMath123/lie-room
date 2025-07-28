"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isLeft } from "@/errors";
import { joinRoom } from "@/server/room";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function RoomJoinPage() {
	const params = useParams<{id: string}>();
	const router = useRouter();
	const [name, setName] = useState("");
	const [role, setRole] = useState<"player" | "observer">("player");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleJoin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		const res = await joinRoom(params.id, name, role);
		setLoading(false);
		if (isLeft(res)) {
			console.log(res.value);
			setError(res.value);
			return 
		}

		const data = res.value;
		sessionStorage.setItem("participantId", data.participantId);
		sessionStorage.setItem("participantRole", role);
		router.push(`/room/${params.id}/play`);
	};

	return (
		<div className="max-w-md mx-auto mt-10 p-6 border rounded">
			<h1 className="text-2xl font-bold mb-4">Entrar na Sala</h1>
			<form onSubmit={handleJoin} className="flex flex-col gap-4">
				<Input
					type="text"
					placeholder="Seu nome"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="border p-2 rounded"
					required
				/>
				<div className="flex gap-4">
			
					<div className="flex items-center gap-2">
					<Input
					id="player-role"
							type="radio"
							name="role"
							value="player"
							checked={role === "player"}
							onChange={() => setRole("player")}
					/>
							<label htmlFor="player-role">
						Jogador
					</label>
					</div>

					<div className="flex items-center gap-2">

					<Input
						id="observer-role"
							type="radio"
							name="role"
							value="observer"
							checked={role === "observer"}
							onChange={() => setRole("observer")}
						/>
					<label htmlFor="observer-role">
						Observador
						</label>
						</div>
				</div>
				<Button
					type="submit"
			
					disabled={loading}
				>
					{loading ? "Entrando..." : "Entrar"}
				</Button>
				{error && <div className="text-red-600">{error}</div>}
			</form>
		</div>
	);
}
