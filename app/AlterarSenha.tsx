import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth } from '../src/services/firebaseConfig'
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CadastroScreen() {
  // Estados para armazenar os valores digitados
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');

  const router = useRouter() // Hook para navegação

  // Função para realizar update de senha
  const handleAlterarSenha = async() => {
    if (!novaSenha || !confirmarSenha || !senhaAtual) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }
    //Verificar se a nova senha é igual a confirmação da senha
    if(novaSenha!== confirmarSenha){
        Alert.alert("Erro","As senhas não coincidem!")
        return
    }
    //Tratamento do tamanho da senha se for menos 6 caracteres
    if(novaSenha.length<6){
        Alert.alert("Erro","A nova senha deve ter pelo menos 6 caracteres.")
        return
    }
    try{
        const user = auth.currentUser;
        if(!user || !user.email){
            Alert.alert("Erro","Nenhum usário logado.")
            return
        }
        //Cria as credenciais com e-mail e senha atual para reatenticar
        const credencial = EmailAuthProvider.credential(user.email,senhaAtual)
        await reauthenticateWithCredential(user,credencial)

        //Após reautenticar , vamos alterar senha
        await updatePassword(user,novaSenha)
        Alert.alert("Sucesso","Senha alterada com sucesso!")
        router.push('/HomeScreen')
    }catch(error){
      console.log("Erro ao alterar senha")
    }

    
    }

    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Alterar Senha</Text>

        {/* Campo Nome */}
        <TextInput
          style={styles.input}
          placeholder="Digite a senha atual"
          placeholderTextColor="#aaa"
          value={senhaAtual}
          onChangeText={setSenhaAtual}
        />

        {/* Campo Email */}
        <TextInput
          style={styles.input}
          placeholder="Digite a nova senha"
          placeholderTextColor="#aaa"
          value={novaSenha}
          onChangeText={setNovaSenha}
        />

        {/* Campo Senha */}
        <TextInput
          style={styles.input}
          placeholder="Confirme a nova senha"
          placeholderTextColor="#aaa"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />

        {/* Botão */}
        <TouchableOpacity style={styles.botao} onPress={handleAlterarSenha}>
          <Text style={styles.textoBotao}>Alterar Senha</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Estilização
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#121212',
      justifyContent: 'center',
      padding: 20,
    },
    titulo: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 30,
      textAlign: 'center',
    },
    input: {
      backgroundColor: '#1E1E1E',
      color: '#fff',
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
      fontSize: 16,
      borderWidth: 1,
      borderColor: '#333',
    },
    botao: {
      backgroundColor: '#00B37E',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
    },
    textoBotao: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
