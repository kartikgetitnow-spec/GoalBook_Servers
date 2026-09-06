import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Book } from '../../types/models';
import { colors, borderRadius, spacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration } from '../../utils/speedCalculator';

const PALETTES = [
  { bg: '#1E3A8A', border: '#3B82F6', text: '#93C5FD' },
  { bg: '#78350F', border: '#F59E0B', text: '#FDE68A' },
  { bg: '#064E3B', border: '#10B981', text: '#A7F3D0' },
  { bg: '#4C1D95', border: '#8B5CF6', text: '#DDD6FE' },
];

interface BookCardProps {
  book: Book;
  viewMode?: 'grid' | 'list';
  onPress: () => void;
  onResume?: () => void;
  onDetails?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  viewMode = 'grid',
  onPress,
  onResume,
  onDetails,
  onDelete,
  onToggleFavorite,
}) => {
  // Hash palette by book ID
  const paletteIndex =
    book.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % PALETTES.length;
  const palette = PALETTES[paletteIndex];

  const formatLastRead = (dateStr?: string) => {
    if (!dateStr) return 'Not started';
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffHours = Math.floor((now - then) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Read just now';
    if (diffHours < 24) return `Read ${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Read yesterday';
    if (diffDays < 7) return `Read ${diffDays}d ago`;
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (viewMode === 'list') {
    return (
      <TouchableOpacity activeOpacity={0.8} style={styles.listContainer} onPress={onPress}>
        {/* Thumbnail */}
        <View style={[styles.listCover, { backgroundColor: palette.bg, borderColor: palette.border }]}>
          <Ionicons name="book" size={26} color={palette.text} />
          <Text style={[styles.listCoverTag, { color: palette.text }]}>PDF</Text>
        </View>

        {/* Info */}
        <View style={styles.listDetails}>
          <View style={styles.titleRow}>
            <Text numberOfLines={1} style={styles.listTitle}>
              {book.title}
            </Text>
            {onToggleFavorite && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={book.isFavorite ? 'heart' : 'heart-outline'}
                  size={16}
                  color={book.isFavorite ? '#EF4444' : '#64748B'}
                />
              </TouchableOpacity>
            )}
          </View>

          <Text numberOfLines={1} style={styles.listAuthor}>
            {book.author || 'Unknown Author'}
          </Text>

          {/* Meta & Progress */}
          <View style={styles.listMetaRow}>
            <Text style={styles.listMetaText}>
              Page {book.currentPage}/{book.pageCount}
            </Text>
            <Text style={styles.listMetaDot}>•</Text>
            <Text style={styles.listMetaText}>{formatLastRead(book.lastReadAt)}</Text>
            <Text style={styles.listMetaDot}>•</Text>
            <Text style={styles.listProgressPercent}>{book.progressPercent}%</Text>
          </View>

          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.max(5, book.progressPercent)}%` },
              ]}
            />
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.listActions}>
          <TouchableOpacity
            style={styles.listResumeBtn}
            onPress={(e) => {
              e.stopPropagation();
              onResume ? onResume() : onPress();
            }}
          >
            <Ionicons name="play" size={14} color="#0B0F19" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.listMoreBtn}
            onPress={(e) => {
              e.stopPropagation();
              onDetails?.();
            }}
          >
            <Ionicons name="ellipsis-vertical" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  // Grid Card View
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.gridContainer} onPress={onPress}>
      {/* Cover Header */}
      <View style={[styles.gridCover, { backgroundColor: palette.bg, borderColor: palette.border }]}>
        <View style={styles.gridCoverTop}>
          <View style={styles.pdfBadge}>
            <Text style={styles.pdfBadgeText}>PDF</Text>
          </View>
          {onToggleFavorite && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={book.isFavorite ? 'heart' : 'heart-outline'}
                size={18}
                color={book.isFavorite ? '#EF4444' : 'rgba(255, 255, 255, 0.7)'}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.gridCoverCenter}>
          <Ionicons name="book" size={32} color={palette.text} />
        </View>

        <View style={styles.gridCoverBottom}>
          <Text style={[styles.gridPagesTag, { color: palette.text }]}>
            {book.pageCount} Pages
          </Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.gridBody}>
        <Text numberOfLines={1} style={styles.gridTitle}>
          {book.title}
        </Text>
        <Text numberOfLines={1} style={styles.gridAuthor}>
          {book.author || 'Unknown Author'}
        </Text>

        {/* Last Read Meta */}
        <Text style={styles.gridLastRead}>{formatLastRead(book.lastReadAt)}</Text>

        {/* Progress */}
        <View style={styles.gridProgressContainer}>
          <View style={styles.gridProgressRow}>
            <Text style={styles.gridProgressLabel}>Page {book.currentPage}</Text>
            <Text style={styles.gridProgressVal}>{book.progressPercent}%</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.max(5, book.progressPercent)}%` },
              ]}
            />
          </View>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.gridActionsRow}>
          <TouchableOpacity
            style={styles.gridResumeBtn}
            onPress={(e) => {
              e.stopPropagation();
              onResume ? onResume() : onPress();
            }}
          >
            <Ionicons name="play" size={13} color="#0B0F19" />
            <Text style={styles.gridResumeText}>Resume</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridDetailsBtn}
            onPress={(e) => {
              e.stopPropagation();
              onDetails?.();
            }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="information-circle-outline" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {onDelete && (
            <TouchableOpacity
              style={styles.gridDeleteBtn}
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Grid Styles
  gridContainer: {
    flex: 1,
    backgroundColor: '#151D2F',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#243048',
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  gridCover: {
    height: 105,
    padding: spacing.sm,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  gridCoverTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pdfBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  pdfBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  gridCoverCenter: {
    alignItems: 'center',
  },
  gridCoverBottom: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  gridPagesTag: {
    fontSize: 10,
    fontWeight: '700',
  },
  gridBody: {
    padding: spacing.sm,
    gap: 4,
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  gridAuthor: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
  },
  gridLastRead: {
    fontSize: 10,
    color: '#64748B',
  },
  gridProgressContainer: {
    marginTop: 4,
    gap: 3,
  },
  gridProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridProgressLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  gridProgressVal: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
  },
  gridActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  gridResumeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 5,
    borderRadius: borderRadius.xs,
    gap: 4,
  },
  gridResumeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0B0F19',
  },
  gridDetailsBtn: {
    padding: 3,
  },
  gridDeleteBtn: {
    padding: 3,
  },

  // List Styles
  listContainer: {
    backgroundColor: '#151D2F',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#243048',
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  listCover: {
    width: 60,
    height: 76,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  listCoverTag: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
  },
  listDetails: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    flex: 1,
    marginRight: 6,
  },
  listAuthor: {
    fontSize: 12,
    color: '#94A3B8',
  },
  listMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listMetaText: {
    fontSize: 11,
    color: '#64748B',
  },
  listMetaDot: {
    fontSize: 11,
    color: '#475569',
  },
  listProgressPercent: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#1E293B',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginTop: 2,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
  },
  listActions: {
    alignItems: 'center',
    gap: 8,
  },
  listResumeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listMoreBtn: {
    padding: 4,
  },
});
