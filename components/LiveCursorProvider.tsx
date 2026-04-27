"use client";
import { useMyPresence, useOthers } from "@liveblocks/react/suspense";
import { PointerEvent } from "react";
import { FollowPointer } from "./ui/following-pointer";

function LiveCursorProvider({ children }: { children: React.ReactNode }) {
  const [myPresence, updateMyPresence] = useMyPresence();
  const others = useOthers();

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    // Update from ClientX and ClientY to PageX and PageY for full page cursor tracking
    const cursor = { x: Math.floor(e.pageX), y: Math.floor(e.pageY) };
    updateMyPresence({ cursor });
  }

  // Set cursor to null on pointer leave
  function handlePointerLeave(e: PointerEvent<HTMLDivElement>) {
    updateMyPresence({ cursor: null });
  }

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className=""
    >
      {others
        .filter((other) => other.presence.cursor !== null)
        .map(({ connectionId, presence, info }) => (
          <FollowPointer
            info={info}
            title={`User: ${connectionId}`}
            key={connectionId}
            x={presence.cursor!.x}
            y={presence.cursor!.y}
          />
        ))}

      {children}
    </div>
  );
}

export default LiveCursorProvider;