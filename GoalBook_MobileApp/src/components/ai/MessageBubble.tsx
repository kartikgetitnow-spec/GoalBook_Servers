import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ChatMessage, ChatAttachment } from '../../types/models';
import { colors, borderRadius, spacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MessageBubbleProps {
  message: ChatMessage;
  onAttachmentPress?: (attachment: ChatAttachment) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onAttachmentPress,
}) => {
  const isUser = message.sender === 'user';
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.botContainer,
      ]}
    >
      {!isUser && (
        <View style={styles.botAvatar}>
          <Ionicons name="sparkles" size={14} color="#FBBF24" />
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.botBubble,
        ]}
      >
        {/* Context metadata badges */}
        {(message.bookTitle || message.chapterTitle || message.referencedPage) && (
          <View style={styles.badgeRow}>
            {message.bookTitle && (
              <View style={styles.contextBadge}>
                <Ionicons name="book-outline" size={10} color={isUser ? '#BFDBFE' : '#94A3B8'} />
                <Text
                  numberOfLines={1}
                  style={[styles.contextBadgeText, isUser && styles.userBadgeText]}
                >
                  {message.bookTitle}
                </Text>
              </View>
            )}
            {message.referencedPage && (
              <View style={styles.pageBadge}>
                <Text style={[styles.pageBadgeText, isUser && styles.userBadgeText]}>
                  P. {message.referencedPage}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Quoted passage card */}
        {message.selectedPassage && (
          <View
            style={[
              styles.passageCard,
              isUser ? styles.userPassageCard : styles.botPassageCard,
            ]}
          >
            <View style={styles.passageHeader}>
              <Ionicons
                name="chatbox-ellipses-outline"
                size={12}
                color={isUser ? '#93C5FD' : '#FBBF24'}
              />
              <Text
                style={[
                  styles.passageTag,
                  isUser ? styles.userPassageTag : styles.botPassageTag,
                ]}
              >
                QUOTED PASSAGE
              </Text>
            </View>
            <Text
              numberOfLines={3}
              style={[
                styles.passageText,
                isUser ? styles.userPassageText : styles.botPassageText,
              ]}
            >
              "{message.selectedPassage}"
            </Text>
          </View>
        )}

        {/* Attachments preview */}
        {message.attachments && message.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            {message.attachments.map((att) => (
              <TouchableOpacity
                key={att.id}
                style={[
                  styles.attachmentCard,
                  isUser ? styles.userAttachmentCard : styles.botAttachmentCard,
                ]}
                onPress={() => onAttachmentPress?.(att)}
                activeOpacity={0.8}
              >
                {att.type === 'image' ? (
                  <View style={styles.imageAttachmentBox}>
                    <Image source={{ uri: att.uri }} style={styles.attachmentThumbnail} />
                    <View style={styles.imageOverlayTag}>
                      <Ionicons name="image" size={10} color="#FFFFFF" />
                      <Text style={styles.imageOverlayText}>IMAGE</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.fileAttachmentRow}>
                    <View style={styles.fileIconBox}>
                      <Ionicons
                        name="document-text"
                        size={16}
                        color={isUser ? '#2563EB' : '#FBBF24'}
                      />
                    </View>
                    <View style={styles.fileMeta}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.fileName,
                          isUser && styles.userFileName,
                        ]}
                      >
                        {att.name}
                      </Text>
                      {att.size ? (
                        <Text style={styles.fileSize}>
                          {(att.size / 1024).toFixed(0)} KB
                        </Text>
                      ) : null}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Body Text / Markdown */}
        <View style={styles.contentBody}>
          <MarkdownRenderer content={message.content} isUser={isUser} />
        </View>

        {/* Timestamp */}
        <View style={styles.footerRow}>
          <Text
            style={[
              styles.timestamp,
              isUser ? styles.userTimestamp : styles.botTimestamp,
            ]}
          >
            {formattedTime}
          </Text>
        </View>
      </View>

      {isUser && (
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={13} color="#FFFFFF" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  botContainer: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '82%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    backgroundColor: colors.dark.primary,
    borderBottomRightRadius: borderRadius.xs,
  },
  botBubble: {
    backgroundColor: colors.dark.surfaceVariant,
    borderBottomLeftRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  contextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  contextBadgeText: {
    fontSize: 10,
    color: colors.dark.textSecondary,
    fontWeight: '600',
  },
  pageBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  pageBadgeText: {
    fontSize: 10,
    color: colors.dark.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  userBadgeText: {
    color: '#DBEAFE',
  },
  passageCard: {
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  userPassageCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderLeftColor: '#93C5FD',
  },
  botPassageCard: {
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderLeftColor: '#F59E0B',
  },
  passageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  passageTag: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  userPassageTag: {
    color: '#93C5FD',
  },
  botPassageTag: {
    color: '#FBBF24',
  },
  passageText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  userPassageText: {
    color: '#E0E7FF',
  },
  botPassageText: {
    color: '#FDE68A',
  },
  attachmentsContainer: {
    marginBottom: 8,
    gap: 6,
  },
  attachmentCard: {
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  userAttachmentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  botAttachmentCard: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  imageAttachmentBox: {
    position: 'relative',
  },
  attachmentThumbnail: {
    width: 200,
    height: 120,
    borderRadius: borderRadius.sm,
    backgroundColor: '#000',
  },
  imageOverlayTag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  imageOverlayText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fileAttachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
  },
  fileIconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileMeta: {
    flex: 1,
  },
  fileName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.dark.text,
  },
  userFileName: {
    color: '#FFFFFF',
  },
  fileSize: {
    fontSize: 10,
    color: colors.dark.textMuted,
  },
  contentBody: {
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  botTimestamp: {
    color: colors.dark.textMuted,
  },
});
