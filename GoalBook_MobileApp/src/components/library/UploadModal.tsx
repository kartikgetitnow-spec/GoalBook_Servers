import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { pickPdfDocument } from '../../utils/pdfParser';
import { Book } from '../../types/models';
import { colors, borderRadius, spacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { formatFileSize } from '../../utils/textFormatter';

interface UploadModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveBook: (book: Book) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  visible,
  onClose,
  onSaveBook,
}) => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePickFile = async () => {
    try {
      setLoading(true);
      const book = await pickPdfDocument();
      if (book) {
        setSelectedBook(book);
        setTitle(book.title);
      }
    } catch (e) {
      console.warn('File pick error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedBook) return;
    const finalBook: Book = {
      ...selectedBook,
      title: title.trim() || selectedBook.title,
      author: author.trim() || 'Author',
    };
    onSaveBook(finalBook);
    setSelectedBook(null);
    setTitle('');
    setAuthor('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>Add PDF Book</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.dark.text} />
            </TouchableOpacity>
          </View>

          {!selectedBook ? (
            <TouchableOpacity
              style={styles.dropZone}
              onPress={handlePickFile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="large" color={colors.dark.primary} />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={48}
                    color={colors.dark.primary}
                  />
                  <Text style={styles.uploadPrompt}>Tap to select a PDF file</Text>
                  <Text style={styles.uploadSubtext}>Supports books and papers</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.formContainer}>
              <View style={styles.fileSelectedRow}>
                <Ionicons name="document-text" size={24} color={colors.dark.primary} />
                <View style={styles.fileDetails}>
                  <Text numberOfLines={1} style={styles.fileName}>
                    {selectedBook.title}.pdf
                  </Text>
                  <Text style={styles.fileSize}>
                    {formatFileSize(selectedBook.fileSize || 0)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedBook(null)}>
                  <Ionicons name="trash-outline" size={20} color={colors.dark.error} />
                </TouchableOpacity>
              </View>

              <Input
                label="Book Title"
                value={title}
                onChangeText={setTitle}
                placeholder="Enter title"
              />

              <Input
                label="Author"
                value={author}
                onChangeText={setAuthor}
                placeholder="Enter author name"
              />

              <Button
                title="Add to Library"
                onPress={handleConfirm}
                style={styles.confirmButton}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.dark.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.dark.text,
  },
  dropZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.dark.border,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dark.surfaceVariant,
    marginVertical: spacing.md,
  },
  uploadPrompt: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.dark.text,
    marginTop: spacing.sm,
  },
  uploadSubtext: {
    fontSize: 12,
    color: colors.dark.textSecondary,
    marginTop: 2,
  },
  formContainer: {
    marginVertical: spacing.sm,
  },
  fileSelectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surfaceVariant,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.dark.text,
  },
  fileSize: {
    fontSize: 11,
    color: colors.dark.textMuted,
  },
  confirmButton: {
    marginTop: spacing.sm,
  },
});
