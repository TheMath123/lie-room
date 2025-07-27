import { EnterRoom } from "@/components/room/enter-room";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
	return (
		<div className="grid h-svh place-items-center">
			<main className="max-w-2xl w-full p-4">
				<Link href="create-room">
					<Button type="button">Create a room</Button>
				</Link>
				<EnterRoom/>
			</main>
		</div>
	);
}
