import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAppState } from "../store/state";
import Background from "../components/Background";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAppState();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onRegister = async () => {
    const res = await register(name, email, password);
    if (!res.ok) {
      Alert.alert("Error", res.message || "No se pudo registrar. Revise los datos.");
      return;
    }
    Alert.alert("Listo", "Registro enviado. Espera aprobación del administrador.");
    router.replace("/login");
  };

  return (
    <Background>
      <View style={styles.container}>
        <Text style={styles.title}>Crear cuenta</Text>
        <TextInput placeholder="Nombre" value={name} onChangeText={setName} style={styles.input} />
        <TextInput placeholder="Correo" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} />
        <TextInput placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
        <Button title="Registrarme" onPress={onRegister} />
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 24 },
  input: { width: "100%", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 12 },
});