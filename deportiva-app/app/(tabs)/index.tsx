import React, { useState } from "react";
import { StyleSheet, TextInput, Button, FlatList, View, Text, Alert } from "react-native";
import { Link, router } from "expo-router";
import { useAppState } from "../../store/state";
import Background from "../../components/Background";

export default function BuscarPlacaScreen() {
  const { searchByPlate, saveVehicle, deleteVehicleByPlate, currentUser, logout } = useAppState();
  const [plate, setPlate] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [ingreso, setIngreso] = useState("");
  const [salida, setSalida] = useState("");
  const [estado, setEstado] = useState("");
  const isAdmin = currentUser?.role === "admin";
  const isLoggedIn = !!currentUser;

  const onSearch = async () => {
    const r = await searchByPlate(plate.trim());
    setResults((prev) => {
      const merged = [...prev];
      r.forEach((item) => {
        const idx = merged.findIndex((x) => x.plate === item.plate);
        if (idx >= 0) merged[idx] = item; else merged.unshift(item);
      });
      return merged;
    });
    const first = r[0];
    if (first) {
      setIngreso(first.ingreso || "");
      setSalida(first.salida || "");
      setEstado(first.estado || "");
    }
  };

  const onSave = async () => {
    const res = await saveVehicle({ plate, ingreso, salida, estado });
    if (!res.ok) {
      Alert.alert("Error", res.message || "No se pudo guardar");
      return;
    }
    const r = await searchByPlate(plate.trim());
    setResults((prev) => {
      const merged = [...prev];
      r.forEach((item) => {
        const idx = merged.findIndex((x) => x.plate === item.plate);
        if (idx >= 0) merged[idx] = item; else merged.unshift(item);
      });
      return merged;
    });
    Alert.alert("Guardado", "Vehículo actualizado.");
  };

  const onDelete = async () => {
    await deleteVehicleByPlate(plate.trim());
    const r = await searchByPlate(plate.trim());
    setResults(r);
    setIngreso("");
    setSalida("");
    setEstado("");
    Alert.alert("Eliminado", "Registro eliminado.");
  };

  const onLogout = async () => {
    await logout();
    // Limpiar estado local de búsqueda
    setPlate("");
    setResults([]);
    setIngreso("");
    setSalida("");
    setEstado("");
    router.replace("/login");
  };

  return (
    <Background>
      <View style={styles.container}>
        <Text style={styles.title}>Consulta por placa</Text>
        {isLoggedIn && (
          <View style={{ alignSelf: "stretch", marginBottom: 8 }}>
            <Button title="Cerrar sesión" color="#ff3b30" onPress={onLogout} />
          </View>
        )}
        {!isLoggedIn && (
          <View style={{ alignSelf: "stretch", marginBottom: 12 }}>
            <Text style={{ color: "#fff", marginBottom: 8 }}>Inicia sesión para buscar placas.</Text>
            <Link href="/login" style={{ color: "#ff3b30" }}>Ir a iniciar sesión</Link>
          </View>
        )}
        {isAdmin && (
          <Link href="/admin-reset" style={{ color: "#ff3b30", marginBottom: 8 }}>
            Resetear contraseña (Admin)
          </Link>
        )}
        {isLoggedIn && (
        <TextInput
          placeholder="Ej: ABC123"
          placeholderTextColor="#ddd"
          value={plate}
          onChangeText={setPlate}
          autoCapitalize="characters"
          style={styles.input}
        />
        )}
        {isLoggedIn && (
        <View style={{ marginTop: 8, alignSelf: "stretch" }}>
          <Button title="Buscar" color="#ff3b30" onPress={onSearch} />
        </View>
        )}
        {isAdmin && isLoggedIn && (
          <>
            <View style={styles.formRow}>
              <TextInput
                placeholder="Ingreso"
                placeholderTextColor="#ddd"
                value={ingreso}
                onChangeText={setIngreso}
                style={[styles.input, styles.inputHalf]}
              />
              <TextInput
                placeholder="Salida"
                placeholderTextColor="#ddd"
                value={salida}
                onChangeText={setSalida}
                style={[styles.input, styles.inputHalf]}
              />
            </View>
            <TextInput
              placeholder="Estado"
              placeholderTextColor="#ddd"
              value={estado}
              onChangeText={setEstado}
              style={styles.input}
            />
            <View style={styles.actions}>
              <Button title="Guardar" color="#ff3b30" onPress={onSave} />
              <Button title="Eliminar" color="#ff3b30" onPress={onDelete} />
            </View>
          </>
        )}
        {isLoggedIn && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.plate}
          style={{ marginTop: 16, width: "100%" }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.plate}>{item.plate}</Text>
              {!!item.estado && <Text style={styles.itemText}>Estado: {item.estado}</Text>}
              {!!item.ingreso && <Text style={styles.itemText}>Ingreso: {item.ingreso}</Text>}
              {!!item.salida && <Text style={styles.itemText}>Salida: {item.salida}</Text>}
              {item.updatedAt && (
                <Text style={styles.itemText}>Actualizado: {new Date(item.updatedAt).toLocaleString()}</Text>
              )}
            </View>
          )}
          ListEmptyComponent={<Text style={{ marginTop: 16, color: "#aaa" }}>Sin resultados.</Text>}
        />
        )}
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: 16, backgroundColor: "#0d0f14" },
  title: { fontSize: 20, fontWeight: "bold", marginVertical: 12, color: "#fff" },
  input: { width: "100%", borderWidth: 1, borderColor: "#333", backgroundColor: "#161922", color: "#fff", borderRadius: 10, padding: 12, marginBottom: 12 },
  formRow: { flexDirection: "row", gap: 10 },
  inputHalf: { flex: 1 },
  actions: { flexDirection: "row", gap: 12, marginTop: 10, alignSelf: "stretch" },
  card: { width: "100%", borderWidth: 1, borderColor: "#2a2e39", borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: "#121521" },
  plate: { alignSelf: "flex-start", backgroundColor: "#ff3b30", color: "#fff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, fontSize: 16, fontWeight: "700", marginBottom: 12 },
  itemText: { fontSize: 16, color: "#fff" },
});