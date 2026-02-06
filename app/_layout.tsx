import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6D4C41',
    primaryContainer: '#D7CCC8',
    secondary: '#8D6E63',
    secondaryContainer: '#EFEBE9',
  },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#EFEBE9' },
            headerTintColor: '#3E2723',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="session/[id]"
            options={{ title: 'Sitzung' }}
          />
          <Stack.Screen
            name="customer/[id]"
            options={{ title: 'Kunde bearbeiten' }}
          />
          <Stack.Screen
            name="session/weighing/[id]"
            options={{ title: 'Wiegen' }}
          />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
