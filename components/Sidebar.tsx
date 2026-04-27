"use client";

import { useUser, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  collectionGroup,
  DocumentData,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, Plus, BookOpen, MenuIcon } from "lucide-react";
import { createNewDocument } from "@/actions";
import SidebarPage from "./SidebarPage";

interface RoomDocument extends DocumentData {
  createdAt: string;
  role: "owner" | "editor";
  roomId: string;
  userId: string;
}

function Sidebar() {
  const { user } = useUser();
  const [grouped, setGrouped] = useState<{ owner: RoomDocument[]; editor: RoomDocument[] }>({
    owner: [],
    editor: [],
  });
  const [data] = useCollection(
    user &&
      query(
        collectionGroup(db, "rooms"),
        where("userId", "==", user?.emailAddresses[0].toString()),
      ),
  );

  useEffect(() => {
    if (!data) return;
    const next = data.docs.reduce<{ owner: RoomDocument[]; editor: RoomDocument[] }>(
      (acc, curr) => {
        const r = curr.data() as RoomDocument;
        const entry = { id: curr.id, ...r };
        if (r.role === "owner") acc.owner.push(entry);
        else acc.editor.push(entry);
        return acc;
      },
      { owner: [], editor: [] },
    );
    setGrouped(next);
  }, [data]);

  return (
    <>
      {/* mobile: drawer trigger fixed top-left */}
      <div className="md:hidden fixed top-3 left-3 z-40">
        <Drawer direction="left">
          <DrawerTrigger
            className="flex items-center justify-center rounded-sm border"
            style={{ background: "var(--cream)", borderColor: "var(--rule)", width: 40, height: 40, color: "var(--ink-2)" }}
          >
            <MenuIcon size={20} />
          </DrawerTrigger>
          <DrawerContent
            className="h-full w-[280px] fixed z-50 overflow-y-auto rounded-none p-0"
            style={{ background: "var(--margin)", borderRight: "1px solid var(--rule)" }}
          >
            <DrawerHeader className="sr-only">
              <DrawerTitle>Menu</DrawerTitle>
            </DrawerHeader>
            <SidebarBody grouped={grouped} />
            <DrawerFooter className="hidden">
              <DrawerClose />
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      <aside
        className="hidden md:block h-screen sticky top-0"
        style={{
          background: "var(--margin)",
          borderRight: "1px solid var(--rule)",
          fontFamily: "var(--sans)",
        }}
      >
        <SidebarBody grouped={grouped} />
      </aside>
    </>
  );
}

function SidebarBody({ grouped }: { grouped: { owner: RoomDocument[]; editor: RoomDocument[] } }) {
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [openFolders, setOpenFolders] = useState<{ owner: boolean; editor: boolean }>({
    owner: true,
    editor: true,
  });
  const toggle = (k: "owner" | "editor") =>
    setOpenFolders((s) => ({ ...s, [k]: !s[k] }));

  const handleNew = () =>
    startTransition(async () => {
      const { docId } = await createNewDocument();
      router.push(`/doc/${docId}`);
    });

  const friendCount = grouped.owner.length + grouped.editor.length;

  return (
    <div className="h-full overflow-y-auto scrollbar-hide" style={{ padding: "28px 18px" }}>
      {/* workspace header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="flex items-center gap-3 flex-1 min-w-0"
          style={{ textDecoration: "none", color: "inherit" }}
          title="Back to your study"
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: 28,
              height: 28,
              background: "var(--accent)",
              color: "var(--cream)",
              borderRadius: 2,
              fontFamily: "var(--serif)",
              fontSize: 18,
              fontStyle: "italic",
              flexShrink: 0,
            }}
          >
            V
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ fontFamily: "var(--serif)", fontSize: 16, fontStyle: "italic" }}>
              ViaVienna
            </div>
            <div className="smallcaps" style={{ fontSize: 10 }}>
              {friendCount === 0 ? "your study" : `${friendCount} ${friendCount === 1 ? "page" : "pages"}`}
            </div>
          </div>
        </Link>
        <SignedIn>
          <UserButton appearance={{ elements: { avatarBox: { width: 24, height: 24 } } }} />
        </SignedIn>
      </div>

      {/* quick items */}
      <SignedIn>
        <div className="flex flex-col gap-0.5 mb-5">
          <SideItem
            icon={<BookOpen size={12} />}
            label="All pages"
            active={pathname === "/"}
            href="/"
          />
        </div>

        <Folder
          name="My pages"
          open={openFolders.owner}
          onToggle={() => toggle("owner")}
          empty={grouped.owner.length === 0 ? "Begin a new page below…" : null}
        >
          {grouped.owner.map((d) => (
            <SidebarPage key={d.id} id={d.id} href={`/doc/${d.id}`} />
          ))}
        </Folder>

        {grouped.editor.length > 0 && (
          <>
            <div style={{ height: 10 }} />
            <Folder
              name="Shared with me"
              open={openFolders.editor}
              onToggle={() => toggle("editor")}
            >
              {grouped.editor.map((d) => (
                <SidebarPage key={d.id} id={d.id} href={`/doc/${d.id}`} />
              ))}
            </Folder>
          </>
        )}

        <button
          onClick={handleNew}
          disabled={isPending}
          className="flex items-center gap-1.5 w-full"
          style={{
            marginTop: 20,
            paddingTop: 14,
            borderTop: "1px solid var(--rule)",
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 13,
            color: isPending ? "var(--ink-4)" : "var(--ink-3)",
            background: "transparent",
            border: "none",
            borderTopColor: "var(--rule)",
            borderTopWidth: 1,
            borderTopStyle: "solid",
            cursor: isPending ? "wait" : "pointer",
            textAlign: "left",
          }}
          onMouseEnter={(e) => !isPending && (e.currentTarget.style.color = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-3)")}
        >
          <Plus size={12} />
          {isPending ? "Beginning…" : "Begin a new page"}
        </button>
      </SignedIn>

      <SignedOut>
        <div
          style={{
            marginTop: 12,
            padding: "20px 16px",
            background: "var(--cream)",
            border: "1px solid var(--rule)",
            borderRadius: 2,
          }}
        >
          <div
            style={{
              fontFamily: "var(--serif)",
              fontStyle: "italic",
              fontSize: 18,
              lineHeight: 1.25,
              color: "var(--ink-2)",
              marginBottom: 6,
            }}
          >
            A shared margin
            <br />
            for friends.
          </div>
          <p
            style={{
              fontFamily: "var(--body)",
              fontSize: 13,
              color: "var(--ink-3)",
              lineHeight: 1.45,
              marginBottom: 14,
            }}
          >
            Sign in to read your pages and turn one open.
          </p>
          <SignInButton mode="modal">
            <button
              className="w-full text-left"
              style={{
                background: "var(--ink)",
                color: "var(--cream)",
                padding: "8px 12px",
                borderRadius: 2,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
              }}
            >
              Sign in
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      {user && (
        <div
          style={{
            marginTop: 28,
            paddingTop: 16,
            borderTop: "1px solid var(--rule)",
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 12,
            color: "var(--ink-3)",
            lineHeight: 1.45,
          }}
        >
          Signed in as <span style={{ color: "var(--ink-2)" }}>{user.firstName ?? user.emailAddresses[0]?.emailAddress}</span>.
        </div>
      )}
    </div>
  );
}

function SideItem({
  icon,
  label,
  active = false,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  href?: string;
}) {
  const inner = (
    <div
      className="flex items-center gap-2.5"
      style={{
        padding: "6px 8px",
        borderRadius: 3,
        cursor: "pointer",
        background: active ? "var(--cream)" : "transparent",
        color: active ? "var(--ink)" : "var(--ink-2)",
        fontSize: 13,
      }}
    >
      <span style={{ color: "var(--ink-3)", display: "flex" }}>{icon}</span>
      <span className="flex-1">{label}</span>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function Folder({
  name,
  open,
  onToggle,
  children,
  empty,
}: {
  name: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  empty?: string | null;
}) {
  return (
    <div>
      <div
        onClick={onToggle}
        className="flex items-center gap-1.5 cursor-pointer select-none"
        style={{
          padding: "4px 4px",
          color: "var(--ink-2)",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 1.2,
          fontWeight: 500,
        }}
      >
        <span
          style={{
            transform: open ? "rotate(90deg)" : "none",
            transition: "transform .12s",
            display: "flex",
            color: "var(--ink-3)",
          }}
        >
          <ChevronRight size={10} />
        </span>
        <span>{name}</span>
      </div>
      {open && (
        <div className="flex flex-col gap-0.5 mt-1" style={{ paddingLeft: 14 }}>
          {empty ? (
            <div
              style={{
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontSize: 12,
                color: "var(--ink-4)",
                padding: "4px 6px",
              }}
            >
              {empty}
            </div>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
}

export default Sidebar;
