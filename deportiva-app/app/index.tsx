import React from "react";
import { Redirect } from "expo-router";
import { useAppState } from "../store/state";

export default function Index() {
  const { currentUser } = useAppState();
  return <Redirect href={currentUser ? "/(tabs)" : "/login"} />;
}