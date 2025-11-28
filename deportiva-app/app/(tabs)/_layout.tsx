import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { useAppState } from "../../store/state";

export default function TabsLayout() {
  const { currentUser } = useAppState();
  const isAdmin = currentUser?.role === "admin";

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#121216" },
        headerTintColor: "#fff",
        tabBarStyle: { backgroundColor: "#121216", borderTopColor: "#222" },
        tabBarActiveTintColor: "#ff3b30",
        tabBarInactiveTintColor: "#bbb",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Buscar",
          tabBarIcon: ({ color }) => <FontAwesome name="search" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Panel",
          tabBarIcon: ({ color }) => <FontAwesome name="cog" color={color} size={24} />,
          href: isAdmin ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => <FontAwesome name="user" color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}