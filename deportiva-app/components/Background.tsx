import React from "react";
import { ImageBackground, StyleSheet } from "react-native";
import { useAppState } from "../store/state";

type Props = {
  children: React.ReactNode;
};

export default function Background({ children }: Props) {
  const { config } = useAppState();
  if (!config.backgroundUrl) return children as any;
  return (
    <ImageBackground source={{ uri: config.backgroundUrl }} style={styles.bg}>
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, resizeMode: "cover" },
});