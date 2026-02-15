import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Appbar } from 'react-native-paper';

interface Props {
  navigation: any;
  route: any;
}

const PlaceholderScreen: React.FC<Props> = ({ navigation, route }) => {
  const { title } = route.params || { title: 'Módulo' };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={title} />
      </Appbar.Header>
      <View style={styles.container}>
        <Text variant="headlineSmall" style={{ textAlign: 'center', marginBottom: 10 }}>
          {title}
        </Text>
        <Text variant="bodyMedium" style={{ textAlign: 'center', color: '#666' }}>
          Este módulo está en construcción y estará disponible pronto.
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
});

export default PlaceholderScreen;
