import { ThemeProvider } from '@/context/ThemeContext';
import { Stack } from 'expo-router/stack';

export default function Layout() {
 return (
    <ThemeProvider>

   <Stack>
     <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
   </Stack>
    </ThemeProvider>
 );
}
