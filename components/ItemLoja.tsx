import { StyleSheet, View, Text, Pressable, Alert } from "react-native";
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import { useEffect, useState } from "react";
import {doc,updateDoc,db,deleteDoc} from '../services/firebaseConfig'


export default function ItemLoja(props: any) {
    const [isChecked, setIsChecked] = useState(props.isChecked)
    const updateIsChecked = async ()=>{
            const itemRef = doc(db,'items',props.id)            
            await updateDoc(itemRef,{
                isChecked:isChecked
            })
    }
    const deletarItem = async()=>{
        Alert.alert("Exclusão","Deseja realmente excluir?",[
            {
                text:'Cancelar',style:'cancel'
            },
            {   text:"Sim",
                style:'destructive',
                onPress: async()=>(
                    await deleteDoc(doc(db,'items',props.id)),
                    Alert.alert("Exclusão efetuada","Produto excluído com sucesso.")
                )
            }
        ])
       
    }  
    useEffect(()=>{
        updateIsChecked()
    },[isChecked])

    return (
        <View style={styles.container}>
            <Pressable onPress={() => setIsChecked(!isChecked)}>
                {isChecked ? (
                    <AntDesign name="checkcircle" color='black' size={24} />
                ):(
                    <AntDesign name="checkcircleo" color='black' size={24} />
                )
                }

            </Pressable>
            <Text style={styles.title}>{props.title}</Text>
            <Pressable onPress={deletarItem}>
                <MaterialIcons name='delete' size={24} color='back' />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'lightgray',
        justifyContent: 'space-between',
        alignItems: "center",
        padding: 10,
        width: '90%',
        alignSelf: 'center',
        borderRadius: 10,
        marginTop: 5
    },
    title: {
        flex: 1,
        marginLeft: 10,
        fontSize: 17,
        fontWeight: 500
    }
})