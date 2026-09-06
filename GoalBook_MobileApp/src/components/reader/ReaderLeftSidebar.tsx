import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReaderSettings } from '../../types/models';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface ReaderLeftSidebarProps {
  visible: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onUpdateSettings: (partial: Partial<ReaderSettings>) => void;
  focusMode: boolean;
  onToggleFocusMode: () => void;
}

export const ReaderLeftSidebar: React.FC<ReaderLeftSidebarProps> = ({
  visible,
  onClose,
  settings,
  onUpdateSettings,
  focusMode,
  onToggleFocusMode,
}) => {
  const fontFamilies: Array<{ label: string; value: ReaderSettings['fontFamily'] }> = [
    { label: 'Sans', value: 'sans' },
    { label: 'Serif', value: 'serif' },
    { label: 'Mono', value: 'mono' },
    { label: 'Dyslexic', value: 'dyslexic' },
  ];

  const themes: Array<{ label: string; value: ReaderSettings['theme']; bg: string; text: string }> = [
    { label: 'Dark', value: 'dark', bg: '#0B0F19', text: '#F8FAFC' },
    { label: 'Sepia', value: 'sepia', bg: '#FBF0D9', text: '#5F4B32' },
    { label: 'Light', value: 'light', bg: '#FFFFFF', text: '#0F172A' },
  ];

  const speedPresets = [200, 250, 300, 350, 450, 500];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={onClose} />
        <SafeAreaView style={styles.drawerContainer} edges={['top', 'bottom', 'left']}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="options-outline" size={20} color="#3B82F6" />
              <Text style={styles.headerTitle}>Reading Controls</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.drawerContent} showsVerticalScrollIndicator={false}>
            {/* 1. Theme Switcher */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Reading Theme</Text>
              <View style={styles.themeRow}>
                {themes.map((t) => {
                  const isSelected = settings.theme === t.value;
                  return (
                    <TouchableOpacity
                      key={t.value}
                      style={[
                        styles.themeCard,
                        { backgroundColor: t.bg },
                        isSelected && styles.themeCardSelected,
                      ]}
                      onPress={() => onUpdateSettings({ theme: t.value })}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.themeCardText, { color: t.text }]}>{t.label}</Text>
                      {isSelected && (
                        <View style={styles.themeSelectedCheck}>
                          <Ionicons name="checkmark" size={14} color="#3B82F6" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 2. Reading Speed (WPM) */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>Reading Speed</Text>
                <Text style={styles.speedBadge}>{settings.readingSpeedWpm} WPM</Text>
              </View>
              <View style={styles.presetRow}>
                {speedPresets.map((speed) => {
                  const isSelected = settings.readingSpeedWpm === speed;
                  return (
                    <TouchableOpacity
                      key={speed}
                      style={[styles.speedPresetBtn, isSelected && styles.speedPresetActive]}
                      onPress={() => onUpdateSettings({ readingSpeedWpm: speed })}
                    >
                      <Text style={[styles.speedPresetText, isSelected && styles.speedPresetTextActive]}>
                        {speed}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.adjustRow}>
                <TouchableOpacity
                  style={styles.adjustStepBtn}
                  onPress={() =>
                    onUpdateSettings({ readingSpeedWpm: Math.max(100, settings.readingSpeedWpm - 25) })
                  }
                >
                  <Text style={styles.adjustStepText}>- 25 WPM</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.adjustStepBtn}
                  onPress={() =>
                    onUpdateSettings({ readingSpeedWpm: Math.min(600, settings.readingSpeedWpm + 25) })
                  }
                >
                  <Text style={styles.adjustStepText}>+ 25 WPM</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 3. Font Size & Family */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>Font Size</Text>
                <Text style={styles.valueBadge}>{settings.fontSize} px</Text>
              </View>
              <View style={styles.adjustRow}>
                <TouchableOpacity
                  style={styles.adjustStepBtn}
                  onPress={() => onUpdateSettings({ fontSize: Math.max(13, settings.fontSize - 2) })}
                >
                  <Text style={styles.adjustStepText}>A- Smaller</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.adjustStepBtn}
                  onPress={() => onUpdateSettings({ fontSize: Math.min(32, settings.fontSize + 2) })}
                >
                  <Text style={styles.adjustStepText}>A+ Larger</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.sectionLabel, { marginTop: spacing.md }]}>Typography</Text>
              <View style={styles.presetRow}>
                {fontFamilies.map((f) => {
                  const isSelected = settings.fontFamily === f.value;
                  return (
                    <TouchableOpacity
                      key={f.value}
                      style={[styles.fontFamilyBtn, isSelected && styles.fontFamilyActive]}
                      onPress={() => onUpdateSettings({ fontFamily: f.value })}
                    >
                      <Text style={[styles.fontFamilyText, isSelected && styles.fontFamilyTextActive]}>
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 4. Karaoke & Auto-Scroll Toggles */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Assistance & Motion</Text>
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextGroup}>
                  <Text style={styles.toggleTitle}>Karaoke Highlighting</Text>
                  <Text style={styles.toggleSubtitle}>Word-by-word active tracking</Text>
                </View>
                <Switch
                  value={settings.karaokeEnabled}
                  onValueChange={(val) => onUpdateSettings({ karaokeEnabled: val })}
                  trackColor={{ false: '#1E293B', true: '#3B82F6' }}
                />
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.toggleTextGroup}>
                  <Text style={styles.toggleTitle}>Auto-Scroll</Text>
                  <Text style={styles.toggleSubtitle}>Scroll with reading pacing</Text>
                </View>
                <Switch
                  value={settings.autoScroll}
                  onValueChange={(val) => onUpdateSettings({ autoScroll: val })}
                  trackColor={{ false: '#1E293B', true: '#3B82F6' }}
                />
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.toggleTextGroup}>
                  <Text style={styles.toggleTitle}>Focus Mode</Text>
                  <Text style={styles.toggleSubtitle}>Hide toolbars and dim distractions</Text>
                </View>
                <Switch
                  value={focusMode}
                  onValueChange={onToggleFocusMode}
                  trackColor={{ false: '#1E293B', true: '#10B981' }}
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    flexDirection: 'row',
  },
  backdropTouch: {
    flex: 1,
  },
  drawerContainer: {
    width: '82%',
    maxWidth: 340,
    backgroundColor: '#151D2F',
    borderRightWidth: 1,
    borderColor: '#243048',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#243048',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  closeBtn: {
    padding: 4,
  },
  drawerContent: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  speedBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
  },
  valueBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#60A5FA',
  },
  themeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  themeCard: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
    position: 'relative',
  },
  themeCardSelected: {
    borderColor: '#3B82F6',
  },
  themeCardText: {
    fontSize: 13,
    fontWeight: '700',
  },
  themeSelectedCheck: {
    position: 'absolute',
    top: 3,
    right: 3,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: spacing.xs,
  },
  speedPresetBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.sm,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  speedPresetActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  speedPresetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  speedPresetTextActive: {
    color: '#0B0F19',
    fontWeight: '800',
  },
  fontFamilyBtn: {
    flex: 1,
    minWidth: 60,
    paddingVertical: 7,
    borderRadius: borderRadius.sm,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  fontFamilyActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  fontFamilyText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  fontFamilyTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  adjustRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  adjustStepBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  adjustStepText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  toggleTextGroup: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  toggleSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
});
