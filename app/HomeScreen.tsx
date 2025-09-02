import { Text, Button, Alert, TextInput, StyleSheet, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import ItemLoja from "../src/components/ItemLoja";
import { useEffect, useState } from "react";
import { deleteUser } from "firebase/auth";
import { auth, collection, addDoc, db, getDocs } from "../src/services/firebaseConfig";
import ThemeToggleButton from "../src/components/ThemeToggleButton";
import { useTheme } from "../src/context/ThemeContext";

export default function HomeScreen() {
    const {colors} = useTheme()//Obtenho a paleta de cores(dark ou light)
    const router = useRouter()//Hook de navegação entre telas
    const [title, setTitle] = useState('')
    interface Item {
        id: String;
        title: String;
        isChecked: boolean;
    }
    const [listaItems, setListaItems] = useState<Item[]>([])



    const realizarLogoff = async () => {
        await AsyncStorage.removeItem('@user')
        router.push('/')
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
                            const user = auth.currentUser
                            if (user) {
                                await deleteUser(user)//Apaga do firebase Auth
                                await AsyncStorage.removeItem('@user')
                                Alert.alert("Conta Excluída", "Sua conta foi excluída com sucesso.")
                                router.replace('/')
                            } else {
                                Alert.alert("Erro", "Nenhum usuário logado.")
                            }
                        } catch (error) {
                            console.log("Erro ao excluir conta.")
                            Alert.alert("Error", "Não foi possível excluir conta")
                        }
                    }
                }
            ]
        )
    }
    const salvarItem = async () => {
        try {
            const docRef = await addDoc(collection(db, 'items'), {
                title: title,
                isChecked: false
            })
            Alert.alert("Sucesso", "Produto Salvo com sucesso.")
            console.log("Documento Salvo", docRef.id)
            setTitle('')//Limpa o TextInput
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }
    const buscarItems = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'items'));
            const items: any[] = []
            querySnapshot.forEach((item) => {
                items.push({
                    ...item.data(),
                    id: item.id
                })
            })
            //console.log("Items carregador:", items)
            setListaItems(items)//Atualiza o estado com as informações do array
        } catch (e) {
            console.log("Error ao buscar os dados:", e)
        }
    }
    useEffect(() => {
        buscarItems()
    }, [listaItems])
    return (
        <SafeAreaView style={[styles.container,{backgroundColor:colors.background}]}>
            <KeyboardAvoidingView //é componente que ajusta automaticamente o layout
                style={styles.container}
                behavior={Platform.OS==='ios'?'padding':'height'}//No ios é utilizado padding, e no android o height
                keyboardVerticalOffset={20}//Descola o conteúdo na vertical em 20 pixel
            >                
            <ThemeToggleButton/>
            <Text style={[styles.texto,{color:colors.text}]}>Seja bem-vindo a Tela Inicial da Aplicação</Text>
            <Button title="Sair da Conta" onPress={realizarLogoff} />
            <Button title="Exluir conta" color='red' onPress={excluirConta} />
            <Button title="Alterar Senha" onPress={() => router.push("/AlterarSenha")} />

            {listaItems.length <= 0 ? (
                <ActivityIndicator />
            ) : (
                <FlatList
                    data={listaItems}
                    renderItem={({ item }) => (
                       <ItemLoja 
                            title={item.title}
                            isChecked={item.isChecked}
                            id={item.id}                        
                       />
                    )}
                />
            )}

            <TextInput
                placeholder="Digite o nome do produto"
                style={[styles.input,{
                    backgroundColor:colors.input,
                    color:colors.inputText,
                }]}
                placeholderTextColor={colors.placeHolderTextColor}
                value={title}
                onChangeText={(value) => setTitle(value)}
                onSubmitEditing={salvarItem}
            />
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    input: {
        backgroundColor: 'lightgray',
        padding: 10,
        fontSize: 15,
        width: '90%',
        alignSelf: 'center',
        borderRadius: 10,
        marginTop: 'auto'
    },
    texto:{
        fontSize:16,
        fontWeight:'bold'
    }
})