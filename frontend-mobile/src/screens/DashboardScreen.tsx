import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Card, Avatar, useTheme, IconButton } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const MENU_ITEMS = [
  { id: 'Trips', title: 'Mis Viajes', icon: 'truck-delivery', color: '#1976d2' },
  { id: 'Fuel', title: 'Combustible', icon: 'gas-station', color: '#e64a19' },
  { id: 'Checklists', title: 'Checklists', icon: 'clipboard-check', color: '#388e3c' },
  { id: 'Traceability', title: 'Trazabilidad', icon: 'map-marker-path', color: '#7b1fa2' },
  { id: 'Vehicles', title: 'Vehículos', icon: 'car-pickup', color: '#0288d1' },
  { id: 'Documents', title: 'Documentos', icon: 'file-document', color: '#455a64' },
];

const DashboardScreen = () => {
  const { user, logout } = useAuthStore();
  const theme = useTheme();
  const navigation = useNavigation<any>();

  const handlePress = (screen: string) => {
    navigation.navigate(screen, { title: MENU_ITEMS.find(i => i.id === screen)?.title });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerContent}>
          <Avatar.Text 
            size={50} 
            label={user?.first_name?.substring(0,2).toUpperCase() || 'US'} 
            style={{ backgroundColor: theme.colors.surface }}
            color={theme.colors.primary}
          />
          <View style={{ marginLeft: 15, flex: 1 }}>
            <Text variant="titleMedium" style={{ color: 'white', fontWeight: 'bold' }}>
              {user?.first_name} {user?.last_name}
            </Text>
            <Text variant="bodySmall" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {user?.role?.toUpperCase() || 'USUARIO'}
            </Text>
          </View>
          <IconButton icon="logout" iconColor="white" onPress={() => logout()} />
        </View>
      </View>

      {/* Grid Menu */}
      <ScrollView contentContainerStyle={styles.gridContainer}>
        <Text variant="titleLarge" style={styles.sectionTitle}>Panel Principal</Text>
        
        <View style={styles.grid}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.gridItem}
              onPress={() => handlePress(item.id)}
              activeOpacity={0.7}
            >
              <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                  <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                    <MaterialCommunityIcons name={item.icon as any} size={32} color={item.color} />
                  </View>
                  <Text variant="titleMedium" style={styles.cardTitle}>{item.title}</Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Footer Info */}
      <View style={styles.footer}>
        <Text variant="bodySmall" style={{ color: '#aaa' }}>COTRAQ v1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridContainer: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%', // Just less than half to fit 2 columns with gap
    marginBottom: 15,
  },
  card: {
    borderRadius: 16,
    elevation: 2,
    height: 140, // Fixed height for uniformity
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    textAlign: 'center',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  }
});

export default DashboardScreen;
