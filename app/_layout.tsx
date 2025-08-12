import { Tabs } from "expo-router";
import { View } from "react-native";

export default function Layout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs screenOptions={{ headerShown: true }} />
    </View>
  );
}
