import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import type { UserSituation } from "@/lib/aid-programs";

const collection = () => getAdminDb().collection("userSituations");

export async function saveUserSituation(
  uid: string,
  situation: UserSituation,
): Promise<string> {
  // Check if user already has a situation document
  const snapshot = await collection().where("uid", "==", uid).limit(1).get();
  
  if (!snapshot.empty) {
    // Update existing document
    const doc = snapshot.docs[0];
    await doc.ref.update({
      ...situation,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return doc.id;
  }
  
  // Create new document
  const doc = await collection().add({
    uid,
    ...situation,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return doc.id;
}

export async function getUserSituation(
  uid: string,
): Promise<UserSituation | null> {
  const snapshot = await collection().where("uid", "==", uid).limit(1).get();
  
  if (snapshot.empty) {
    return null;
  }
  
  const data = snapshot.docs[0].data() as UserSituation;
  return data;
}

export async function deleteUserSituation(uid: string): Promise<void> {
  const snapshot = await collection().where("uid", "==", uid).limit(1).get();
  
  if (!snapshot.empty) {
    await snapshot.docs[0].ref.delete();
  }
}
