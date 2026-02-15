import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, ActivityIndicator, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { View } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import PlaceholderScreen from './src/screens/PlaceholderScreen';
import { useAuthStore } from './src/store/authStore';

const Stack = createStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1976d2',
    secondary: '#dc004e',
  },
};

export default function App() {
  const { user, isHydrated } = useAuthStore();

  if (!isHydrated) {
      // Mostrar spinner mientras se carga el estado persistido
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <>
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="Trips" component={PlaceholderScreen} initialParams={{ title: 'Mis Viajes' }} />
              <Stack.Screen name="Fuel" component={PlaceholderScreen} initialParams={{ title: 'Control de Combustible' }} />
              <Stack.Screen name="Traceability" component={PlaceholderScreen} initialParams={{ title: 'Trazabilidad' }} />
              <Stack.Screen name="Checklists" component={PlaceholderScreen} initialParams={{ title: 'Checklists' }} />
              <Stack.Screen name="Vehicles" component={PlaceholderScreen} initialParams={{ title: 'Vehículos' }} />
              <Stack.Screen name="Documents" component={PlaceholderScreen} initialParams={{ title: 'Documentación' }} />
            </>
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
