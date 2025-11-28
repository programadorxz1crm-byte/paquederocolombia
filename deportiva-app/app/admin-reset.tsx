import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { Link, useRouter } from "expo-router";
import Background from "../components/Background";
import { useAppState } from "../store/state";

export default function AdminResetPasswordScreen() {
  const { resetPassword, currentUser } = useAppState();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const isAdmin = currentUser?.role === "admin";

  const onReset = async () => {
    if (!isAdmin) {
      Alert.alert("No autorizado", "Solo el administrador puede resetear contraseñas.");
      return;
    }
    if (!email.trim() || !newPassword.trim()) {
      Alert.alert("Campos requeridos", "Debes completar correo y nueva contraseña.");
      return;
    }
    const ok = await resetPassword(email.trim(), newPassword);
    if (ok) {
      Alert.alert("Listo", "Contraseña actualizada.");
      router.replace("/(tabs)");
    } else {
      Alert.alert("Error", "No se pudo actualizar la contraseña.");
    }
  };

  return (
    <Background>
      <View style={styles.container}>
        <Text style={styles.title}>Resetear contraseña (Admin)</Text>
        <TextInput
          placeholder="Correo del usuario"
          placeholderTextColor="#ddd"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Nueva contraseña"
          placeholderTextColor="#ddd"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          style={styles.input}
        />
        <View style={{ alignSelf: "stretch", marginTop: 8 }}>
          <Button title="Resetear" color="#ff3b30" onPress={onReset} />
        </View>
        <Link href="/(tabs)" style={styles.link}>Volver</Link>
        {!isAdmin && <Text style={styles.warning}>Debes iniciar sesión como administrador.</Text>}
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#0d0f14" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16, color: "#fff" },
  input: { width: "100%", borderWidth: 1, borderColor: "#333", backgroundColor: "#161922", color: "#fff", borderRadius: 10, padding: 12, marginBottom: 12 },
  link: { color: "#ff3b30", marginTop: 12 },
  warning: { color: "#f5a623", marginTop: 10 }
});