import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Button, TextInput, FlatList, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import Background from "../../components/Background";
import { useAppState } from "../../store/state";

export default function AdminPanel() {
  const { users, config, approveUser, deleteUser, resetPassword, uploadExcelFromUri, setBackgroundUrl } = useAppState();
  const [bg, setBg] = useState(config?.backgroundUrl || "");
  const pendingUsers = useMemo(() => users.filter(u => !u.approved && u.role !== "admin"), [users]);
  const regularUsers = useMemo(() => users.filter(u => u.role !== "admin"), [users]);

  const pickExcel = async () => {
    const pick = await DocumentPicker.getDocumentAsync({ type: "application/*" });
    if (pick.canceled || !pick.assets?.[0]) return;
    const file = pick.assets[0];
    const result = await uploadExcelFromUri(file.uri);
    if ('error' in result) {
      Alert.alert("Error", result.error);
    } else {
      Alert.alert("Datos cargados", `Se importaron ${result.count} placas del Excel.`);
    }
  };

  const saveBg = () => {
    setBackgroundUrl(bg.trim());
    Alert.alert("Fondo actualizado", "Se aplicó el fondo para la app/panel.");
  };

  return (
    <Background>
      <View style={styles.container}>
        <Text style={styles.title}>Panel Administrativo</Text>
        <Text style={styles.section}>Subir Excel de placas</Text>
        <View style={{ alignSelf: "stretch" }}>
          <Button title="Seleccionar Excel" color="#ff3b30" onPress={pickExcel} />
        </View>
        <View style={{ height: 20 }} />

        <Text style={styles.section}>Aprobar usuarios</Text>
        <FlatList
          data={pendingUsers}
          keyExtractor={(u) => u.id}
          renderItem={({ item }) => (
            <View style={styles.userRow}>
              <Text style={styles.userText}>{item.name} ({item.email})</Text>
              <Button title="Aprobar" color="#2ecc71" onPress={() => approveUser(item.email)} />
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: "#aaa" }}>No hay usuarios pendientes.</Text>}
        />

        <Text style={styles.section}>Usuarios</Text>
        <FlatList
          data={regularUsers}
          keyExtractor={(u) => u.id}
          renderItem={({ item }) => (
            <View style={styles.userRow}>
              <Text style={styles.userText}>{item.name} ({item.email})</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Button title="Reset a 123456" color="#ff9500" onPress={() => resetPassword(item.email, '123456')} />
                <Button title="Eliminar" color="#ff3b30" onPress={() => deleteUser(item.id)} />
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: "#aaa" }}>Sin usuarios.</Text>}
        />

        <Text style={styles.section}>Fondo del panel y la app</Text>
        <TextInput placeholder="URL de imagen" placeholderTextColor="#ddd" value={bg} onChangeText={setBg} style={styles.input} />
        <View style={{ alignSelf: "stretch" }}>
          <Button title="Guardar fondo" color="#ff3b30" onPress={saveBg} />
        </View>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#0d0f14" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12, color: "#fff" },
  section: { fontSize: 16, fontWeight: "600", marginTop: 16, marginBottom: 8, color: "#fff" },
  input: { borderWidth: 1, borderColor: "#333", backgroundColor: "#161922", color: "#fff", borderRadius: 10, padding: 10, marginBottom: 12 },
  userRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#2a2e39" },
  userText: { color: "#fff" },
});