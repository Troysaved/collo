"use client";

import { db } from "@/firebase";
import { doc } from "firebase/firestore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDocumentData } from "react-firebase-hooks/firestore";

function SidebarPage({ href, id }: { href: string; id: string }) {
  const [data] = useDocumentData(doc(db, "documents", id));
  const pathname = usePathname();
  const active = pathname?.includes(id) ?? false;

  if (!data) return null;

  return (
    <Link
      href={href}
      className="flex items-center gap-1.5"
      style={{
        padding: "4px 8px",
        borderRadius: 3,
        background: active ? "var(--cream)" : "transparent",
        color: active ? "var(--ink)" : "var(--ink-2)",
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        boxShadow: active ? "inset 2px 0 0 var(--accent)" : "none",
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
