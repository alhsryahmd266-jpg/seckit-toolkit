import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ToolCard } from "@/components/ToolCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const TOOLS = [
  { title: "Port Scanner", description: "Scan TCP/UDP ports on any host", icon: "radar", color: "#00FF88", route: "/network", badge: "LIVE" },
  { title: "Net Scanner", description: "Discover devices on subnet", icon: "lan", color: "#00D4FF", route: "/network" },
  { title: "DNS Lookup", description: "Query DNS records (A, MX, TXT…)", icon: "dns", color: "#9B59F5", route: "/network" },
  { title: "WHOIS", description: "Domain registration info", icon: "earth", color: "#0066FF", route: "/network" },
  { title: "APK Analyzer", description: "Extract manifest & permissions", icon: "android", color: "#00FF88", route: "/re", badge: "NEW" },
  { title: "Frida Scripts", description: "Inject & manage hook scripts", icon: "needle", color: "#FF3366", route: "/re" },
  { title: "Hex Viewer", description: "Raw binary file inspection", icon: "matrix", color: "#FFAA00", route: "/re" },
  { title: "HTTP Tester", description: "Build & fire HTTP requests", icon: "web", color: "#00D4FF", route: "/http" },
  { title: "SSL Inspector", description: "Verify TLS chain & certs", icon: "shield-lock", color: "#9B59F5", route: "/http" },
  { title: "Interceptor", description: "Capture & replay traffic", icon: "swap-horizontal", color: "#FF3366", route: "/http", badge: "PRO" },
];

function PulsingDot({ connected }: { connected: boolean }) {
  const colors = useColors();
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (connected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.6, duration: 900, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.setValue(1);
    }
  }, [connected]);
  const dotColor = connected ? colors.primary : colors.destructive;
  return (
    <View style={{ width: 18, height: 18, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={{ position: "absolute", width: 14, height: 14, borderRadius: 7, backgroundColor: dotColor + "33", transform: [{ scale: pulse }] }} />
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dotColor }} />
    </View>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isConnected, serverUrl } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 80;

  const rows: (typeof TOOLS)[] = [];
  for (let i = 0; i < TOOLS.length; i += 2) {
    rows.push(TOOLS.slice(i, i + 2));
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headline, { color: colors.foreground }]}>SecKit</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>Security Toolkit</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <PulsingDot connected={isConnected} />
          <Text style={[styles.statusText, { color: isConnected ? colors.primary : colors.mutedForeground }]}>
            {isConnected ? "Online" : serverUrl ? "Offline" : "No Server"}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: botPad, paddingTop: 16, gap: 10 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.banner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="information-outline" size={16} color={colors.accent} />
          <Text style={[styles.bannerText, { color: colors.mutedForeground }]}>
            {serverUrl ? `Server: ${serverUrl.replace(/https?:\/\//, "")}` : "Configure your server URL in Settings to get started"}
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ALL TOOLS</Text>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((tool) => (
              <ToolCard
                key={tool.title}
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                color={tool.color}
                badge={tool.badge}
                onPress={() => router.push(tool.route as any)}
              />
            ))}
            {row.length === 1 && <View style={{ flex: 1 }} />}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headline: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    marginBottom: 2,
    marginTop: 4,
  },
  row: { flexDirection: "row", gap: 10 },
});
