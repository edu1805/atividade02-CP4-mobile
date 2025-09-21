# 📋 App de Tarefas Mobile

**Integrantes:**  
- Eduardo Barriviera - RM555309  
- Thiago Lima - RM556795
---

Este projeto é um aplicativo mobile desenvolvido em React Native com Expo, que permite ao usuário criar, editar, excluir e marcar tarefas como concluídas. As tarefas são armazenadas no Firebase Firestore, e o app conta com autenticação de usuários via Firebase Auth.

---

## 🔹 Funcionalidades
- Cadastro e login de usuários (Firebase Auth)
- Adicionar tarefas com título, descrição e prazo
- Editar tarefas existentes
- Excluir tarefas
- Marcar tarefas como concluídas
- Visualização de data de criação e atualização das tarefas
---
## 🛠 Tecnologias Utilizadas
- React Native
- Expo Router
- Firebase (Auth e Firestore)
- Context API (para tema)
---
### 🚀 Como Rodar o Projeto

### 1. Clonar o repositório:
```bash
git clone https://github.com/edu1805/atividade02-CP4-mobile.git
cd atividade02-CP4-mobile
```
### 2. Instalar dependências:
```bash
npm install
# ou
yarn install
```
### 3. Configurar Firebase:
> ⚠️ Caso queira usar suas próprias credenciais do Firebase.

- Crie um projeto no Firebase Console
- Ative Authentication (Email/Password)
- Crie um Firestore Database
- Substitua as credenciais no arquivo `src\services/fireBaseConfig.tsx`:
```bash
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};
```
### 4. Rodar o app no Expo:
```bash
npm start
# ou
npm run android
```
