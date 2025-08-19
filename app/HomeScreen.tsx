import { Text,Button,Alert, TextInput,StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import ItemLoja from "../components/ItemLoja";
import { useState } from "react";
import {auth} from '../services/firebaseConfig'
import { deleteUser } from "firebase/auth";
import { collection,addDoc,db } from "../services/firebaseConfig";

export default function HomeScreen() {
    const[title,setTitle]=useState('')
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
    const salvarItem = async()=>{
        try{
            const docRef = await addDoc(collection(db,'items'),{
                title:title,
                isChecked:false
            })
            Alert.alert("Sucesso","Produto Salvo com sucesso.")
            console.log("Documento Salvo", docRef.id)
            setTitle('')//Limpa o TextInput
        }catch(e){
            console.error("Error adding document: ", e);
        }
    }
    return (
        <SafeAreaView style={styles.container}>
            <Text>Seja bem-vindo a Tela Inicial da Aplicação</Text>
            <Button title="Sair da Conta" onPress={realizarLogoff}/>
            <Button title="Exluir conta" color='red' onPress={excluirConta}/>,
            <Button title="Alterar Senha" onPress={()=>router.push("/AlterarSenha")}/>
            <ItemLoja />
            <ItemLoja />
            <ItemLoja />
            <TextInput 
                placeholder="Digite o nome do produto" 
                style={styles.input}
                value={title}
                onChangeText={(value)=>setTitle(value)}
                onSubmitEditing={salvarItem}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1
    },
    input:{
        backgroundColor:'lightgray',
        padding:10,
        fontSize:15,
        width:'90%',
        alignSelf:'center',
        borderRadius:10,
        marginTop:20
    }
})