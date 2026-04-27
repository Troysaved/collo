"use client";

import { LiveList, LiveObject } from "@liveblocks/client";
import {
  ClientSideSuspense,
  RoomProvider as RoomProviderWrapper,
} from "@liveblocks/react/suspense";
import LiveCursorProvider from "./LiveCursorProvider";
import LoadingSpinner from "./LoadingSpinner";

function RoomProvider({
  roomId,
  children,
}: {
  roomId: string;
  children: React.ReactNode;
}) {
  return (
    <RoomProviderWrapper
      id={roomId}
      initialPresence={{
        cursor: null,
      }}
      initialStorage={{
        people: new LiveList([new LiveObject({ name: "Marie", age: 30 })]),
      }}
    >
      <ClientSideSuspense fallback={<LoadingSpinner />}>
        <LiveCursorProvider>{children}</LiveCursorProvider>
      </ClientSideSuspense>
    </RoomProviderWrapper>
  );
}

export default RoomProvider;