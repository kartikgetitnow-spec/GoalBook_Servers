import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '../../constants/theme';
import { database } from '../../services/storage/database';
import { useAppStore } from '../../store';
import { Bookmark } from '../../types/models';

interface PassageInputModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPassage: (passage: string) => void;
  currentBookTitle?: string;
}

export const PassageInputModal: React.FC<PassageInputModalProps> = ({
  visible,
  onClose,
  onSelectPassage,
  currentBookTitle,
}) => {
  const [passageText, setPassageText] = useState('');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const activeBookContext = useAppStore((state) => state.activeBookContext);

  useEffect(() => {
    if (visible && activeBookContext?.bookId) {
      database.getBookmarks(activeBookContext.bookId).then((bms) => {
        setBookmarks(bms);
      }).catch(() => setBookmarks([]));
    }
  }, [visible, activeBookContext?.bookId]);

  const handleApply = () => {
    if (passageText.trim()) {
      onSelectPassage(passageText.trim());
      setPassageText('');
      onClose();
    }
  };

  const handlePickSample = (sample: string) => {
    setPassageText(sample);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.sheetContainer}>
              <View style={styles.handleBar} />

              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.title}>Target a Specific Passage</Text>
                  <Text style={styles.subtitle}>
                    Ask GoalBook AI to analyze or explain an excerpt from{' '}
                    {currentBookTitle || 'your active book'}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={colors.dark.textSecondary} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={4}
                placeholder="Paste or type the passage excerpt here..."
                placeholderTextColor={colors.dark.textMuted}
                value={passageText}
                onChangeText={setPassageText}
                textAlignVertical="top"
              />

              {bookmarks.length > 0 ? (
                <>
                  <Text style={styles.sampleHeader}>Or select a saved bookmark note:</Text>
                  <ScrollView style={styles.samplesScroll}>
                    {bookmarks.map((bm) => (
                      <TouchableOpacity
                        key={bm.id}
                        style={styles.sampleItem}
                        onPress={() => handlePickSample(bm.note || bm.title)}
                      >
                        <Ionicons name="bookmark-outline" size={14} color="#FBBF24" />
                        <Text numberOfLines={2} style={styles.sampleText}>
                          "{bm.note || bm.title}"
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              ) : (
                <Text style={styles.emptyBookmarksNote}>
                  Tip: Copy and paste text above from your book or notes.
                </Text>
              )}

              <View style={styles.actionsRow}>
                <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleApply}
                  disabled={!passageText.trim()}
                  style={[styles.applyBtn, !passageText.trim() && styles.disabledBtn]}
                >
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  <Text style={styles.applyBtnText}>Attach Excerpt</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.dark.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    maxHeight: '80%',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.dark.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.dark.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.dark.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  textInput: {
    backgroundColor: colors.dark.surfaceVariant,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    padding: spacing.md,
    color: colors.dark.text,
    fontSize: 13,
    minHeight: 90,
  },
  emptyBookmarksNote: {
    fontSize: 12,
    color: colors.dark.textMuted,
    fontStyle: 'italic',
    marginVertical: spacing.md,
  },
  sampleHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.dark.textMuted,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  samplesScroll: {
    maxHeight: 120,
    marginBottom: spacing.md,
  },
  sampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  sampleText: {
    flex: 1,
    fontSize: 11,
    color: colors.dark.textSecondary,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  cancelBtnText: {
    color: colors.dark.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.dark.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
