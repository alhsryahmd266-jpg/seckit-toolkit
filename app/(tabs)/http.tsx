import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ResultPanel } from "@/components/ResultPanel";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

export default function HttpScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { callTool } = useApp();
  const [tab, setTab] = useState<"builder" | "ssl">("builder");
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("{}");
  const [body, setBody] = useState("");
  const [sslHost, setSslHost] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 80;

  const runRequest = async () => {
    if (!url.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true); setResult(null); setError(null);
    try {
      let parsedHeaders: object = {};
      try { parsedHeaders = JSON.parse(headers); } catch {}
      const data = await callTool("/http/request", "POST", {
        method,
        url: url.trim(),
        headers: parsedHeaders,
        body: body.trim() || undefined,
      });
      setResult(data);
    } catch (e: any) { setError(e?.message ?? "Error"); }
    finally { setLoading(false); }
  };

  const runSsl = async () => {
    if (!sslHost.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true); setResult(null); setError(null);
    try {
      const data = await callTool(`/http/ssl?host=${encodeURIComponent(sslHost.trim())}`);
      setResult(data);
    } catch (e: any) { setError(e?.message ?? "Error"); }
    finally { setLoading(false); }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>HTTP Tools</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: botPad }} showsVerticalScrollIndicator={false}>
        <View style={[styles.segRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {(["builder", "ssl"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => { setTab(t); setResult(null); setError(null); }}
              style={[styles.seg, tab === t && { backgroundColor: colors.cyan + "22", borderRadius: 8 }]}
            >
              <MaterialCommunityIcons
                name={t === "builder" ? "web" : "shield-lock"}
                size={16}
                color={tab === t ? colors.cyan : colors.mutedForeground}
              />
              <Text style={[styles.segLabel, { color: tab === t ? colors.cyan : colors.mutedForeground }]}>
                {t === "builder" ? "Request Builder" : "SSL Inspector"}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === "builder" && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>METHOD</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {METHODS.map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => setMethod(m)}
                    style={[styles.methodPill, {
                      backgroundColor: method === m ? colors.cyan + "22" : colors.input,
                      borderColor: method === m ? colors.cyan : colors.border,
                    }]}
                  >
                    <Text style={[styles.methodText, { color: method === m ? colors.cyan : colors.mutedForeground }]}>{m}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>URL</Text>
            <TextInput
              value={url}
              onChangeText={setUrl}
              placeholder="https://api.example.com/endpoint"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.input, borderColor: colors.border }]}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>HEADERS (JSON)</Text>
            <TextInput
              value={headers}
              onChangeText={setHeaders}
              placeholder='{"Authorization": "Bearer ..."}'
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={3}
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.input, borderColor: colors.border, minHeight: 70 }]}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {(method === "POST" || method === "PUT" || method === "PATCH") && (
              <>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>BODY</Text>
                <TextInput
                  value={body}
                  onChangeText={setBody}
                  placeholder='{"key": "value"}'
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                  numberOfLines={3}
                  style={[styles.input, { color: colors.foreground, backgroundColor: colors.input, borderColor: colors.border, minHeight: 70 }]}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </>
            )}
            <Pressable
              onPress={runRequest}
              disabled={loading || !url.trim()}
              style={[styles.btn, { backgroundColor: url.trim() ? colors.cyan : colors.muted }]}
            >
              <MaterialCommunityIcons name="send" size={16} color={url.trim() ? "#080D14" : colors.mutedForeground} />
              <Text style={[styles.btnText, { color: url.trim() ? "#080D14" : colors.mutedForeground }]}>
                {loading ? "Sending…" : "Send Request"}
              </Text>
            </Pressable>
          </View>
        )}

        {tab === "ssl" && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>HOST / DOMAIN</Text>
            <TextInput
              value={sslHost}
              onChangeText={setSslHost}
              placeholder="example.com"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.input, borderColor: colors.border }]}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable
              onPress={runSsl}
              disabled={loading || !sslHost.trim()}
              style={[styles.btn, { backgroundColor: sslHost.trim() ? colors.purple : colors.muted }]}
            >
              <MaterialCommunityIcons name="shield-search" size={16} color={sslHost.trim() ? "#fff" : colors.mutedForeground} />
              <Text style={[styles.btnText, { color: sslHost.trim() ? "#fff" : colors.mutedForeground }]}>
                {loading ? "Checking…" : "Inspect SSL"}
              </Text>
            </Pressable>
          </View>
        )}

        <ResultPanel loading={loading} error={error} data={result} emptyText="Configure request and press Send" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.4 },
  segRow: { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 4, gap: 2, marginBottom: 14 },
  seg: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 8, gap: 4 },
  segLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 8 },
  label: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },
  input: {
    borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 13, fontFamily: "Inter_400Regular",
  },
  btn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 10, paddingVertical: 13, marginTop: 4,
  },
  btnText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  methodPill: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  methodText: { fontSize: 12, fontFamily: "Inter_700Bold" },
});
