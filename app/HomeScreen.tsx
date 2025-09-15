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
import * as Notifications from "expo-notifications"
import * as Device from "expo-device"

//Configuração global das notificações no foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true, //SDK 52 utiliza "Alert"
        shouldPlaySound: true, // toca som
        shouldSetBadge: false //não altera o badge do app
    })
})

export default function HomeScreen() {
    const { colors } = useTheme()//Obtenho a paleta de cores(dark ou light)
    const router = useRouter()//Hook de navegação entre telas
    const [title, setTitle] = useState('')
    const[expoPushToken,setExpoPushToken] = useState<string|null>(null)

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

    const dispararNotificacao = async () => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Promoções disponíveis", //Titulo da notificação
                body: "Não perca nossas promoções do dia 08/09/2025"//corpo da notificação
            },
            trigger: {
                seconds: 2, // aguarda 02 segundos antes de disparar
                repeats: false, //não repete
            } as Notifications.TimeIntervalTriggerInput // cast para o tipo correto
        })

    }

    //Função para registrar o dispositivo e obter o Expo Push Token
    //Esse token que será gerado, é utilizado para enviar notificação remota
    const registerForPushNotificationsAsync = async():Promise<string|null>=>{
        try{
            const tokenData = await Notifications.getExpoPushTokenAsync()
            const token = tokenData.data
            console.log("Expo Push Token gerado com sucesso: ", token)
            return token
        }catch(error){
            console.log("Erro ao gerar token", error)
            return null
        }
    }

    useEffect(()=>{
        (async()=>{
            //Chama a função que registra o dispositivo com o serviço de notificação
            const token = await registerForPushNotificationsAsync()
            //Armazenando o token no estado
            setExpoPushToken(token)
        })()
    },[])

    useEffect(()=>{
        //Adiciona um ouvinte(listener) que será chamado sempre que uma notificação for recebida.
        const subscription = Notifications.addNotificationReceivedListener(notification =>{
            //Exibir no console a notificação recebida - útil para testes ou debug
            console.log("Notificação recebida: ", notification)
        })

        //Função de limpeza que será chamada
        return ()=>subscription.remove()
    },[])

    useEffect(() => {
        buscarItems()
    }, [listaItems])

    useEffect(() => {
        (async () => {

            //Verificar se já tem de permisão de notificação
            const { status: existingStatus } = await Notifications.getPermissionsAsync()
            let finalStatus = existingStatus

            //Se não tiver permissão, solicita ao usuário
            if (existingStatus !== "granted") {
                const { status } = await Notifications.requestPermissionsAsync()
                finalStatus = status
            }

            //Se ainda não foi permitido o usuario das notificações
            if (finalStatus !== "granted") {
                alert("Permissão para notificação não concedida")
            }
        })()
    }, [])
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView //é componente que ajusta automaticamente o layout
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}//No ios é utilizado padding, e no android o height
                keyboardVerticalOffset={20}//Descola o conteúdo na vertical em 20 pixel
            >
                <ThemeToggleButton />
                <Text style={[styles.texto, { color: colors.text }]}>Seja bem-vindo a Tela Inicial da Aplicação</Text>
                <Button title="Sair da Conta" onPress={realizarLogoff} />
                <Button title="Exluir conta" color='red' onPress={excluirConta} />
                <Button title="Alterar Senha" onPress={() => router.push("/AlterarSenha")} />
                <Button title="Enviar notificação" color='purple' onPress={dispararNotificacao} />

                {expoPushToken?<Text>Token Gerado:{expoPushToken}</Text>:(
                    <Text>Registrando token....</Text>
                )}
                
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
                    style={[styles.input, {
                        backgroundColor: colors.input,
                        color: colors.inputText,
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
    texto: {
        fontSize: 16,
        fontWeight: 'bold'
    }
})