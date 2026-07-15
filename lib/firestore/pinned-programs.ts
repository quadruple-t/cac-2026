import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";

export type PinnedPrograms = {
  id?: string;
  uid: string;
  programIds: string[];
  createdAt?: FieldValue;
  updatedAt?: FieldValue;
};

const collection = () => getAdminDb().collection("pinnedPrograms");

export async function savePinnedPrograms(
  uid: string,
  programIds: string[],
): Promise<string> {
  const snapshot = await collection().where("uid", "==", uid).limit(1).get();
  
  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    await doc.ref.update({
      programIds,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return doc.id;
  }
  
  const doc = await collection().add({
    uid,
    programIds,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return doc.id;
}

export async function getPinnedPrograms(
  uid: string,
): Promise<string[]> {
  const snapshot = await collection().where("uid", "==", uid).limit(1).get();
  
  if (snapshot.empty) {
    return [];
  }
  
  const data = snapshot.docs[0].data() as PinnedPrograms;
  return data.programIds || [];
}

export async function deletePinnedPrograms(uid: string): Promise<void> {
  const snapshot = await collection().where("uid", "==", uid).limit(1).get();
  
  if (!snapshot.empty) {
    await snapshot.docs[0].ref.delete();
  }
}
