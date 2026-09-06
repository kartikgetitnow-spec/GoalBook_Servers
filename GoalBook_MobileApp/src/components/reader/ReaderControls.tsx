import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '../../constants/theme';

interface ReaderControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onOpenSettings: () => void;
  onOpenAI: () => void;
  onBookmark: () => void;
  isBookmarked: boolean;
  currentPage: number;
  totalPages: number;
}

export const ReaderControls: React.FC<ReaderControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onPrevPage,
  onNextPage,
  onOpenSettings,
  onOpenAI,
  onBookmark,
  isBookmarked,
  currentPage,
  totalPages,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.pageInfo}>
          Page {currentPage} of {totalPages}
        </Text>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity onPress={onOpenSettings} style={styles.iconButton}>
          <Ionicons name="text-outline" size={24} color={colors.dark.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPrevPage}
          disabled={currentPage <= 1}
          style={[styles.iconButton, currentPage <= 1 && styles.disabled]}
        >
          <Ionicons name="play-back" size={24} color={colors.dark.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onTogglePlay} style={styles.playButton}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={28}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNextPage}
          disabled={currentPage >= totalPages}
          style={[styles.iconButton, currentPage >= totalPages && styles.disabled]}
        >
          <Ionicons name="play-forward" size={24} color={colors.dark.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onBookmark} style={styles.iconButton}>
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={isBookmarked ? colors.dark.primary : colors.dark.text}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={onOpenAI} style={styles.aiButton}>
          <Ionicons name="sparkles" size={22} color="#FBBF24" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dark.surface,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  topRow: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  pageInfo: {
    fontSize: 12,
    color: colors.dark.textSecondary,
    fontWeight: '500',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.3,
  },
});
