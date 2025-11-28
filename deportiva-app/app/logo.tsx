import React from "react";
import { View, Image, StyleSheet, Text } from "react-native";
import { Link } from "expo-router";
import Background from "../components/Background";

export default function LogoScreen() {
  return (
    <Background>
      <View style={styles.container}>
        <Image source={require("../assets/images/icon.png")} style={styles.logo} />
        <Text style={styles.title}>JL PARQUEADERO</Text>
        <Link href="/login" style={styles.link}>Ir al inicio</Link>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0d0f14" },
  logo: { width: 220, height: 220, borderRadius: 12, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  link: { color: "#ff3b30", marginTop: 8 }
});