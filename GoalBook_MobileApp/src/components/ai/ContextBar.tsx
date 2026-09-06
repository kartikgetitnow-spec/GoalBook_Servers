import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '../../constants/theme';
import { BookContext } from '../../store/slices/aiSlice';

interface ContextBarProps {
  context: BookContext | null;
  activePassage: string | null;
  onChangeContext: () => void;
  onOpenPassageModal: () => void;
  onClearPassage: () => void;
}

export const ContextBar: React.FC<ContextBarProps> = ({
  context,
  activePassage,
  onChangeContext,
  onOpenPassageModal,
  onClearPassage,
}) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.bookContextBtn}
          onPress={onChangeContext}
          activeOpacity={0.7}
        >
          <View style={styles.bookIconPill}>
            <Ionicons name="book" size={12} color="#60A5FA" />
          </View>
          <View style={styles.metaColumn}>
            <Text numberOfLines={1} style={styles.bookTitle}>
              {context ? context.title : 'General Assistant (No Book)'}
            </Text>
            {context ? (
              <Text numberOfLines={1} style={styles.chapterText}>
                {context.chapterTitle} · P. {context.pageNumber}
              </Text>
            ) : (
              <Text style={styles.chapterText}>Tap to link a book context</Text>
            )}
          </View>
          <Ionicons name="chevron-down" size={14} color={colors.dark.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.passageBtn, activePassage ? styles.passageBtnActive : null]}
          onPress={onOpenPassageModal}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activePassage ? 'chatbox-ellipses' : 'chatbox-ellipses-outline'}
            size={14}
            color={activePassage ? '#FBBF24' : colors.dark.textSecondary}
          />
          <Text
            style={[styles.passageBtnText, activePassage ? styles.passageBtnTextActive : null]}
          >
            {activePassage ? 'Passage Set' : 'Passage'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Passage Excerpt Pill if selected */}
      {activePassage && (
        <View style={styles.activePassageRow}>
          <View style={styles.quoteIconBadge}>
            <Ionicons name="bookmark" size={10} color="#FBBF24" />
          </View>
          <Text numberOfLines={1} style={styles.activePassagePreview}>
            "{activePassage}"
          </Text>
          <TouchableOpacity onPress={onClearPassage} style={styles.clearPassageBtn}>
            <Ionicons name="close-circle" size={16} color={colors.dark.textMuted} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    gap: spacing.sm,
  },
  bookContextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.dark.surfaceVariant,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  bookIconPill: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaColumn: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.dark.text,
  },
  chapterText: {
    fontSize: 10,
    color: colors.dark.textMuted,
  },
  passageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.dark.surfaceVariant,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  passageBtnActive: {
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  passageBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.dark.textSecondary,
  },
  passageBtnTextActive: {
    color: '#FBBF24',
  },
  activePassageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: 8,
    gap: 6,
  },
  quoteIconBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePassagePreview: {
    flex: 1,
    fontSize: 11,
    fontStyle: 'italic',
    color: '#FDE68A',
  },
  clearPassageBtn: {
    padding: 2,
  },
});
