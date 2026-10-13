import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import type { AidProgram } from "@/lib/aid-programs";

export type PinnedPrograms = {
  id?: string;
  uid: string;
  programIds: string[];
  /** Snapshots of the pinned programs so they can render without re-ranking. */
  programs?: AidProgram[];
  createdAt?: FieldValue;
  updatedAt?: FieldValue;
};

const collection = () => getAdminDb().collection("pinnedPrograms");

export async function savePinnedPrograms(
  uid: string,
  programIds: string[],
  programs: AidProgram[] = [],
): Promise<string> {
  const snapshot = await collection().where("uid", "==", uid).limit(1).get();

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    await doc.ref.update({
      programIds,
      programs,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return doc.id;
  }

  const doc = await collection().add({
    uid,
    programIds,
    programs,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return doc.id;
}

export async function getPinnedPrograms(
  uid: string,
): Promise<{ programIds: string[]; programs: AidProgram[] }> {
  const snapshot = await collection().where("uid", "==", uid).limit(1).get();

  if (snapshot.empty) {
    return { programIds: [], programs: [] };
  }

  const data = snapshot.docs[0].data() as PinnedPrograms;
  return { programIds: data.programIds || [], programs: data.programs || [] };
}

export async function deletePinnedPrograms(uid: string): Promise<void> {
  const snapshot = await collection().where("uid", "==", uid).limit(1).get();
  
  if (!snapshot.empty) {
    await snapshot.docs[0].ref.delete();
  }
}
