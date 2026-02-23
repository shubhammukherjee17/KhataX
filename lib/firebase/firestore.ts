import { db } from "./config";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  QueryConstraint,
  DocumentData,
  WithFieldValue
} from "firebase/firestore";

// Generic CRUD operations

export const getDocument = async <T = DocumentData>(path: string, id: string): Promise<T | null> => {
  const docRef = doc(db, path, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  return null;
};

export const getCollection = async <T = DocumentData>(
  path: string, 
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  const q = query(collection(db, path), ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
};

export const addDocument = async <T extends WithFieldValue<DocumentData>>(
  path: string, 
  data: T
): Promise<string> => {
  const docRef = await addDoc(collection(db, path), data);
  return docRef.id;
};

export const setDocument = async <T extends WithFieldValue<DocumentData>>(
  path: string, 
  id: string, 
  data: T
): Promise<void> => {
  const docRef = doc(db, path, id);
  await setDoc(docRef, data, { merge: true });
};

export const updateDocument = async (
  path: string, 
  id: string, 
  data: Partial<DocumentData>
): Promise<void> => {
  const docRef = doc(db, path, id);
  await updateDoc(docRef, data);
};

export const deleteDocument = async (path: string, id: string): Promise<void> => {
  const docRef = doc(db, path, id);
  await deleteDoc(docRef);
};
