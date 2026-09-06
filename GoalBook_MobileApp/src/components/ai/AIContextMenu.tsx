import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing, shadow } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface AIContextMenuProps {
  selectedText: string;
  onExplain: (text: string) => void;
  onSummarize: (text: string) => void;
  onBookmark: (text: string) => void;
  onClose: () => void;
}

export const AIContextMenu: React.FC<AIContextMenuProps> = ({
  selectedText,
  onExplain,
  onSummarize,
  onBookmark,
  onClose,
}) => {
  if (!selectedText) return null;

  return (
    <View style={[styles.container, shadow.lg]}>
      <TouchableOpacity
        style={styles.actionItem}
        onPress={() => onExplain(selectedText)}
      >
        <Ionicons name="bulb-outline" size={18} color="#FBBF24" />
        <Text style={styles.actionText}>Explain</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.actionItem}
        onPress={() => onSummarize(selectedText)}
      >
        <Ionicons name="sparkles-outline" size={18} color={colors.dark.primary} />
        <Text style={styles.actionText}>Summarize</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.actionItem}
        onPress={() => onBookmark(selectedText)}
      >
        <Ionicons name="bookmark-outline" size={18} color={colors.dark.secondary} />
        <Text style={styles.actionText}>Save Quote</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.actionItem} onPress={onClose}>
        <Ionicons name="close" size={18} color={colors.dark.textMuted} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.dark.border,
    alignSelf: 'center',
    marginVertical: spacing.xs,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  actionText: {
    color: colors.dark.text,
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: colors.dark.border,
  },
});
