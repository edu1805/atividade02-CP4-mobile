//Context será o resposável pelo gerenciamento do tema (dark/light)

import React,{createContext,useContext,useState} from "react";
import { Appearance } from "react-native";

//Criando o contexto
const ThemeContext = createContext()

//Hooke customizado para acessar o tema
export function useTheme(){
    return useContext(ThemeContext)
}

//Provider que envolve toda a aplicação
export function ThemeProvider({children}){
    //Detecta o tema inicial do dispositivo
    const colorScheme = Appearance.getColorScheme()

    //Estado para armazenar o tema (light ou dark)
    const[theme,setTheme] = useState(colorScheme || 'light')

    //Função para alternar entre os temas
    const toggleTheme = ()=>{
        setTheme((value)=>value==='light'?'dark':'light')
    }

    //Definindo as cores por tema
    const themeColors = {
        light:{
            background:'#FFF',
            text:'#000',
            button:'#007bffff',
            buttonText:'#fff',
            input:'#f0f0f0',
            inputText:'#000',
            placeHolderTextColor:'#555'
        },
        dark:{
            background:'#121212',
            text:'#fff',
            button:'#3fd92bff',
            buttonText:'#000',
            input:'#333',
            inputText:'#fff',
            placeHolderTextColor:'#aaa'
        }
    }

    return(
        <ThemeContext.Provider value={{theme,toggleTheme,colors:themeColors[theme]}}>
            {children}
        </ThemeContext.Provider>
    )
}