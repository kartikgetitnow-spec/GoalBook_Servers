import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing } from '../../constants/theme';
import { ReaderSettings } from '../../types/models';
import { Ionicons } from '@expo/vector-icons';

interface FontSettingsProps {
  settings: ReaderSettings;
  onUpdate: (partial: Partial<ReaderSettings>) => void;
  onClose?: () => void;
}

export const FontSettings: React.FC<FontSettingsProps> = ({
  settings,
  onUpdate,
  onClose,
}) => {
  const fontFamilies: Array<{ label: string; value: ReaderSettings['fontFamily'] }> = [
    { label: 'Sans', value: 'sans' },
    { label: 'Serif', value: 'serif' },
    { label: 'Mono', value: 'mono' },
    { label: 'Dyslexic', value: 'dyslexic' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Typography & Reading</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.dark.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* Font Size Row */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Font Size ({settings.fontSize}px)</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => onUpdate({ fontSize: Math.max(12, settings.fontSize - 2) })}
          >
            <Text style={styles.buttonText}>A-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => onUpdate({ fontSize: Math.min(32, settings.fontSize + 2) })}
          >
            <Text style={styles.buttonText}>A+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Font Family Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Font Family</Text>
        <View style={styles.chipRow}>
          {fontFamilies.map((item) => (
            <TouchableOpacity
              key={item.value}
              onPress={() => onUpdate({ fontFamily: item.value })}
              style={[
                styles.chip,
                settings.fontFamily === item.value && styles.activeChip,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  settings.fontFamily === item.value && styles.activeChipText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Reading Speed Row */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Speed ({settings.readingSpeedWpm} WPM)</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() =>
              onUpdate({ readingSpeedWpm: Math.max(100, settings.readingSpeedWpm - 50) })
            }
          >
            <Text style={styles.buttonText}>-50 WPM</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() =>
              onUpdate({ readingSpeedWpm: Math.min(600, settings.readingSpeedWpm + 50) })
            }
          >
            <Text style={styles.buttonText}>+50 WPM</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dark.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
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
    fontSize: 16,
    fontWeight: '700',
    color: colors.dark.text,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    color: colors.dark.textSecondary,
    marginBottom: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  adjustButton: {
    flex: 1,
    backgroundColor: colors.dark.surfaceVariant,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  buttonText: {
    color: colors.dark.text,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.full,
    backgroundColor: colors.dark.surfaceVariant,
  },
  activeChip: {
    backgroundColor: colors.dark.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.dark.textSecondary,
    fontWeight: '500',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
});
