"use client";

import { BlockNoteEditor } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import { useEffect, useState } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import stringToColor from "@/lib/stringToColor";
import ChatToDocument from "./ChatToDocument";
import TranslateDocument from "./TranslateDocument";

type EditorProps = {
  doc: Y.Doc;
  provider: any;
};

function BlockNote({ doc, provider }: EditorProps) {
  const userInfo = useSelf((me) => me.info);

  const editor: BlockNoteEditor = useCreateBlockNote({
    collaboration: {
      provider,
      fragment: doc.getXmlFragment("document-store"),
      user: {
        name: userInfo.name,
        color: stringToColor(userInfo.email),
      },
    },
  });

  return (
    <div className="relative max-w-6xl mx-auto">
      <BlockNoteView className="min-h-screen" editor={editor} theme="light" />
    </div>
  );
}

// Collaborative text editor with simple rich text, live cursors, and live avatars
export function CollaborativeEditor() {
  const room = useRoom();
  const [doc, setDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<LiveblocksYjsProvider>();

  useEffect(() => {
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);
    setDoc(yDoc);
    setProvider(yProvider);

    return () => {
      yDoc?.destroy();
      yProvider?.destroy();
    };
  }, [room]);

  if (!doc || !provider) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 justify-end mb-10">
        <TranslateDocument doc={doc} />
        <ChatToDocument doc={doc} />
      </div>

      <BlockNote doc={doc} provider={provider} />
    </div>
  );
}