import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ResultPanel } from "@/components/ResultPanel";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type Tool = "apk" | "frida" | "hex";

const TABS: { id: Tool; label: string; icon: string }[] = [
  { id: "apk", label: "APK Analyzer", icon: "android" },
  { id: "frida", label: "Frida", icon: "needle" },
  { id: "hex", label: "Hex Viewer", icon: "matrix" },
];

const FRIDA_SCRIPTS = [
  { name: "SSL Bypass", desc: "Disable certificate pinning", script: "ssl_bypass" },
  { name: "Root Detection", desc: "Bypass root checks", script: "root_bypass" },
  { name: "Anti-Debug", desc: "Remove anti-debugging", script: "anti_debug" },
  { name: "Memory Dump", desc: "Dump process memory", script: "mem_dump" },
];

export default function REScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { callTool } = useApp();
  const [active, setActive] = useState<Tool>("apk");
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [runningScript, setRunningScript] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 80;

  const accentFor: Record<Tool, string> = {
    apk: colors.success,
    frida: colors.destructive,
    hex: colors.warning,
  };
  const accent = accentFor[active];

  const runApk = async () => {
    if (!target.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true); setResult(null); setError(null);
    try {
      const data = await callTool("/re/apk", "POST", { path: target.trim() });
      setResult(data);
    } catch (e: any) { setError(e?.message ?? "Error"); }
    finally { setLoading(false); }
  };

  const runHex = async () => {
    if (!target.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true); setResult(null); setError(null);
    try {
      const data = await callTool("/re/hex", "POST", { path: target.trim(), offset: 0, length: 256 });
      setResult(data);
    } catch (e: any) { setError(e?.message ?? "Error"); }
    finally { setLoading(false); }
  };

  const runFrida = async (script: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setRunningScript(script); setResult(null); setError(null);
    try {
      const data = await callTool("/re/frida", "POST", { script, target: target.trim() });
      setResult(data);
    } catch (e: any) { setError(e?.message ?? "Error"); }
    finally { setRunningScript(null); }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Reverse Eng.</Text>
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

        {(active === "apk" || active === "hex") && (
          <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>
              {active === "apk" ? "APK PATH ON SERVER" : "FILE PATH ON SERVER"}
            </Text>
            <TextInput
              value={target}
              onChangeText={setTarget}
              placeholder={active === "apk" ? "/data/app/target.apk" : "/data/local/tmp/file.bin"}
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.input, borderColor: colors.border }]}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable
              onPress={active === "apk" ? runApk : runHex}
              disabled={loading || !target.trim()}
              style={[styles.btn, { backgroundColor: target.trim() ? accent : colors.muted }]}
            >
              <MaterialCommunityIcons name="play" size={16} color={target.trim() ? "#080D14" : colors.mutedForeground} />
              <Text style={[styles.btnText, { color: target.trim() ? "#080D14" : colors.mutedForeground }]}>
                {loading ? "Analyzing…" : "Analyze"}
              </Text>
            </Pressable>
          </View>
        )}

        {active === "frida" && (
          <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>TARGET PROCESS / PACKAGE</Text>
            <TextInput
              value={target}
              onChangeText={setTarget}
              placeholder="com.target.app"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.input, borderColor: colors.border }]}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={[styles.inputLabel, { color: colors.mutedForeground, marginTop: 10 }]}>SCRIPTS</Text>
            {FRIDA_SCRIPTS.map((s) => (
              <Pressable
                key={s.script}
                onPress={() => runFrida(s.script)}
                disabled={!!runningScript}
                style={[styles.scriptRow, { backgroundColor: colors.input, borderColor: colors.border }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.scriptName, { color: colors.foreground }]}>{s.name}</Text>
                  <Text style={[styles.scriptDesc, { color: colors.mutedForeground }]}>{s.desc}</Text>
                </View>
                {runningScript === s.script ? (
                  <MaterialCommunityIcons name="loading" size={18} color={colors.destructive} />
                ) : (
                  <MaterialCommunityIcons name="play-circle" size={22} color={colors.destructive} />
                )}
              </Pressable>
            ))}
          </View>
        )}

        <ResultPanel loading={loading} error={error} data={result} emptyText="Configure server and select a tool" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.4 },
  segRow: {
    flexDirection: "row", borderRadius: 12, borderWidth: 1,
    padding: 4, gap: 2, marginBottom: 14,
  },
  seg: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 8, gap: 4 },
  segLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  inputCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 6 },
  inputLabel: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },
  input: {
    borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, fontFamily: "Inter_400Regular",
  },
  btn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 10, paddingVertical: 13, marginTop: 6,
  },
  btnText: { fontSize: 14, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
  scriptRow: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 10, borderWidth: 1,
    padding: 12, marginTop: 6, gap: 10,
  },
  scriptName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  scriptDesc: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
});
