import { 
  Text, Button, Alert, TextInput, StyleSheet, 
  ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, View, TouchableOpacity, ScrollView 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { deleteUser, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../src/services/firebaseConfig";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import ThemeToggleButton from "../src/components/ThemeToggleButton";
import { useTheme } from "../src/context/ThemeContext";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
})

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  duedate: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const realizarLogoff = async () => {
    await AsyncStorage.removeItem('@user');
    router.push('/');
  }

  const excluirConta = () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir sua conta? Esta ação não poderá ser desfeita!",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir", style: 'destructive',
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (user) {
                await deleteUser(user);
                await AsyncStorage.removeItem('@user');
                Alert.alert("Conta Excluída", "Sua conta foi excluída com sucesso.");
                router.replace('/');
              } else {
                Alert.alert("Erro", "Nenhum usuário logado.");
              }
            } catch (error) {
              console.log("Erro ao excluir conta.", error);
              Alert.alert("Erro", "Não foi possível excluir conta");
            }
          }
        }
      ]
    )
  }

  // === CRUD de Tarefas ===
  const carregarTarefas = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "users", auth.currentUser?.uid || "anon", "tasks"));
      const lista: Task[] = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : null,
          duedate: data.duedate?.toDate ? data.duedate.toDate() : data.duedate || null,
        };
      }) as Task[];
      setTasks(lista);
    } catch (e) {
      console.log("Erro ao buscar tarefas:", e);
    } finally {
      setLoading(false);
    }
  }

  const salvarTarefa = async () => {
    if (!title.trim()) return;
    try {
      const tasksRef = collection(db, "users", auth.currentUser?.uid || "anon", "tasks");
      await addDoc(tasksRef, {
        title,
        description,
        completed: false,
        duedate: dueDate ? new Date(dueDate) : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setTitle(""); setDescription(""); setDueDate("");
      carregarTarefas();
    } catch (e) {
      console.log("Erro ao salvar tarefa:", e);
    }
  }

  const iniciarEdicao = (task: Task) => {
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.duedate ? task.duedate.toISOString().split("T")[0] : "");
    setEditingTaskId(task.id);
  }

  const salvarEdicao = async () => {
    if (!title.trim() || !editingTaskId) return;

    try {
      const taskRef = doc(db, "users", auth.currentUser?.uid || "anon", "tasks", editingTaskId);
      await updateDoc(taskRef, {
        title,
        description,
        duedate: dueDate ? new Date(dueDate) : null,
        updatedAt: serverTimestamp()
      });
      setTitle(""); setDescription(""); setDueDate(""); setEditingTaskId(null);
      carregarTarefas();
    } catch (e) {
      console.log("Erro ao editar tarefa:", e);
    }
  }

  const toggleConcluida = async (id: string, current: boolean) => {
    try {
      const taskRef = doc(db, "users", auth.currentUser?.uid || "anon", "tasks", id);
      await updateDoc(taskRef, { completed: !current, updatedAt: serverTimestamp() });
      carregarTarefas();
    } catch (e) {
      console.log("Erro ao atualizar:", e);
    }
  }

  const excluirTarefa = async (id: string) => {
    try {
      const taskRef = doc(db, "users", auth.currentUser?.uid || "anon", "tasks", id);
      await deleteDoc(taskRef);
      carregarTarefas();
    } catch (e) {
      console.log("Erro ao excluir:", e);
    }
  }

  useEffect(() => { carregarTarefas(); }, [])
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log(user ? "Usuário autenticado:" + user.uid : "Nenhum usuário logado");
    });
    return () => unsubscribe();
  }, []);

  return (
  <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
    {loading ? (
      <ActivityIndicator size="large" color={colors.text} style={{ marginTop: 20 }} />
    ) : (
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <ThemeToggleButton />

            <View style={styles.buttonsRow}>
              <Button title="Sair da Conta" onPress={realizarLogoff} />
              <Button title="Excluir conta" color="red" onPress={excluirConta} />
              <Button title="Alterar Senha" onPress={() => router.push("/AlterarSenha")} />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>MINHAS TAREFAS</Text>

            <TextInput
              placeholder="Título da tarefa"
              style={[styles.input, { backgroundColor: colors.input, color: colors.inputText }]}
              placeholderTextColor={colors.placeHolderTextColor}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              placeholder="Descrição"
              style={[styles.input, { backgroundColor: colors.input, color: colors.inputText }]}
              placeholderTextColor={colors.placeHolderTextColor}
              value={description}
              onChangeText={setDescription}
            />
            <TextInput
              placeholder="Prazo (YYYY-MM-DD)"
              style={[styles.input, { backgroundColor: colors.input, color: colors.inputText, marginBottom: 10 }]}
              placeholderTextColor={colors.placeHolderTextColor}
              value={dueDate}
              onChangeText={setDueDate}
            />
            <Button
              title={editingTaskId ? "Salvar Alterações" : "Adicionar Tarefa"}
              onPress={editingTaskId ? salvarEdicao : salvarTarefa}
            />
          </>
        }
        ListEmptyComponent={() => (
          <Text style={[styles.emptyList, { color: colors.text }]}>
            Você ainda não tem tarefas cadastradas.
          </Text>
        )}
        renderItem={({ item }) => (
          <View style={[styles.taskCard, { borderColor: colors.input }]}>
            <TouchableOpacity onPress={() => toggleConcluida(item.id, item.completed)}>
              <Text
                style={[
                  styles.taskTitle,
                  {
                    color: colors.text,
                    textDecorationLine: item.completed ? "line-through" : "none",
                  },
                ]}
              >
                {item.title.toUpperCase()}
              </Text>
              <Text
                style={[
                  styles.taskDesc,
                  {
                    color: colors.text,
                    textDecorationLine: item.completed ? "line-through" : "none",
                  },
                ]}
              >
                {item.description}
              </Text>
              <Text style={[styles.taskInfo, { color: colors.text }]}>
                Prazo: {item.duedate ? item.duedate.toLocaleDateString() : "Sem prazo"}
              </Text>
              <Text style={[styles.taskInfo, { color: colors.text }]}>
                Criado: {item.createdAt?.toLocaleString() || "—"}
              </Text>
              <Text style={[styles.taskInfo, { color: colors.text }]}>
                Atualizado: {item.updatedAt?.toLocaleString() || "—"}
              </Text>
            </TouchableOpacity>
            <View style={styles.taskButtons}>
              <Button title="🗑 Excluir" color="red" onPress={() => excluirTarefa(item.id)} />
              <View style={{ width: 10 }} />
              <Button title="✏️ Editar" color="orange" onPress={() => iniciarEdicao(item)} />
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    )}
  </SafeAreaView>
);

}

const styles = StyleSheet.create({
  container: { flex: 1 },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10
  },
  input: {
    padding: 12,
    fontSize: 16,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10,
    marginTop: 10
  },
  taskCard: {
    padding: 12,
    borderBottomWidth: 1,
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 8
  },
  taskTitle: { fontWeight: 'bold', fontSize: 16 },
  taskDesc: { fontSize: 15, marginTop: 2 },
  taskInfo: { fontSize: 14, marginTop: 2, fontWeight: 'bold' },
  taskButtons: { flexDirection: 'row', marginTop: 8, justifyContent: 'flex-start' },
  emptyList: { fontSize: 16, fontStyle: 'italic', textAlign: 'center', marginTop: 20 }
});
