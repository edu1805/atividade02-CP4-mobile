import { db, auth } from "./firebaseConfig";
import {collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, QueryDocumentSnapshot, DocumentData,} from "firebase/firestore";

// Definição da interface da tarefa
export interface Task {
  id?: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Função auxiliar para pegar a coleção de tarefas do usuário autenticado
const getUserTasksCollection = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");
  return collection(db, "users", user.uid, "tasks");
};

// CREATE
export const createTask = async (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
  const tasksRef = getUserTasksCollection();
  await addDoc(tasksRef, {
    ...task,
    completed: task.completed ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// READ
export const getTasks = async (): Promise<Task[]> => {
  const tasksRef = getUserTasksCollection();
  const snapshot = await getDocs(tasksRef);
  return snapshot.docs.map(
    (doc: QueryDocumentSnapshot<DocumentData>) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Task)
  );
};

// UPDATE
export const updateTask = async (
  id: string,
  updatedFields: Partial<Omit<Task, "id" | "createdAt">>
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");

  const taskRef = doc(db, "users", user.uid, "tasks", id);
  await updateDoc(taskRef, { ...updatedFields, updatedAt: serverTimestamp() });
};

// DELETE
export const deleteTask = async (id: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");

  const taskRef = doc(db, "users", user.uid, "tasks", id);
  await deleteDoc(taskRef);
};
