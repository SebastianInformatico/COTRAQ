import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, Avatar } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';

const DashboardScreen = () => {
  const { user, logout } = useAuthStore();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title 
          title={`Hola, ${user?.first_name || 'Usuario'}`} 
          subtitle={`Rol: ${user?.role || '...'} | S.C.O.T.A. v1.0`}
          left={(props) => <Avatar.Icon {...props} icon="account" />}
        />
        <Card.Content>
          <Text variant="bodyMedium" style={{ marginTop: 10 }}>
            Bienvenido a la aplicación móvil. Próximamente podrás ver tus rutas asignadas, vehículos y realizar checklists.
          </Text>
        </Card.Content>
        <Card.Actions style={{ marginTop: 10 }}>
          <Button onPress={() => logout()} mode="contained-tonal" icon="logout">
            Cerrar Sesión
          </Button>
        </Card.Actions>
      </Card>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Estado del Sistema: Conectado</Text>
        <Text style={styles.statusText}>Backend: 192.168.1.103:3001</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f2f5',
  },
  card: {
    marginTop: 40,
    borderRadius: 12,
  },
  statusContainer: {
    marginTop: 'auto',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    color: '#aaa',
    fontSize: 12,
  }
});

export default DashboardScreen;
