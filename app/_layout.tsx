import { ThemeProvider } from '@/context/ThemeContext';
import { Stack } from 'expo-router/stack';
import { FavoritesProvider } from 'context/FavorisContext';

export default function Layout() {
 return (
    <ThemeProvider>

   <Stack>
     <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
   </Stack>
    </ThemeProvider>
 );
}

export default function RootLayout() {
  return (
    <FavoritesProvider>
      {/* le reste de ta navigation */}
    </FavoritesProvider>
  );
}
