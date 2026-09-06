import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { MainTabParamList } from '../../navigation/types';
import { ChatInterface } from '../../components/ai/ChatInterface';
import { SavedConversationsSidebar } from '../../components/ai/SavedConversationsSidebar';
import { BookContextModal } from '../../components/ai/BookContextModal';
import { PassageInputModal } from '../../components/ai/PassageInputModal';
import { useAI } from '../../hooks/useAI';
import { useAppStore } from '../../store';
import { exportConversationToPDF } from '../../services/ai/pdfExportService';
import { colors, spacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

type AIChatRouteProp = RouteProp<MainTabParamList, 'AIChat'>;

export const AIChatScreen: React.FC = () => {
  const route = useRoute<AIChatRouteProp>();
  const initialPrompt = route.params?.initialPrompt;
  const bookIdParam = route.params?.bookId;

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [contextModalVisible, setContextModalVisible] = useState(false);
  const [passageModalVisible, setPassageModalVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const activeBookContext = useAppStore((state) => state.activeBookContext);
  const setActiveBookContext = useAppStore((state) => state.setActiveBookContext);
  const setActivePassageContext = useAppStore((state) => state.setActivePassageContext);
  const createConversation = useAppStore((state) => state.createConversation);
  const selectConversation = useAppStore((state) => state.selectConversation);
  const conversations = useAppStore((state) => state.conversations);
  const activeConversationId = useAppStore((state) => state.activeConversationId);

  const { messages, loading, sendMessage } = useAI(bookIdParam);

  // If a bookId was passed via route params, link it if not already linked
  useEffect(() => {
    if (bookIdParam && activeBookContext?.bookId !== bookIdParam) {
      setActiveBookContext({
        bookId: bookIdParam,
        title: 'Active Reader Book',
        chapterTitle: 'Current Section',
        pageNumber: 1,
      });
    }
  }, [bookIdParam, activeBookContext, setActiveBookContext]);

  // If initialPrompt was provided via route params, send it automatically
  useEffect(() => {
    if (initialPrompt) {
      sendMessage(initialPrompt);
    }
  }, [initialPrompt, sendMessage]);

  const handleExportPDF = async () => {
    if (messages.length === 0) {
      Alert.alert('No Messages', 'Start a conversation before exporting to PDF.');
      return;
    }

    setIsExporting(true);
    try {
      const currentConv = conversations.find((c) => c.id === activeConversationId);
      const title = currentConv?.title || activeBookContext?.title
        ? `GoalBook AI - ${activeBookContext?.title || 'Reading'}`
        : 'GoalBook AI Reading Discussion';

      const result = await exportConversationToPDF({
        title,
        messages,
        bookTitle: activeBookContext?.title,
        chapterTitle: activeBookContext?.chapterTitle,
      });

      if (!result.success) {
        Alert.alert('Export Failed', result.error || 'Unable to generate PDF document.');
      }
    } catch (err: any) {
      Alert.alert('Export Error', err?.message || 'Error occurred while creating PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        {/* Left: Sidebar / History button */}
        <TouchableOpacity
          onPress={() => setSidebarVisible(true)}
          style={styles.headerIconBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="menu-outline" size={24} color={colors.dark.text} />
          {conversations.length > 0 && <View style={styles.unreadDot} />}
        </TouchableOpacity>

        {/* Center: Assistant Branding */}
        <View style={styles.titleGroup}>
          <View style={styles.sparkleIcon}>
            <Ionicons name="sparkles" size={16} color="#FBBF24" />
          </View>
          <View>
            <Text style={styles.title}>GoalBook AI Assistant</Text>
            <Text style={styles.subtitle}>
              {activeBookContext ? `Context: ${activeBookContext.title}` : 'Reading Intelligence Engine'}
            </Text>
          </View>
        </View>

        {/* Right: PDF Export Button */}
        <TouchableOpacity
          onPress={handleExportPDF}
          disabled={isExporting}
          style={styles.headerIconBtn}
          activeOpacity={0.7}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color={colors.dark.primary} />
          ) : (
            <Ionicons name="share-outline" size={22} color={colors.dark.text} />
          )}
        </TouchableOpacity>
      </View>

      {/* Main Chat Interface */}
      <ChatInterface
        messages={messages}
        loading={loading}
        onSendMessage={sendMessage}
        onOpenContextModal={() => setContextModalVisible(true)}
        onOpenPassageModal={() => setPassageModalVisible(true)}
      />

      {/* Sidebar Drawer: Saved Conversations */}
      <SavedConversationsSidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onSelectConversation={(id) => selectConversation(id)}
        onNewChat={() => createConversation()}
      />

      {/* Book Context Switcher Modal */}
      <BookContextModal
        visible={contextModalVisible}
        onClose={() => setContextModalVisible(false)}
        currentContext={activeBookContext}
        onSelectContext={(ctx) => setActiveBookContext(ctx)}
      />

      {/* Target Passage Excerpt Modal */}
      <PassageInputModal
        visible={passageModalVisible}
        onClose={() => setPassageModalVisible(false)}
        currentBookTitle={activeBookContext?.title}
        onSelectPassage={(passage) => setActivePassageContext(passage)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
    backgroundColor: colors.dark.surface,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.dark.primary,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sparkleIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.dark.text,
  },
  subtitle: {
    fontSize: 11,
    color: colors.dark.textSecondary,
  },
});
