import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { decryptFields, encryptFields } from "@/lib/crypto/field-encryption";

// Template for any collection that stores sensitive fields: list the field
// names here, then encrypt on write / decrypt on read via the shared helpers
// so plaintext never crosses this module's boundary.
const SENSITIVE_FIELDS = ["phone", "address", "householdIncome"] as const;

export type Application = {
  id?: string;
  uid: string;
  phone?: string;
  address?: string;
  householdIncome?: string;
};

const collection = () => getAdminDb().collection("applications");

export async function createApplication(
  uid: string,
  data: Omit<Application, "id" | "uid">,
): Promise<string> {
  const encrypted = encryptFields(data, SENSITIVE_FIELDS);
  const doc = await collection().add({
    ...encrypted,
    uid,
    createdAt: FieldValue.serverTimestamp(),
  });
  return doc.id;
}

export async function getApplication(id: string): Promise<Application | null> {
  const snapshot = await collection().doc(id).get();
  if (!snapshot.exists) return null;

  const data = snapshot.data() as Omit<Application, "id">;
  return { id: snapshot.id, ...decryptFields(data, SENSITIVE_FIELDS) };
}

export async function listApplicationsForUser(
  uid: string,
): Promise<Application[]> {
  const snapshot = await collection().where("uid", "==", uid).get();
  return snapshot.docs.map((doc) => {
    const data = doc.data() as Omit<Application, "id">;
    return { id: doc.id, ...decryptFields(data, SENSITIVE_FIELDS) };
  });
}
