import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ResultPanel } from "@/components/ResultPanel";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type Tool = "port" | "net" | "dns" | "whois";

const TABS: { id: Tool; label: string; icon: string }[] = [
  { id: "port", label: "Port Scan", icon: "radar" },
  { id: "net", label: "Net Scan", icon: "lan" },
  { id: "dns", label: "DNS", icon: "dns" },
  { id: "whois", label: "WHOIS", icon: "earth" },
];

export default function NetworkScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { callTool } = useApp();
  const [active, setActive] = useState<Tool>("port");
  const [host, setHost] = useState("");
  const [ports, setPorts] = useState("1-1024");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 80;

  const runTool = async () => {
    if (!host.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      let data: any;
      if (active === "port") data = await callTool("/scan/ports", "POST", { host: host.trim(), range: ports });
      else if (active === "net") data = await callTool("/scan/network", "POST", { subnet: host.trim() });
      else if (active === "dns") data = await callTool(`/lookup/dns?domain=${encodeURIComponent(host.trim())}`);
      else data = await callTool(`/lookup/whois?domain=${encodeURIComponent(host.trim())}`);
      setResult(data);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const accentFor: Record<Tool, string> = {
    port: colors.success,
    net: colors.cyan,
    dns: colors.purple,
    whois: colors.accent,
  };
  const accent = accentFor[active];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Network</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: botPad }} showsVerticalScrollIndicator={false}>
        <View style={[styles.segRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {TABS.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => { setActive(t.id); setResult(null); setError(null); }}
              style={[styles.seg, active === t.id && { backgroundColor: accentFor[t.id] + "22", borderRadius: 8 }]}
            >
              <MaterialCommunityIcons name={t.icon as any} size={16} color={active === t.id ? accentFor[t.id] : colors.mutedForeground} />
              <Text style={[styles.segLabel, { color: active === t.id ? accentFor[t.id] : colors.mutedForeground }]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>
            {active === "port" ? "HOST / IP" : active === "net" ? "SUBNET (e.g. 192.168.1.0/24)" : "DOMAIN"}
          </Text>
          <TextInput
            value={host}
            onChangeText={setHost}
            placeholder={active === "port" ? "192.168.1.1" : active === "net" ? "192.168.1.0/24" : "example.com"}
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground, backgroundColor: colors.input, borderColor: colors.border }]}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="ascii-capable"
          />
          {active === "port" && (
            <>
              <Text style={[styles.inputLabel, { color: colors.mutedForeground, marginTop: 10 }]}>PORT RANGE</Text>
              <TextInput
                value={ports}
                onChangeText={setPorts}
                placeholder="1-1024"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { color: colors.foreground, backgroundColor: colors.input, borderColor: colors.border }]}
                autoCapitalize="none"
                keyboardType="ascii-capable"
              />
            </>
          )}
          <Pressable
            onPress={runTool}
            disabled={loading || !host.trim()}
            style={[styles.btn, { backgroundColor: host.trim() ? accent : colors.muted, opacity: loading ? 0.6 : 1 }]}
          >
            <MaterialCommunityIcons name="play" size={16} color={host.trim() ? "#080D14" : colors.mutedForeground} />
            <Text style={[styles.btnText, { color: host.trim() ? "#080D14" : colors.mutedForeground }]}>
              {loading ? "Running…" : "Run"}
            </Text>
          </Pressable>
        </View>

        <ResultPanel loading={loading} error={error} data={result} emptyText="Enter a target and press Run" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.4 },
  segRow: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 2,
    marginBottom: 14,
  },
  seg: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 4,
  },
  segLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  inputCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.2,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    paddingVertical: 13,
    marginTop: 6,
  },
  btnText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
});
