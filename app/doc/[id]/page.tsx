"use client";

import Document from "@/components/Document";
import { useErrorListener } from "@liveblocks/react/suspense";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function DocumentPage({ params: { id } }: { params: { id: string } }) {
  const router = useRouter();

  useErrorListener((error) => {
    switch (error.code) {
      case -1:
        // Authentication error
        router.push("/");
        toast.error("You are not authorized to enter this room");

        break;

      case 4001:
        // Could not connect because you don't have access to this room
        break;

      case 4005:
        // Could not connect because room was full
        break;

      case 4006:
        // The room ID has changed, get the new room ID (use this for redirecting)
        const newRoomId = error.message;
        router.push(`/doc/${newRoomId}`);
        break;

      default:
        // Unexpected error
        break;
    }
  });

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <Document id={id} />
    </div>
  );
}

export default DocumentPage;