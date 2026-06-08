import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { serverUrl, token, isConnected, setServerUrl, setToken, testConnection } = useApp();

  const [urlDraft, setUrlDraft] = useState(serverUrl);
  const [tokenDraft, setTokenDraft] = useState(token);
  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 80;

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    await setServerUrl(urlDraft.trim());
    await setToken(tokenDraft.trim());
    setSaving(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Saved", "Settings saved successfully.");
  };

  const handleTest = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTesting(true);
    const ok = await testConnection();
    setTesting(false);
    Haptics.notificationAsync(
      ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    );
    Alert.alert(ok ? "Connected" : "Failed", ok ? "Server is reachable." : "Cannot reach server. Check URL and token.");
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
        <View style={[styles.statusDot, { backgroundColor: isConnected ? colors.primary : colors.destructive }]} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: botPad, gap: 14 }} showsVerticalScrollIndicator={false}>

        {/* Server Config */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHead}>
            <MaterialCommunityIcons name="server-network" size={18} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Server Configuration</Text>
          </View>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>SERVER URL</Text>
          <TextInput
            value={urlDraft}
            onChangeText={setUrlDraft}
            placeholder="https://your-server.com"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground, backgroundColor: colors.input, borderColor: colors.border }]}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 12 }]}>API TOKEN / GITHUB TOKEN</Text>
          <View style={styles.tokenRow}>
            <TextInput
              value={tokenDraft}
              onChangeText={setTokenDraft}
              placeholder="ghp_xxxxxxxxxxxx  أو  Bearer token"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showToken}
              style={[
                styles.input,
                styles.tokenInput,
                { color: colors.foreground, backgroundColor: colors.input, borderColor: colors.primary + "66" },
              ]}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable
              onPress={() => setShowToken((v) => !v)}
              style={[styles.eyeBtn, { backgroundColor: colors.input, borderColor: colors.border }]}
            >
              <MaterialCommunityIcons
                name={showToken ? "eye-off" : "eye"}
                size={20}
                color={colors.mutedForeground}
              />
            </Pressable>
          </View>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            Token مخزّن محليًا على الجهاز فقط — لا يُرسل لأي جهة غير السيرفر اللي تحدده.
          </Text>

          <View style={styles.btnRow}>
            <Pressable
              onPress={handleTest}
              disabled={testing || !urlDraft.trim()}
              style={[styles.btn, styles.btnOutline, { borderColor: colors.accent, flex: 1 }]}
            >
              {testing ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <MaterialCommunityIcons name="connection" size={16} color={colors.accent} />
              )}
              <Text style={[styles.btnText, { color: colors.accent }]}>Test</Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={[styles.btn, { backgroundColor: colors.primary, flex: 2 }]}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#080D14" />
              ) : (
                <MaterialCommunityIcons name="content-save" size={16} color="#080D14" />
              )}
              <Text style={[styles.btnText, { color: "#080D14" }]}>Save Settings</Text>
            </Pressable>
          </View>
        </View>

        {/* Status */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHead}>
            <MaterialCommunityIcons name="information-outline" size={18} color={colors.mutedForeground} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Connection Status</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: isConnected ? colors.primary + "22" : colors.destructive + "22" }]}>
              <View style={[styles.dot, { backgroundColor: isConnected ? colors.primary : colors.destructive }]} />
              <Text style={[styles.statusLabel, { color: isConnected ? colors.primary : colors.destructive }]}>
                {isConnected ? "Connected" : "Disconnected"}
              </Text>
            </View>
            {serverUrl ? (
              <Text style={[styles.urlText, { color: colors.mutedForeground }]} numberOfLines={1}>
                {serverUrl.replace(/https?:\/\//, "")}
              </Text>
            ) : (
              <Text style={[styles.urlText, { color: colors.mutedForeground }]}>No server configured</Text>
            )}
          </View>
        </View>

        {/* About */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHead}>
            <MaterialCommunityIcons name="shield-half-full" size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>SecKit v1.0</Text>
          </View>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            Professional security toolkit — Port Scanner, Network Discovery, DNS, WHOIS, APK Analyzer, Frida Scripts, HTTP Tester, SSL Inspector.
          </Text>
        </View>

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
  title: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.4 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  section: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 8 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  label: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  tokenRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  tokenInput: { flex: 1 },
  eyeBtn: {
    width: 46,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hint: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    paddingVertical: 13,
  },
  btnOutline: { borderWidth: 1, backgroundColor: "transparent" },
  btnText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  statusLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  urlText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
});
