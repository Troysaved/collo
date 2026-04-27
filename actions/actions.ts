"use server";

import { adminDb } from "@/firebase-admin";
import liveblocks from "@/lib/liveblocks";
import { auth } from "@clerk/nextjs/server";

export async function createNewDocument() {
  auth().protect();

  const { sessionClaims } = auth();

  const docCollectionRef = adminDb.collection("documents");
  const docRef = await docCollectionRef.add({ title: "New Doc" });

  await adminDb
    .collection("users")
    .doc(sessionClaims?.email!)
    .collection("rooms")
    .doc(docRef.id)
    .set({
      userId: sessionClaims?.email!,
      role: "owner",
      createdAt: new Date(),
      roomId: docRef.id,
    });

  return { docId: docRef.id };
}

export async function inviteUserToDocument(roomId: string, email: string) {
  auth().protect();

  console.log("inviteUserToDocument", roomId, email);

  try {
    await adminDb
      .collection("users")
      .doc(email)
      .collection("rooms")
      .doc(roomId)
      .set({
        userId: email,
        role: "editor",
        createdAt: new Date(),
        roomId,
      });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export async function removeUserFromDocument(roomId: string, email: string) {
  auth().protect();

  console.log("removeUserFromDocument", roomId, email);

  try {
    await adminDb
      .collection("users")
      .doc(email)
      .collection("rooms")
      .doc(roomId)
      .delete();

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export async function deleteDocument(roomId: string) {
  auth().protect();

  // 1. Delete the document itself — this is the source of truth.
  try {
    await adminDb.collection("documents").doc(roomId).delete();
  } catch (error: any) {
    console.error("deleteDocument: documents delete failed", error);
    return {
      success: false,
      error: error?.message ?? "could not delete document",
    };
  }

  // 2. Best-effort: clean up per-user room references.
  //    This needs a collection-group index on `rooms.roomId`. If it isn't
  //    set up yet, leave the orphans (the UI hides them once the parent doc
  //    is gone) and let delete still succeed.
  try {
    const q = await adminDb
      .collectionGroup("rooms")
      .where("roomId", "==", roomId)
      .get();
    if (!q.empty) {
      const batch = adminDb.batch();
      q.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (error: any) {
    const code = error?.code;
    if (code === 9) {
      console.warn(
        "deleteDocument: skipping per-user cleanup — Firestore needs a collection-group index on `rooms.roomId`.",
        "Create the index via the URL in the Firestore error, or in the Firebase Console:",
        "Firestore > Indexes > Single field > add exemption for collection `rooms`, field `roomId`, collection group scope.",
        "Full error:",
        error?.details ?? error?.message,
      );
    } else {
      console.error("deleteDocument: per-user cleanup failed", error);
    }
  }

  // 3. Best-effort: delete the Liveblocks room. Lazily-created rooms 404
  //    if the doc was never opened — that's fine.
  try {
    await liveblocks.deleteRoom(roomId);
  } catch (error: any) {
    const status = error?.status ?? error?.cause?.status;
    if (status && status !== 404) {
      console.error("deleteDocument: liveblocks.deleteRoom failed", error);
    }
  }

  return { success: true };
}