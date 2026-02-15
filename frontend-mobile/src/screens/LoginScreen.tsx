import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login: authLogin, isLoading, error } = useAuthStore();

  const handleLogin = async () => {
    try {
      // El backend espera 'login' como nombre de usuario. Aseguramos minúsculas y trim
      const cleanUsername = username.trim();
      const cleanPassword = password.trim();
      console.log('Sending login:', cleanUsername, cleanPassword);
      await authLogin({ login: cleanUsername, password: cleanPassword });
    } catch (e) {
      // Error is handled in store
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text variant="displayMedium" style={styles.title}>S.C.O.T.A.</Text>
        <Text variant="titleMedium" style={styles.subtitle}>Móvil</Text>

        <TextInput
          mode="outlined"
          label="Usuario"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          style={styles.input}
          left={<TextInput.Icon icon="account" />}
        />

        <TextInput
          mode="outlined"
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          left={<TextInput.Icon icon="lock" />}
        />

        {error ? (
          <HelperText type="error" visible={true} style={styles.errorText}>
            {error}
          </HelperText>
        ) : null}

        <Button 
          mode="contained" 
          onPress={handleLogin} 
          loading={isLoading}
          disabled={isLoading || !username || !password}
          style={styles.button}
        >
          Iniciar Sesión
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 48,
    color: '#757575',
  },
  input: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    marginTop: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  errorText: {
    width: '100%',
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 14,
  }
});

export default LoginScreen;
