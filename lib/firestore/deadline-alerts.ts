import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { aidPrograms } from "@/lib/aid-programs";

export type DeadlineAlert = {
  id?: string;
  uid: string;
  email: string;
  programId: string;
  programName: string;
  deadline: string;
  applicationUrl: string;
  enabled: boolean;
  alertWindowDays: number;
  lastSentAt?: string | null;
};

type DeadlineAlertDoc = Omit<DeadlineAlert, "id" | "lastSentAt"> & {
  lastSentAt?: Timestamp | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

const collection = () => getAdminDb().collection("deadlineAlerts");

function serialize(doc: FirebaseFirestore.QueryDocumentSnapshot): DeadlineAlert {
  const data = doc.data() as DeadlineAlertDoc;
  return {
    id: doc.id,
    uid: data.uid,
    email: data.email,
    programId: data.programId,
    programName: data.programName,
    deadline: data.deadline,
    applicationUrl: data.applicationUrl,
    enabled: data.enabled,
    alertWindowDays: data.alertWindowDays,
    lastSentAt: data.lastSentAt?.toDate().toISOString() ?? null,
  };
}

export async function listDeadlineAlertsForUser(uid: string): Promise<DeadlineAlert[]> {
  const snapshot = await collection().where("uid", "==", uid).get();
  return snapshot.docs.map(serialize);
}

export async function upsertDeadlineAlert({ uid, email, programId }: { uid: string; email: string; programId: string }) {
  const program = aidPrograms.find((item) => item.id === programId);
  if (!program) {
    throw new Error("Unknown aid program");
  }

  const snapshot = await collection()
    .where("uid", "==", uid)
    .where("programId", "==", programId)
    .limit(1)
    .get();

  const payload = {
    uid,
    email,
    programId,
    programName: program.name,
    deadline: program.deadline,
    applicationUrl: program.applicationUrl,
    enabled: true,
    alertWindowDays: program.deadlineUrgency === "high" ? 14 : 30,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (!snapshot.empty) {
    await snapshot.docs[0].ref.update(payload);
    return snapshot.docs[0].id;
  }

  const doc = await collection().add({
    ...payload,
    lastSentAt: null,
    createdAt: FieldValue.serverTimestamp(),
  });
  return doc.id;
}

export async function disableDeadlineAlert(uid: string, programId: string): Promise<void> {
  const snapshot = await collection()
    .where("uid", "==", uid)
    .where("programId", "==", programId)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    await snapshot.docs[0].ref.update({ enabled: false, updatedAt: FieldValue.serverTimestamp() });
  }
}

export async function listDueDeadlineAlerts(): Promise<DeadlineAlert[]> {
  const snapshot = await collection().where("enabled", "==", true).get();
  return snapshot.docs.map(serialize).filter((alert) => !alert.lastSentAt);
}

export async function markDeadlineAlertSent(id: string): Promise<void> {
  await collection().doc(id).update({
    lastSentAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}
