import { View, Text, ScrollView, TouchableOpacity} from "react-native"
import { useEffect, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const dates = 
[
    {day: 'Mon', date: '02 Dec'},
    {day: 'tue', date: '03 Dec'},
    {day: 'Wen', date: '04 Dec'},
    {day: 'Tur', date: '05 Dec'}
]

export default function app() {
    
    const  [loading, setLoading] = useState(true);

    useEffect(() =>{
        setTimeout(() =>{
            setLoading(false);
        }, 2000);
    }, []);
    const testdate=new Date();
    return loading ?
    //Bloque de code correspondant au chargement.
    (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize:36}}>WARASCORE</Text>
        </View>
    ) : 
    
    //Bloque de code correspondant a la page d'acceuil.
    (
        <SafeAreaProvider>
            <SafeAreaView>
                <Text>ezdfjnejzfnejzknfe</Text> 
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

