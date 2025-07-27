"use server";

import { env } from "@/env";
import { Either, left, right } from "@/errors";

export async function joinRoom(
  id: string,
  name: string,
  role: "host" | "player" | "observer"
): Promise<Either<string, { participantId: string }>> {
  try {
    const url = `${env.API_URL}/room/${id}/join`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return left(errorData.error || "Erro ao entrar na sala.");
    }

    const data = await res.json();
    return right(data);
  } catch (err) {
    return left(`Erro inesperado: ${err instanceof Error ? err.message : String(err)}`);
  }
}