import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";

export type ChatMessage = {
  role: 'assistant' | 'user';
  content: string;
};

export type ChatHistory = {
  id?: string;
  uid: string;
  messages: ChatMessage[];
  createdAt?: FieldValue;
  updatedAt?: FieldValue;
};

const collection = () => getAdminDb().collection("chatHistory");

export async function saveChatHistory(
  uid: string,
  messages: ChatMessage[],
): Promise<string> {
  // Check if user already has a chat history document
  const snapshot = await collection().where("uid", "==", uid).limit(1).get();
  
  if (!snapshot.empty) {
    // Update existing document
    const doc = snapshot.docs[0];
    await doc.ref.update({
      messages,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return doc.id;
  }
  
  // Create new document
  const doc = await collection().add({
    uid,
    messages,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return doc.id;
}

export async function getChatHistory(
  uid: string,
): Promise<ChatMessage[] | null> {
  const snapshot = await collection().where("uid", "==", uid).limit(1).get();
  
  if (snapshot.empty) {
    return null;
  }
  
  const data = snapshot.docs[0].data() as ChatHistory;
  return data.messages;
}

export async function deleteChatHistory(uid: string): Promise<void> {
  const snapshot = await collection().where("uid", "==", uid).limit(1).get();
  
  if (!snapshot.empty) {
    await snapshot.docs[0].ref.delete();
  }
}
