import { EnterRoom } from "@/components/room/enter-room";
import { Button } from "@/components/ui/button";
import { Cake } from "lucide-react";
import Link from "next/link";

export default function Home() {
	return (
		<div className="grid h-svh place-items-center">
			<main className="max-w-2xl p-4 border border-border rounded flex flex-col items-center gap-4">
				
				<h1 className="text-xl font-bold">Lie Room</h1>
				<h2 className="flex flex-row items-center gap-1 text-lg font-medium"><Cake /> is truth</h2>
				<Link href="create-room">
					<Button type="button" >Create a room</Button>
				</Link>
				<EnterRoom/>
			</main>
		</div>
	);
}
