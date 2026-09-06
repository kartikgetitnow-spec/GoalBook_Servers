import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, borderRadius, spacing } from '../../constants/theme';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  tag: string;
  avatar: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Dr. Evelyn Reed',
    role: 'Co-Founder & Chief Cognitive Scientist',
    bio: 'Former MIT neurobiology researcher specializing in ocular tracking, saccadic regression, and auditory memory retention.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    tag: 'Neuroscience & OCR',
  },
  {
    name: 'Kartik Sharma',
    role: 'Founder & Lead Systems Architect',
    bio: 'Pioneered the dual-column layout boundary parser and browser speech synthesis queuing engine for academic texts.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    tag: 'Full-Stack Systems',
  },
  {
    name: 'Aria Chen',
    role: 'Head of Product & Accessibility Design',
    bio: 'Passionate about dyslexic-friendly typography, cognitive ease, and minimalist ambient reader ergonomics.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    tag: 'Accessibility & UX',
  },
  {
    name: 'Marcus Vance',
    role: 'Principal AI Engineer',
    bio: 'Architect of in-document conversational agents, contextual summarizers, and cross-lingual vocabulary pipelines.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    tag: 'LLMs & Agents',
  },
];

const MILESTONES = [
  {
    year: '2024',
    title: 'The Inception & First Two-Column Parser',
    desc: 'GoalBook was born out of frustration with text-to-speech tools jumbling multi-column research papers. The first layout-aware prototype was deployed to 500 early beta researchers.',
    icon: 'code-slash',
  },
  {
    year: '2025',
    title: 'Karaoke Pacing & Native Mobile Engine',
    desc: 'Launched real-time word-level teleprompter synchronization and released the standalone mobile app with local offline SQLite caching.',
    icon: 'phone-portrait',
  },
  {
    year: '2026',
    title: 'GoalBook 2.0 & AI Reading Co-Pilot',
    desc: 'Integrated AI reading models for in-document Q&A, automatic chapter condensation, and reached over 10,000 active daily readers worldwide.',
    icon: 'sparkles',
  },
];

const VALUES = [
  {
    icon: 'eye-outline',
    color: '#60A5FA',
    title: 'Cognitive Ergonomics',
    desc: 'Reading software should remove cognitive friction, not add it. High-contrast typography and focus mode reduce mental fatigue.',
  },
  {
    icon: 'heart-outline',
    color: '#F43F5E',
    title: 'Radical Accessibility',
    desc: 'Dyslexic readers and visual-learning learners deserve equal access. We engineer word-level pacing and high-legibility fonts for everyone.',
  },
  {
    icon: 'shield-checkmark-outline',
    color: '#10B981',
    title: 'Zero-Compromise Privacy',
    desc: 'Your reading habits and intellectual curiosity belong to you alone. Document processing runs locally and data is never sold.',
  },
  {
    icon: 'trending-up-outline',
    color: '#FBBF24',
    title: 'Continuous Compounding',
    desc: 'A 1% daily improvement in comprehension compounds into a transformative intellectual multiplier over a single year.',
  },
];

const AWARDS = [
  {
    source: 'EdTech Breakthrough Awards',
    title: 'Best Reading Acceleration Platform 2025',
    badge: 'Winner',
  },
  {
    source: 'Nature Academic Tools Review',
    title: 'Top 5 Essential Researcher Utilities',
    badge: 'Honorable Mention',
  },
];

export const AboutScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleOpenCareers = () => {
    Linking.openURL('https://goalbook.app/careers').catch(() => {
      Alert.alert('Careers', 'Please email your resume to careers@goalbook.app');
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>About GoalBook</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Mission & Vision Hero Banner */}
        <View style={styles.heroCard}>
          <View style={styles.badgeRow}>
            <View style={styles.heroBadge}>
              <Ionicons name="sparkles" size={12} color="#FBBF24" />
              <Text style={styles.heroBadgeText}>OUR MISSION</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>
            Accelerating human knowledge acquisition through intelligent reading interfaces.
          </Text>
          <Text style={styles.heroDesc}>
            GoalBook transforms passive skimming into active comprehension. By combining synchronized karaoke pacing, multi-column document extraction, and contextual AI reasoning, we help students, researchers, and professionals absorb literature 3x faster.
          </Text>
        </View>

        {/* Values & Culture Section */}
        <Text style={styles.sectionHeading}>Core Values & Philosophy</Text>
        <View style={styles.valuesGrid}>
          {VALUES.map((val, idx) => (
            <View key={idx} style={styles.valueCard}>
              <View style={[styles.valueIconBox, { backgroundColor: val.color + '20' }]}>
                <Ionicons name={val.icon as any} size={20} color={val.color} />
              </View>
              <Text style={styles.valueTitle}>{val.title}</Text>
              <Text style={styles.valueDesc}>{val.desc}</Text>
            </View>
          ))}
        </View>

        {/* Company Timeline & Milestones */}
        <Text style={styles.sectionHeading}>Company Milestones</Text>
        <View style={styles.timelineContainer}>
          {MILESTONES.map((m, idx) => (
            <View key={idx} style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={styles.yearPill}>
                  <Text style={styles.yearPillText}>{m.year}</Text>
                </View>
                {idx < MILESTONES.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.timelineCard}>
                <View style={styles.timelineCardHeader}>
                  <Ionicons name={m.icon as any} size={15} color={colors.dark.primary} />
                  <Text style={styles.timelineTitle}>{m.title}</Text>
                </View>
                <Text style={styles.timelineDesc}>{m.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Team Member Cards */}
        <Text style={styles.sectionHeading}>Leadership & Engineering</Text>
        <View style={styles.teamGrid}>
          {TEAM_MEMBERS.map((member, idx) => (
            <View key={idx} style={styles.teamCard}>
              <View style={styles.teamCardTop}>
                <Image source={{ uri: member.avatar }} style={styles.teamAvatar} />
                <View style={styles.teamMeta}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRole}>{member.role}</Text>
                  <View style={styles.memberTag}>
                    <Text style={styles.memberTagText}>{member.tag}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.memberBio}>{member.bio}</Text>
            </View>
          ))}
        </View>

        {/* Press Mentions & Awards */}
        <Text style={styles.sectionHeading}>Recognition & Awards</Text>
        <View style={styles.awardsGrid}>
          {AWARDS.map((award, idx) => (
            <View key={idx} style={styles.awardCard}>
              <View style={styles.awardIconBox}>
                <Ionicons name="trophy" size={22} color="#FBBF24" />
              </View>
              <View style={styles.awardMeta}>
                <View style={styles.awardBadge}>
                  <Text style={styles.awardBadgeText}>{award.badge}</Text>
                </View>
                <Text style={styles.awardTitle}>{award.title}</Text>
                <Text style={styles.awardSource}>{award.source}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Join Our Team CTA */}
        <View style={styles.ctaCard}>
          <View style={styles.ctaGlow} />
          <Ionicons name="rocket-outline" size={32} color="#60A5FA" />
          <Text style={styles.ctaTitle}>Help Shape the Future of Reading</Text>
          <Text style={styles.ctaDesc}>
            We are looking for passionate compilers engineers, mobile systems specialists, and AI researchers to push the frontiers of cognitive acceleration.
          </Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={handleOpenCareers}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaBtnText}>View Open Positions</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
    backgroundColor: colors.dark.surface,
  },
  backBtn: {
    padding: spacing.xs,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.dark.text,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  heroCard: {
    backgroundColor: colors.dark.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.dark.border,
    padding: spacing.lg,
    gap: 10,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FBBF24',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.dark.text,
    lineHeight: 28,
  },
  heroDesc: {
    fontSize: 13,
    color: colors.dark.textSecondary,
    lineHeight: 20,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.dark.text,
    marginBottom: -4,
  },
  valuesGrid: {
    gap: 10,
  },
  valueCard: {
    backgroundColor: colors.dark.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    padding: spacing.md,
    gap: 6,
  },
  valueIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  valueTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.dark.text,
  },
  valueDesc: {
    fontSize: 12,
    color: colors.dark.textSecondary,
    lineHeight: 18,
  },
  timelineContainer: {
    gap: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 50,
  },
  yearPill: {
    backgroundColor: colors.dark.surfaceVariant,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  yearPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.dark.primary,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.dark.border,
    marginVertical: 4,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: colors.dark.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    padding: spacing.md,
    gap: 4,
  },
  timelineCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.dark.text,
    flex: 1,
  },
  timelineDesc: {
    fontSize: 11,
    color: colors.dark.textSecondary,
    lineHeight: 16,
  },
  teamGrid: {
    gap: 10,
  },
  teamCard: {
    backgroundColor: colors.dark.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    padding: spacing.md,
    gap: 8,
  },
  teamCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  teamAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.dark.surfaceVariant,
  },
  teamMeta: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.dark.text,
  },
  memberRole: {
    fontSize: 11,
    color: colors.dark.textSecondary,
    marginTop: 1,
  },
  memberTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(96, 165, 250, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  memberTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#60A5FA',
  },
  memberBio: {
    fontSize: 11,
    color: colors.dark.textMuted,
    lineHeight: 16,
  },
  awardsGrid: {
    gap: 10,
  },
  awardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    padding: spacing.md,
    gap: 12,
  },
  awardIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  awardMeta: {
    flex: 1,
  },
  awardBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 2,
  },
  awardBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FBBF24',
    textTransform: 'uppercase',
  },
  awardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.dark.text,
  },
  awardSource: {
    fontSize: 11,
    color: colors.dark.textSecondary,
    marginTop: 1,
  },
  ctaCard: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.3)',
    padding: spacing.xl,
    alignItems: 'center',
    textAlign: 'center',
    gap: 10,
  },
  ctaGlow: {
    position: 'absolute',
    top: 0,
    left: '20%',
    width: '60%',
    height: 40,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderRadius: 20,
    filter: 'blur(20px)',
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.dark.text,
    textAlign: 'center',
  },
  ctaDesc: {
    fontSize: 12,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.dark.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    marginTop: 4,
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
