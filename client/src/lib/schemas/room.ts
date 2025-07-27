import { z } from "zod";

export const ParticipantRole = z.enum(["host", "player", "observer"]);

export type ParticipantRole = z.infer<typeof ParticipantRole>;

export const ParticipantSchema = z.object({
	id: z.string(),
	name: z.string(),
	role: ParticipantRole,
});

export const RoomSchema = z.object({
	id: z.string(),
	createdAt: z.date(),
	participants: z.array(ParticipantSchema),
});

export type Participant = z.infer<typeof ParticipantSchema>;
export type Room = z.infer<typeof RoomSchema>;
