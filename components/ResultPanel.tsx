import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface ResultPanelProps {
  loading?: boolean;
  error?: string | null;
  data?: any;
  emptyText?: string;
}

export function ResultPanel({ loading, error, data, emptyText = "No results yet" }: ResultPanelProps) {
  const colors = useColors();

  if (loading) {
    return (
      <View style={[styles.box, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ActivityIndicator color={colors.primary} size="small" />
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Running...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.box, { backgroundColor: colors.card, borderColor: colors.destructive + "44" }]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={20} color={colors.destructive} />
        <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.box, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <MaterialCommunityIcons name="console" size={20} color={colors.mutedForeground} />
        <Text style={[styles.label, { color: colors.mutedForeground }]}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.resultWrap, { backgroundColor: colors.card, borderColor: colors.primary + "44" }]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.json, { color: colors.primary }]}>
          {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  resultWrap: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    maxHeight: 280,
    overflow: "hidden",
  },
  scroll: { padding: 14 },
  json: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    letterSpacing: 0.2,
  },
});
