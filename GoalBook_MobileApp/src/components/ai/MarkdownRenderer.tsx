import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, spacing } from '../../constants/theme';

interface MarkdownRendererProps {
  content: string;
  isUser?: boolean;
}

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(code);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Basic syntax coloring helper for lines
  const renderHighlightedCode = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let isComment = line.trim().startsWith('//') || line.trim().startsWith('#');
      return (
        <Text
          key={idx}
          style={[
            styles.codeLine,
            isComment && styles.codeComment,
          ]}
        >
          {line}
        </Text>
      );
    });
  };

  return (
    <View style={styles.codeContainer}>
      <View style={styles.codeHeader}>
        <View style={styles.codeLangGroup}>
          <Ionicons name="code-slash-outline" size={13} color="#94A3B8" />
          <Text style={styles.codeLangText}>
            {language ? language.toUpperCase() : 'CODE'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleCopy}
          style={styles.copyBtn}
          activeOpacity={0.7}
        >
          <Ionicons
            name={copied ? 'checkmark' : 'copy-outline'}
            size={13}
            color={copied ? '#10B981' : '#94A3B8'}
          />
          <Text style={[styles.copyBtnText, copied && styles.copyBtnSuccess]}>
            {copied ? 'Copied' : 'Copy'}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.codeScroll}>
        <View style={styles.codeBody}>
          {renderHighlightedCode(code)}
        </View>
      </ScrollView>
    </View>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  isUser = false,
}) => {
  // If message is from user, render plain text with inline styling
  if (isUser) {
    return <Text style={styles.userText}>{content}</Text>;
  }

  // Parse code blocks vs markdown sections
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const preText = content.substring(lastIndex, match.index);
    if (preText) {
      elements.push(
        <View key={`text_${lastIndex}`} style={styles.mdBlock}>
          {renderMarkdownLines(preText)}
        </View>
      );
    }

    const lang = match[1] || '';
    const code = match[2] || '';
    elements.push(
      <CodeBlock key={`code_${match.index}`} language={lang} code={code.trim()} />
    );

    lastIndex = match.index + match[0].length;
  }

  const remainingText = content.substring(lastIndex);
  if (remainingText) {
    elements.push(
      <View key={`text_${lastIndex}`} style={styles.mdBlock}>
        {renderMarkdownLines(remainingText)}
      </View>
    );
  }

  return <View style={styles.container}>{elements}</View>;
};

function renderMarkdownLines(text: string): React.ReactNode {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return <View key={idx} style={styles.emptyLine} />;
    }

    // Headings
    if (line.startsWith('### ')) {
      return (
        <Text key={idx} style={styles.h3}>
          {renderInlineFormatting(line.substring(4))}
        </Text>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <Text key={idx} style={styles.h2}>
          {renderInlineFormatting(line.substring(3))}
        </Text>
      );
    }
    if (line.startsWith('# ')) {
      return (
        <Text key={idx} style={styles.h1}>
          {renderInlineFormatting(line.substring(2))}
        </Text>
      );
    }

    // Blockquote
    if (line.startsWith('> ')) {
      return (
        <View key={idx} style={styles.blockquote}>
          <Text style={styles.blockquoteText}>
            {renderInlineFormatting(line.substring(2))}
          </Text>
        </View>
      );
    }

    // Bullet points
    if (line.startsWith('* ') || line.startsWith('- ') || line.startsWith('• ')) {
      return (
        <View key={idx} style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <Text style={styles.bulletText}>
            {renderInlineFormatting(line.substring(2))}
          </Text>
        </View>
      );
    }

    // Numbered list: e.g. "1. "
    const numMatch = line.match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      return (
        <View key={idx} style={styles.numberedRow}>
          <Text style={styles.numberedIndex}>{numMatch[1]}.</Text>
          <Text style={styles.numberedText}>
            {renderInlineFormatting(numMatch[2])}
          </Text>
        </View>
      );
    }

    // Regular line
    return (
      <Text key={idx} style={styles.paragraph}>
        {renderInlineFormatting(line)}
      </Text>
    );
  });
}

function renderInlineFormatting(line: string): React.ReactNode {
  // Regex to split by bold (**text**), italic (*text*), and inline code (`code`)
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <Text key={match.index} style={styles.boldText}>
          {token.slice(2, -2)}
        </Text>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <View key={match.index} style={styles.inlineCodePill}>
          <Text style={styles.inlineCodeText}>{token.slice(1, -1)}</Text>
        </View>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <Text key={match.index} style={styles.italicText}>
          {token.slice(1, -1)}
        </Text>
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < line.length) {
    parts.push(line.substring(lastIndex));
  }

  return <>{parts}</>;
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  mdBlock: {
    gap: 3,
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 21,
  },
  paragraph: {
    color: colors.dark.text,
    fontSize: 14,
    lineHeight: 21,
  },
  boldText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  italicText: {
    fontStyle: 'italic',
    color: colors.dark.textSecondary,
  },
  emptyLine: {
    height: 6,
  },
  h1: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FBBF24',
    marginTop: 6,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 15,
    fontWeight: '700',
    color: '#60A5FA',
    marginTop: 5,
    marginBottom: 3,
  },
  h3: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34D399',
    marginTop: 4,
    marginBottom: 2,
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    paddingLeft: spacing.sm,
    marginVertical: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
  },
  blockquoteText: {
    color: '#FDE68A',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
    gap: 8,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.dark.primary,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    color: colors.dark.text,
    fontSize: 13.5,
    lineHeight: 20,
  },
  numberedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
    gap: 6,
  },
  numberedIndex: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.dark.primary,
    minWidth: 16,
    lineHeight: 20,
  },
  numberedText: {
    flex: 1,
    color: colors.dark.text,
    fontSize: 13.5,
    lineHeight: 20,
  },
  inlineCodePill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignSelf: 'center',
  },
  inlineCodeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#38BDF8',
    fontSize: 12,
  },
  codeContainer: {
    backgroundColor: '#0A0F1D',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginVertical: spacing.xs,
    overflow: 'hidden',
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  codeLangGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  codeLangText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  copyBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  copyBtnSuccess: {
    color: '#10B981',
  },
  codeScroll: {
    maxHeight: 240,
  },
  codeBody: {
    padding: spacing.sm,
  },
  codeLine: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: '#E2E8F0',
    lineHeight: 18,
  },
  codeComment: {
    color: '#64748B',
    fontStyle: 'italic',
  },
});
