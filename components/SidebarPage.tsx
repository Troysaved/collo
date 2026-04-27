"use client";

import { db } from "@/firebase";
import { doc } from "firebase/firestore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useState } from "react";

function SidebarPage({ href, id }: { href: string; id: string }) {
  const [data] = useDocumentData(doc(db, "documents", id));
  const pathname = usePathname();
  const active = pathname?.includes(id) ?? false;
  const [hover, setHover] = useState(false);

  if (!data) return null;

  const showSurface = active || hover;

  return (
    <Link
      href={href}
      className="flex items-center gap-1.5"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "4px 8px",
        borderRadius: 3,
        background: showSurface ? "var(--cream)" : "transparent",
        color: showSurface ? "var(--ink)" : "var(--ink-2)",
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        boxShadow: active ? "inset 2px 0 0 var(--accent)" : "none",
        transition: "background .12s, color .12s",
      }}
    >
      <span
        style={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {data?.title || "Untitled page"}
      </span>
    </Link>
  );
}

export default SidebarPage;
