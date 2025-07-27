"use server";

import { env } from "@/env";
import { Either, left, right } from "@/errors";

export async function createRoom(hostName: string): Promise<Either<string, any>> {
  try {
    const url = `${env.API_URL}/room/create`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostName }),
    });

    if (!res.ok) {
      const error = await res.text();
      return left(`Erro ao criar sala: ${error}`);
    }

    const data = await res.json();
    return right(data);
  } catch (err) {
    return left(`Erro inesperado: ${err instanceof Error ? err.message : String(err)}`);
  }
}