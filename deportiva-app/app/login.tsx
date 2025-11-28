import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Image, StyleSheet, Alert } from "react-native";
import { useRouter, Link } from "expo-router";
import { useAppState } from "../store/state";
import Background from "../components/Background";

export default function LoginScreen() {
  const router = useRouter();
  const { login, currentUser } = useAppState();
  const [email, setEmail] = useState("admin@admin");
  const [password, setPassword] = useState("123456");

  useEffect(() => {
    if (currentUser) router.replace("/(tabs)");
  }, [currentUser]);

  const onLogin = async () => {
    const ok = await login(email.trim().toLowerCase(), password);
    if (!ok) {
      Alert.alert("Acceso denegado", "Correo o contraseña incorrectos.");
      return;
    }
    router.replace("/(tabs)");
  };

  return (
    <Background>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={require("../assets/images/icon.png")} style={styles.logo} />
          <Text style={styles.brand}>Parqueadero JL</Text>
        </View>
        <Link href="/logo" style={{ color: "#ff3b30", alignSelf: "center", marginBottom: 8 }}>Ver logo</Link>
        <View style={styles.form}>
          <Text style={styles.title}>Iniciar sesión</Text>
          <TextInput
            placeholder="Usuario"
            placeholderTextColor="#ddd"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="Contraseña"
            placeholderTextColor="#ddd"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          <View style={{ marginTop: 8 }}>
            <Button title="Ingresar" color="#ff3b30" onPress={onLogin} />
          </View>
          <View style={{ height: 12 }} />
          <Link href="/register" style={styles.link}>Registrarme</Link>
        </View>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0f14" },
  header: { alignItems: "center", justifyContent: "center", paddingTop: 60, paddingBottom: 24, backgroundColor: "#d32f2f" },
  logo: { width: 120, height: 120, marginBottom: 8 },
  brand: { color: "#fff", fontSize: 20, fontWeight: "700" },
  form: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16, color: "#fff" },
  input: { width: "100%", borderWidth: 1, borderColor: "#333", backgroundColor: "#161922", color: "#fff", borderRadius: 10, padding: 12, marginBottom: 12 },
  link: { color: "#ff3b30", marginTop: 8 },
});