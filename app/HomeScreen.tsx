import { Text,Button,Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import {auth} from '../services/firebaseConfig'
import { deleteUser } from "firebase/auth";

export default function HomeScreen() {
    const router = useRouter()//Hook de navegação entre telas
    const realizarLogoff = async()=>{
        await AsyncStorage.removeItem('@user')
        router.push('/')
    }
    const excluirConta = () =>{
        Alert.alert(
            "Confirmar Exclusão",
            "Tem certeza que deseja excluir sua conta? Esta ação não poderá ser desfeita!",
            [
                {text:"Cancelar",style:"cancel"},
                {text:"Excluir",style:'destructive',
                    onPress:async()=>{
                        try{
                            const user = auth.currentUser
                            if(user){
                                await deleteUser(user)//Apaga do firebase Auth
                                await AsyncStorage.removeItem('@user')
                                Alert.alert("Conta Excluída", "Sua conta foi excluída com sucesso.")
                                router.replace('/')
                            }else{
                                Alert.alert("Erro","Nenhum usuário logado.")
                            }
                        }catch(error){
                            console.log("Erro ao excluir conta.")
                            Alert.alert("Error", "Não foi possível excluir conta")
                        }
                    }
                }
            ]
        )
    }
    return (
        <SafeAreaView>
            <Text>Seja bem-vindo a Tela Inicial da Aplicação</Text>
            <Button title="Sair da Conta" onPress={realizarLogoff}/>
            <Button title="Exluir conta" color='red' onPress={excluirConta}/>
        </SafeAreaView>
    )
}