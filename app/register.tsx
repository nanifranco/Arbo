import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert('Error', error.message);
    else {
      Alert.alert('Cuenta creada', 'Revisa tu correo para confirmar tu cuenta.');
      router.replace('/login');
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Arbo</Text>
      <Text style={styles.subtitle}>Crea tu cuenta</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#555"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#555"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Cargando...' : 'Registrarse'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 48, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 4, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 32 },
  input: { width: '100%', backgroundColor: '#1A1A1A', color: '#FFFFFF', padding: 16, borderRadius: 8, marginBottom: 12, fontSize: 16, borderWidth: 1, borderColor: '#222' },
  button: { width: '100%', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#0D0D0D', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#888', marginTop: 24, fontSize: 14 },
});