'use server'

import { env } from "@/env";
import { Either, left, right } from "@/errors";
import { Room } from "@/lib/schemas/room";

export async function getRoom(id: string): Promise<Either<string, Room>> {
  try {
    const url = `${env.API_URL}/room/${id}`;
    const res = await fetch(url);
    if (!res.ok) {
      return left("Sala não encontrada");
    }
    const data = await res.json();
    return right(data);
  } catch (err) {
    return left(`Erro inesperado: ${err instanceof Error ? err.message : String(err)}`);
  }
}