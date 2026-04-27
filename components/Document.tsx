"use client";

import { CollaborativeEditor } from "./Editor";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronRight, BookOpen, Plus } from "lucide-react";
import Avatars from "./Avatars";
import InviteUser from "./InviteUser";
import ManageUsers from "./ManageUsers";
import useOwner from "@/lib/useOwner";
import DeleteDocument from "./DeleteDocument";
import { useOthers, useSelf } from "@liveblocks/react/suspense";

function Document({ id }: { id: string }) {
  const [data] = useDocumentData(doc(db, "documents", id));
  const isOwner = useOwner();
  const [input, setInput] = useState("");
  const [isUpdating, startTransition] = useTransition();
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data?.title) setInput(data.title);
  }, [data?.title]);

  const updateTitle = (e?: FormEvent) => {
    e?.preventDefault();
    const next = input.trim();
    if (!next || next === data?.title) return;
    startTransition(async () => {
      await updateDoc(doc(db, "documents", id), { title: next });
    });
  };

  return (
    <div
      className="grid h-screen"
      style={{
        gridTemplateColumns: "minmax(0, 1fr) 320px",
        background: "var(--paper)",
      }}
    >
      {/* page column */}
      <section
        className="flex flex-col overflow-hidden"
        style={{ background: "var(--cream)" }}
      >
        {/* editorial toolbar */}
        <div
          className="flex items-center"
          style={{
            padding: "12px 28px",
            borderBottom: "1px solid var(--rule)",
            gap: 14,
            fontSize: 12.5,
            color: "var(--ink-3)",
            background: "var(--cream)",
          }}
        >
          <div className="flex items-center gap-1.5">
            <BookOpen size={12} />
            <Link href="/" style={{ color: "var(--ink-3)", textDecoration: "none" }}>
              All pages
            </Link>
            <ChevronRight size={10} />
            <span style={{ color: "var(--ink-2)" }}>
              {data?.title || "Untitled page"}
            </span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: "var(--serif)", fontStyle: "italic" }}>
              reading now —
            </span>
            <PresenceStack />
          </div>
          <ManageUsers />
          {isOwner && (
            <>
              <InviteUser />
              <DeleteDocument />
            </>
          )}
        </div>

        {/* page surface */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "52px 72px 80px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div className="smallcaps" style={{ marginBottom: 12 }}>
              A page · in progress
            </div>

            <form onSubmit={updateTitle} style={{ marginBottom: 24 }}>
              <input
                ref={titleRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onBlur={() => updateTitle()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    titleRef.current?.blur();
                  }
                }}
                placeholder="Untitled page"
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontFamily: "var(--serif)",
                  fontWeight: 400,
                  fontSize: 54,
                  lineHeight: 1.0,
                  letterSpacing: -1.2,
                  color: "var(--ink)",
                  padding: 0,
                }}
              />
              {isUpdating && (
                <div
                  className="smallcaps"
                  style={{ marginTop: 8, color: "var(--ink-4)" }}
                >
                  saving…
                </div>
              )}
            </form>

            <div
              style={{
                display: "flex",
                gap: 16,
                fontSize: 12.5,
                color: "var(--ink-3)",
                marginBottom: 28,
                fontFamily: "var(--sans)",
              }}
            >
              <span>✢ shared page</span>
              <span>✢ live presence</span>
              <span>✢ written together</span>
            </div>

            <hr
              style={{
                border: "none",
                borderTop: "1px solid var(--rule)",
                margin: "0 0 28px",
              }}
            />

            {/* the actual editor */}
            <div className="bn-paper">
              <CollaborativeEditor />
            </div>
          </div>
        </div>
      </section>

      {/* right margin column */}
      <aside
        className="overflow-y-auto"
        style={{
          background: "var(--margin)",
          borderLeft: "1px solid var(--rule)",
          padding: "52px 24px",
        }}
      >
        <div className="smallcaps" style={{ marginBottom: 14 }}>
          Margin notes
        </div>

        <MarginEmpty />

        <div style={{ marginTop: 24 }}>
          <div className="smallcaps" style={{ marginBottom: 10 }}>
            Quiet presence
          </div>
          <PresenceList />
        </div>

        <div
          style={{
            marginTop: 40,
            padding: "14px 0",
            borderTop: "1px dashed var(--rule)",
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 12,
            color: "var(--ink-3)",
            lineHeight: 1.45,
          }}
        >
          <div style={{ color: "var(--accent)", marginBottom: 2 }}>¶</div>
          This page is bound by you and the friends you&apos;ve invited.
          Anything written here lives only between you.
        </div>
      </aside>
    </div>
  );
}

function MarginEmpty() {
  return (
    <div
      style={{
        background: "var(--cream)",
        border: "1px solid var(--rule)",
        borderRadius: 2,
        padding: "16px 14px",
        display: "flex",
        gap: 14,
        marginBottom: 12,
      }}
    >
      <div style={{ width: 3, background: "var(--accent)", flexShrink: 0 }} />
      <div>
        <div className="smallcaps" style={{ marginBottom: 6 }}>
          how the margin works
        </div>
        <div
          style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 14,
            lineHeight: 1.45,
            color: "var(--ink-2)",
          }}
        >
          Hover any block in the page to leave a reaction or anchor a note
          here. Your friends&apos; replies appear together, threaded.
        </div>
      </div>
    </div>
  );
}

function PresenceStack() {
  const others = useOthers();
  const self = useSelf();
  const all = self ? [self, ...others] : others;
  if (all.length === 0) return null;

  return (
    <div className="flex" style={{ marginRight: 0 }}>
      {all.slice(0, 5).map((p, i) => {
        const name: string = p?.info?.name || "?";
        const initial = name.charAt(0).toUpperCase();
        const hue = hashHue(p?.info?.email || name);
        return (
          <div
            key={p.connectionId ?? i}
            title={p.info?.name}
            style={{
              marginLeft: i === 0 ? 0 : -7,
              width: 22,
              height: 22,
              borderRadius: 11,
              background: `oklch(0.68 0.12 ${hue})`,
              color: `oklch(0.22 0.06 ${hue})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 600,
              boxShadow: "0 0 0 2px var(--cream)",
              fontFamily: "var(--sans)",
            }}
          >
            {initial}
          </div>
        );
      })}
    </div>
  );
}

function PresenceList() {
  const others = useOthers();
  const self = useSelf();
  const all = self ? [self, ...others] : others;
  if (all.length === 0) {
    return (
      <div
        style={{
          fontFamily: "var(--serif)",
          fontStyle: "italic",
          fontSize: 13,
          color: "var(--ink-3)",
        }}
      >
        It&apos;s just you on this page right now.
      </div>
    );
  }
  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      {all.map((p, i) => {
        const name = p.info?.name || "Someone";
        const hue = hashHue(p.info?.email || name);
        const isSelf = p.id === self?.id;
        return (
          <div key={p.connectionId ?? i} className="flex items-center" style={{ gap: 10 }}>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  background: `oklch(0.68 0.12 ${hue})`,
                  color: `oklch(0.22 0.06 ${hue})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 600,
                  fontFamily: "var(--sans)",
                }}
              >
                {name.charAt(0).toUpperCase()}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: -1,
                  right: -1,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: `oklch(0.58 0.12 ${hue})`,
                  boxShadow: "0 0 0 1.5px var(--margin)",
                }}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: "var(--ink)",
                }}
              >
                {isSelf ? `${name} · you` : name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--ink-3)",
                  fontFamily: "var(--serif)",
                  fontStyle: "italic",
                }}
              >
                reading now
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function hashHue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

export default Document;
