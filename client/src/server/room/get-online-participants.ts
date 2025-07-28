'use server'

import { env } from "@/env";
import { Either, left, right } from "@/errors";



export async function getOnlineParticipants(id: string): Promise<Either<string, any[]>> {
  try {
    const url = `${env.API_URL}/room/${id}/online`;
    const res = await fetch(url);
    if (!res.ok) {
      const error = await res.text();
      return left(`Erro ao buscar participantes: ${error}`);
    }
    const data = await res.json();
    return right(data);
  } catch (err) {
    return left(`Erro inesperado: ${err instanceof Error ? err.message : String(err)}`);
  }
}