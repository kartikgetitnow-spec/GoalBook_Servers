import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, borderRadius, spacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface QuickActionsProps {
  onSelectAction: (prompt: string) => void;
  chapterTitle?: string;
  bookTitle?: string;
}

interface ActionItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgTint: string;
  generatePrompt: (bookTitle?: string, chapterTitle?: string) => string;
}

const quickActionItems: ActionItem[] = [
  {
    id: 'summarize',
    title: 'Summarize this chapter',
    icon: 'book-outline',
    color: '#38BDF8',
    bgTint: 'rgba(56, 189, 248, 0.12)',
    generatePrompt: (book, chapter) =>
      `Please provide a comprehensive summary of ${chapter ? `"${chapter}"` : 'this chapter'} ${book ? `from "${book}"` : ''}, highlighting key arguments and practical takeaways.`,
  },
  {
    id: 'explain',
    title: 'Explain this concept',
    icon: 'bulb-outline',
    color: '#FBBF24',
    bgTint: 'rgba(251, 191, 36, 0.12)',
    generatePrompt: (book, chapter) =>
      `Can you explain the key concepts and mental models discussed in ${chapter ? `"${chapter}"` : 'this section'} ${book ? `of "${book}"` : ''} in simple, memorable terms?`,
  },
  {
    id: 'notes',
    title: 'Create study notes',
    icon: 'create-outline',
    color: '#A855F7',
    bgTint: 'rgba(168, 85, 247, 0.12)',
    generatePrompt: (book, chapter) =>
      `Generate structured Cornell study notes for ${chapter ? `"${chapter}"` : 'this chapter'} ${book ? `in "${book}"` : ''}, including key concepts, summary, and action items.`,
  },
  {
    id: 'quiz',
    title: 'Generate quiz questions',
    icon: 'help-circle-outline',
    color: '#34D399',
    bgTint: 'rgba(52, 211, 153, 0.12)',
    generatePrompt: (book, chapter) =>
      `Generate 3 multiple-choice comprehension quiz questions with explanations for ${chapter ? `"${chapter}"` : 'this section'} ${book ? `of "${book}"` : ''}.`,
  },
];

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSelectAction,
  chapterTitle,
  bookTitle,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {quickActionItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.chip, { backgroundColor: item.bgTint, borderColor: item.color + '40' }]}
            onPress={() => onSelectAction(item.generatePrompt(bookTitle, chapterTitle))}
            activeOpacity={0.7}
          >
            <Ionicons name={item.icon} size={13} color={item.color} />
            <Text style={[styles.chipText, { color: item.color }]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
    backgroundColor: 'transparent',
  },
  scroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
