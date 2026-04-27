"use client";

import { useUser, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  collectionGroup,
  DocumentData,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useEffect, useMemo, useState, useTransition } from "react";
import { createNewDocument } from "@/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RoomDocument extends DocumentData {
  createdAt: any;
  role: "owner" | "editor";
  roomId: string;
  userId: string;
}

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [data] = useCollection(
    user &&
      query(
        collectionGroup(db, "rooms"),
        where("userId", "==", user?.emailAddresses[0].toString()),
      ),
  );

  const rooms = useMemo<RoomDocument[]>(
    () => (data?.docs ?? []).map((d) => ({ id: d.id, ...(d.data() as RoomDocument) })),
    [data],
  );

  const handleNew = () =>
    startTransition(async () => {
      const { docId } = await createNewDocument();
      router.push(`/doc/${docId}`);
    });

  return (
    <main
      className="grid h-screen"
      style={{
        gridTemplateColumns: "minmax(0, 1fr) 320px",
        background: "var(--paper)",
      }}
    >
      {/* main column */}
      <section
        className="overflow-y-auto"
        style={{ background: "var(--cream)", padding: "40px 52px 64px" }}
      >
        <div
          style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 13,
            color: "var(--ink-3)",
            marginBottom: 6,
          }}
        >
          {todayLine()}
        </div>

        <h1
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 400,
            fontSize: 42,
            lineHeight: 1.05,
            margin: "0 0 18px",
            letterSpacing: -0.6,
          }}
        >
          {greetingPrefix()},{" "}
          <em style={{ color: "var(--accent)" }}>
            <SignedIn>{user?.firstName ?? "friend"}.</SignedIn>
            <SignedOut>welcome.</SignedOut>
          </em>
        </h1>

        <SignedIn>
          <p
            style={{
              color: "var(--ink-2)",
              fontSize: 15,
              maxWidth: 520,
              marginBottom: 28,
            }}
          >
            {rooms.length === 0
              ? "Your study is quiet. Begin a page and invite a friend to read alongside you."
              : `${rooms.length} ${rooms.length === 1 ? "page is" : "pages are"} open on your desk today.`}{" "}
            <span
              style={{
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                color: "var(--ink-3)",
              }}
            >
              Begin where you left off. →
            </span>
          </p>
        </SignedIn>

        <SignedOut>
          <p
            style={{
              color: "var(--ink-2)",
              fontSize: 15,
              maxWidth: 540,
              marginBottom: 28,
              fontFamily: "var(--body)",
            }}
          >
            ViaVienna is a quiet, paper-toned space for people who want to write
            things together — trips, plans, lists, and the small notes that keep
            them going.
          </p>
          <SignInButton mode="modal">
            <button
              style={{
                background: "var(--ink)",
                color: "var(--cream)",
                padding: "10px 18px",
                borderRadius: 2,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
                fontFamily: "var(--sans)",
              }}
            >
              Sign in to begin
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <div className="smallcaps" style={{ marginBottom: 14 }}>
            Reading list · your pages
          </div>

          {rooms.length === 0 ? (
            <EmptyDesk onNew={handleNew} pending={isPending} />
          ) : (
            <div
              className="grid"
              style={{
                gridTemplateColumns: "1fr 1fr",
                gap: 1,
                background: "var(--rule)",
                border: "1px solid var(--rule)",
                borderRadius: 2,
              }}
            >
              {rooms.map((r) => (
                <RoomCard key={r.roomId} room={r} />
              ))}
              <NewCard onNew={handleNew} pending={isPending} />
            </div>
          )}
        </SignedIn>
      </section>

      {/* right margin */}
      <aside
        className="overflow-y-auto"
        style={{
          background: "var(--margin)",
          borderLeft: "1px solid var(--rule)",
          padding: "40px 28px",
        }}
      >
        <div className="smallcaps" style={{ marginBottom: 14 }}>
          Marginalia · today
        </div>

        <SignedIn>
          {rooms.length === 0 ? (
            <p
              style={{
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontSize: 14,
                color: "var(--ink-3)",
                lineHeight: 1.5,
              }}
            >
              The margin is empty. Once you and your friends start writing,
              this is where their notes will gather.
            </p>
          ) : (
            <div className="flex flex-col" style={{ gap: 22 }}>
              {rooms.slice(0, 5).map((r) => (
                <ActivityRow key={r.roomId} room={r} />
              ))}
            </div>
          )}
        </SignedIn>

        <SignedOut>
          <p
            style={{
              fontFamily: "var(--serif)",
              fontStyle: "italic",
              fontSize: 14,
              color: "var(--ink-3)",
              lineHeight: 1.5,
            }}
          >
            "Everything on every page is a draft. If it&apos;s wrong, fix it.
            If it&apos;s missing, add it."
          </p>
        </SignedOut>

        <div
          style={{
            marginTop: 40,
            paddingTop: 14,
            borderTop: "1px dashed var(--rule)",
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 12,
            color: "var(--ink-3)",
            lineHeight: 1.45,
          }}
        >
          <div style={{ color: "var(--accent)", marginBottom: 2 }}>¶</div>
          {isLoaded && user
            ? `Welcome back to ViaVienna, ${user.firstName ?? "friend"}.`
            : "ViaVienna · a shared margin for friends."}
        </div>
      </aside>
    </main>
  );
}

function RoomCard({ room }: { room: RoomDocument }) {
  const [docData] = useDocSnap(room.roomId);
  const title = docData?.title || "Untitled page";
  const sub = room.role === "owner" ? "your page" : "shared with you";

  return (
    <Link
      href={`/doc/${room.roomId}`}
      className="block"
      style={{
        background: "var(--cream)",
        padding: "22px 24px",
        minHeight: 150,
        cursor: "pointer",
        transition: "background .12s",
        textDecoration: "none",
        color: "inherit",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#fffbf0")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--cream)")}
    >
      <div className="smallcaps">{sub}</div>
      <div
        style={{
          fontFamily: "var(--serif)",
          fontSize: 24,
          lineHeight: 1.15,
          margin: "8px 0 12px",
          letterSpacing: -0.3,
          color: "var(--ink)",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--ink-3)",
          fontStyle: "italic",
          fontFamily: "var(--serif)",
        }}
      >
        Turn the page →
      </div>
    </Link>
  );
}

function NewCard({ onNew, pending }: { onNew: () => void; pending: boolean }) {
  return (
    <button
      onClick={onNew}
      disabled={pending}
      style={{
        background: "var(--cream)",
        padding: "22px 24px",
        minHeight: 150,
        cursor: pending ? "wait" : "pointer",
        textAlign: "left",
        border: "none",
        borderRadius: 0,
        color: "inherit",
        fontFamily: "var(--body)",
        transition: "background .12s",
      }}
      onMouseEnter={(e) =>
        !pending && (e.currentTarget.style.background = "#fffbf0")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--cream)")}
    >
      <div className="smallcaps">{pending ? "binding…" : "new"}</div>
      <div
        style={{
          fontFamily: "var(--serif)",
          fontStyle: "italic",
          fontSize: 24,
          lineHeight: 1.15,
          margin: "8px 0 12px",
          letterSpacing: -0.3,
          color: "var(--accent)",
        }}
      >
        + Begin a new page
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--ink-3)",
          fontStyle: "italic",
          fontFamily: "var(--serif)",
        }}
      >
        A blank chapter, ready for friends.
      </div>
    </button>
  );
}

function EmptyDesk({ onNew, pending }: { onNew: () => void; pending: boolean }) {
  return (
    <div
      style={{
        border: "1px solid var(--rule)",
        background: "var(--cream)",
        padding: "32px 28px",
        borderRadius: 2,
        display: "flex",
        gap: 20,
      }}
    >
      <div style={{ width: 4, background: "var(--accent)", flexShrink: 0 }} />
      <div>
        <div className="smallcaps" style={{ marginBottom: 8 }}>
          A note from the margin
        </div>
        <div
          style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 17,
            lineHeight: 1.4,
            color: "var(--ink-2)",
            marginBottom: 16,
          }}
        >
          Your desk is bare. Lay down a first page — anything: an itinerary,
          a packing list, a rambling note about a trip you might not take.
        </div>
        <button
          onClick={onNew}
          disabled={pending}
          style={{
            background: "var(--ink)",
            color: "var(--cream)",
            padding: "8px 14px",
            borderRadius: 2,
            fontSize: 13,
            fontWeight: 500,
            cursor: pending ? "wait" : "pointer",
            border: "none",
            fontFamily: "var(--sans)",
          }}
        >
          {pending ? "Binding the page…" : "Begin a new page"}
        </button>
      </div>
    </div>
  );
}

function ActivityRow({ room }: { room: RoomDocument }) {
  const [docData] = useDocSnap(room.roomId);
  const title = docData?.title || "Untitled page";
  const verb = room.role === "owner" ? "you opened" : "shared with you";
  const when = relativeWhen(room.createdAt);

  return (
    <Link href={`/doc/${room.roomId}`} className="flex gap-2.5" style={{ textDecoration: "none" }}>
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          background: "oklch(0.68 0.12 18)",
          color: "oklch(0.22 0.06 18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {(title?.[0] ?? "•").toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: "var(--ink-2)" }}>
          <span style={{ fontWeight: 500, color: "var(--ink)" }}>{title}</span>{" "}
          <span
            style={{
              fontFamily: "var(--serif)",
              fontStyle: "italic",
              color: "var(--ink-3)",
            }}
          >
            — {verb}
          </span>
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--ink-4)",
            marginTop: 4,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {when}
        </div>
      </div>
    </Link>
  );
}

function useDocSnap(id: string) {
  const [snap, setSnap] = useState<DocumentData | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    import("firebase/firestore").then(({ doc, onSnapshot }) => {
      const ref = doc(db, "documents", id);
      const unsub = onSnapshot(ref, (s) => !cancelled && setSnap(s.data()));
      return () => unsub();
    });
    return () => {
      cancelled = true;
    };
  }, [id]);
  return [snap] as const;
}

function todayLine(): string {
  const d = new Date();
  const day = d.toLocaleDateString(undefined, { weekday: "long" });
  const month = d.toLocaleDateString(undefined, { month: "long" });
  const dom = d.getDate();
  const ord =
    dom % 10 === 1 && dom !== 11
      ? "first"
      : dom % 10 === 2 && dom !== 12
        ? "second"
        : dom % 10 === 3 && dom !== 13
          ? "third"
          : `${dom}th`;
  return `${day} · ${month} ${ord}`;
}

function greetingPrefix(): string {
  const h = new Date().getHours();
  if (h < 5) return "Late, but welcome";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "A quiet hour";
}

function relativeWhen(ts: any): string {
  if (!ts) return "just now";
  const d =
    typeof ts?.toDate === "function"
      ? ts.toDate()
      : ts instanceof Date
        ? ts
        : new Date(ts);
  const ms = Date.now() - d.getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const days = Math.round(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
