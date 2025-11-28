import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import * as WebBrowser from "expo-web-browser";
import Background from "../../components/Background";
import { useAppState } from "../../store/state";

export default function ProfileScreen() {
  const { currentUser, logout } = useAppState();
  const user = currentUser;
  const openWeb = () => WebBrowser.openBrowserAsync("https://parqueaderojl.com");

  return (
    <Background>
      <View style={styles.container}>
        <Text style={styles.title}>Mi perfil</Text>
        {user && (
          <>
            <Text>Nombre: {user.name}</Text>
            <Text>Correo: {user.email}</Text>
            <Text>Rol: {user.role}</Text>
            <Text>Aprobado: {user.approved ? "Sí" : "No"}</Text>
          </>
        )}
        <View style={{ height: 16 }} />
        <Button title="Abrir sitio JL" onPress={openWeb} />
        <View style={{ height: 8 }} />
        <Button title="Cerrar sesión" color="#c00" onPress={logout} />
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
});