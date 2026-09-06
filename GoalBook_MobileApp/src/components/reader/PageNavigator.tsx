import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing } from '../../constants/theme';

interface PageNavigatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PageNavigator: React.FC<PageNavigatorProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const [inputVal, setInputVal] = useState<string>(String(currentPage));

  const handleGo = () => {
    const pageNum = parseInt(inputVal, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    } else {
      setInputVal(String(currentPage));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Jump to page:</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={inputVal}
        onChangeText={setInputVal}
        onSubmitEditing={handleGo}
        returnKeyType="go"
      />
      <Text style={styles.totalPages}>/ {totalPages}</Text>
      <TouchableOpacity onPress={handleGo} style={styles.goButton}>
        <Text style={styles.goText}>Go</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  label: {
    color: colors.dark.textSecondary,
    fontSize: 13,
  },
  input: {
    backgroundColor: colors.dark.surfaceVariant,
    color: colors.dark.text,
    borderWidth: 1,
    borderColor: colors.dark.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    minWidth: 44,
    textAlign: 'center',
    fontSize: 14,
  },
  totalPages: {
    color: colors.dark.textSecondary,
    fontSize: 13,
  },
  goButton: {
    backgroundColor: colors.dark.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  goText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
});
