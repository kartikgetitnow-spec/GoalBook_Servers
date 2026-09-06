import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
  Image,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { ChatMessage, ChatAttachment } from '../../types/models';
import { MessageBubble } from './MessageBubble';
import { QuickActions } from './QuickActions';
import { TypingIndicator } from './TypingIndicator';
import { ContextBar } from './ContextBar';
import { colors, borderRadius, spacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  loading: boolean;
  onSendMessage: (text: string, selectedText?: string, attachments?: ChatAttachment[]) => void;
  onOpenContextModal?: () => void;
  onOpenPassageModal?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  loading,
  onSendMessage,
  onOpenContextModal,
  onOpenPassageModal,
}) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const activeBookContext = useAppStore((state) => state.activeBookContext);
  const activePassageContext = useAppStore((state) => state.activePassageContext);
  const setActivePassageContext = useAppStore((state) => state.setActivePassageContext);

  useEffect(() => {
    // Scroll to end when new messages arrive or loading state changes
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, loading]);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const isImage = asset.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(asset.name);

        const newAttachment: ChatAttachment = {
          id: `att_${Date.now()}`,
          name: asset.name,
          uri: asset.uri,
          mimeType: asset.mimeType,
          size: asset.size,
          type: isImage ? 'image' : 'file',
        };

        setAttachments((prev) => [...prev, newAttachment]);
      }
    } catch (err: any) {
      Alert.alert('Attachment Error', err?.message || 'Failed to select document.');
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSend = () => {
    if ((!input.trim() && attachments.length === 0) || loading) return;

    const textToSend = input.trim();
    const attachmentsToSend = attachments.length > 0 ? [...attachments] : undefined;

    setInput('');
    setAttachments([]);

    onSendMessage(
      textToSend || (attachmentsToSend ? `Please analyze this attached file: ${attachmentsToSend[0].name}` : ''),
      activePassageContext || undefined,
      attachmentsToSend
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Context Bar showing active book, chapter, and passage status */}
      <ContextBar
        context={activeBookContext}
        activePassage={activePassageContext}
        onChangeContext={() => onOpenContextModal?.()}
        onOpenPassageModal={() => onOpenPassageModal?.()}
        onClearPassage={() => setActivePassageContext(null)}
      />

      {/* Message Stream */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={styles.messageList}
        ListFooterComponent={loading ? <TypingIndicator /> : null}
      />

      {/* Quick Actions Tray */}
      <QuickActions
        onSelectAction={(prompt) => {
          onSendMessage(prompt, activePassageContext || undefined);
        }}
        bookTitle={activeBookContext?.title}
        chapterTitle={activeBookContext?.chapterTitle}
      />

      {/* Attachments Preview Tray */}
      {attachments.length > 0 && (
        <View style={styles.attachmentsTray}>
          {attachments.map((att) => (
            <View key={att.id} style={styles.attachmentChip}>
              {att.type === 'image' ? (
                <Image source={{ uri: att.uri }} style={styles.previewThumb} />
              ) : (
                <Ionicons name="document-text" size={16} color="#60A5FA" />
              )}
              <Text numberOfLines={1} style={styles.attName}>
                {att.name}
              </Text>
              <TouchableOpacity
                onPress={() => handleRemoveAttachment(att.id)}
                style={styles.removeAttBtn}
              >
                <Ionicons name="close-circle" size={16} color={colors.dark.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        {/* Attachment Button */}
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={handlePickDocument}
          activeOpacity={0.7}
        >
          <Ionicons name="attach" size={22} color={colors.dark.textSecondary} />
        </TouchableOpacity>

        {/* Passage Button */}
        <TouchableOpacity
          style={[styles.toolBtn, activePassageContext ? styles.toolBtnActive : null]}
          onPress={() => onOpenPassageModal?.()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="bookmark-outline"
            size={19}
            color={activePassageContext ? '#FBBF24' : colors.dark.textSecondary}
          />
        </TouchableOpacity>

        {/* Text Input */}
        <TextInput
          style={styles.input}
          placeholder={
            activePassageContext
              ? 'Ask about the selected passage...'
              : activeBookContext
              ? `Ask GoalBook AI about ${activeBookContext.title}...`
              : 'Ask GoalBook AI anything...'
          }
          placeholderTextColor={colors.dark.textMuted}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline
        />

        {/* Send Button */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={(!input.trim() && attachments.length === 0) || loading}
          style={[
            styles.sendButton,
            (!input.trim() && attachments.length === 0) || loading
              ? styles.disabledSend
              : null,
          ]}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  messageList: {
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
  attachmentsTray: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.dark.surface,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
    gap: 8,
    flexWrap: 'wrap',
  },
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.dark.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.dark.border,
    maxWidth: 220,
  },
  previewThumb: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  attName: {
    fontSize: 11,
    color: colors.dark.text,
    maxWidth: 140,
  },
  removeAttBtn: {
    padding: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.dark.surface,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
    gap: 8,
  },
  toolBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.dark.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBtnActive: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  input: {
    flex: 1,
    backgroundColor: colors.dark.surfaceVariant,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    color: colors.dark.text,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledSend: {
    opacity: 0.35,
  },
});
