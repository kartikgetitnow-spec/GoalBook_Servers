import React from 'react';
import { Text, View, StyleSheet, TextStyle, TouchableOpacity } from 'react-native';
import { fonts } from '../../constants/fonts';
import { readingModes } from '../../constants/colors';

interface KaraokeTextProps {
  text: string;
  activeWordIndex: number;
  isKaraokeActive: boolean;
  theme?: 'dark' | 'sepia' | 'light';
  focusMode?: boolean;
  fontSize?: number;
  fontFamily?: 'sans' | 'serif' | 'mono' | 'dyslexic';
  lineHeightMultiplier?: number;
  onWordPress?: (word: string, index: number) => void;
}

export const KaraokeText: React.FC<KaraokeTextProps> = ({
  text,
  activeWordIndex,
  isKaraokeActive,
  theme = 'dark',
  focusMode = false,
  fontSize = 18,
  fontFamily = 'sans',
  lineHeightMultiplier = 1.7,
  onWordPress,
}) => {
  // Break text into paragraphs
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  // Map theme colors
  const modeColors =
    theme === 'sepia'
      ? readingModes.sepia
      : theme === 'light'
      ? readingModes.normal
      : readingModes.dark;

  const fontStyle: TextStyle = {
    fontFamily: fonts.family[fontFamily] || fonts.family.sans,
    fontSize,
    lineHeight: Math.round(fontSize * lineHeightMultiplier),
    color: modeColors.text,
  };

  let globalWordCounter = 0;

  return (
    <View style={styles.container}>
      {paragraphs.map((paragraph, pIdx) => {
        const sentences = paragraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [paragraph];

        return (
          <View key={`para_${pIdx}`} style={styles.paragraph}>
            {sentences.map((sentence, sIdx) => {
              const words = sentence.trim().split(/\s+/).filter(Boolean);
              const sentenceStartWordIndex = globalWordCounter;
              const sentenceEndWordIndex = globalWordCounter + words.length - 1;
              globalWordCounter += words.length;

              // Sentence-level active state
              const isSentenceActive =
                isKaraokeActive &&
                activeWordIndex >= sentenceStartWordIndex &&
                activeWordIndex <= sentenceEndWordIndex;

              const isSentenceDimmed = focusMode && isKaraokeActive && !isSentenceActive;

              return (
                <View
                  key={`sent_${sIdx}`}
                  style={[
                    styles.sentenceContainer,
                    isSentenceActive && {
                      backgroundColor:
                        theme === 'sepia'
                          ? 'rgba(246, 218, 156, 0.4)'
                          : theme === 'light'
                          ? 'rgba(219, 234, 254, 0.5)'
                          : 'rgba(59, 130, 246, 0.14)',
                      borderColor:
                        theme === 'sepia'
                          ? 'rgba(120, 53, 15, 0.3)'
                          : theme === 'light'
                          ? 'rgba(30, 58, 138, 0.3)'
                          : 'rgba(59, 130, 246, 0.4)',
                    },
                    isSentenceDimmed && styles.dimmedSentence,
                  ]}
                >
                  <Text style={[styles.baseText, fontStyle]}>
                    {words.map((word, wIdx) => {
                      const thisWordIndex = sentenceStartWordIndex + wIdx;
                      const isActiveWord = isKaraokeActive && thisWordIndex === activeWordIndex;
                      const isReadWord = isKaraokeActive && thisWordIndex < activeWordIndex;

                      return (
                        <Text
                          key={`word_${wIdx}_${word}`}
                          onPress={() => onWordPress?.(word, thisWordIndex)}
                          style={[
                            isActiveWord && {
                              color:
                                theme === 'sepia'
                                  ? '#78350F'
                                  : theme === 'light'
                                  ? '#1E3A8A'
                                  : '#38BDF8',
                              backgroundColor:
                                theme === 'sepia'
                                  ? '#FDE68A'
                                  : theme === 'light'
                                  ? '#DBEAFE'
                                  : 'rgba(56, 189, 248, 0.3)',
                              fontWeight: '800',
                            },
                            isReadWord && {
                              color: modeColors.textMuted,
                            },
                            !isKaraokeActive && {
                              color: modeColors.text,
                            },
                          ]}
                        >
                          {word}{' '}
                        </Text>
                      );
                    })}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  paragraph: {
    marginBottom: 20,
  },
  sentenceContainer: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dimmedSentence: {
    opacity: 0.35,
  },
  baseText: {
    letterSpacing: 0.2,
  },
});
