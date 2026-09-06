import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { colors, borderRadius, spacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface WeeklyActivityChartProps {
  minutesData?: number[];
  speedData?: number[];
  labels?: string[];
}

export const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({
  minutesData = [0, 0, 0, 0, 0, 0, 0],
  speedData = [0, 0, 0, 0, 0, 0, 0],
  labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
}) => {
  const [activeTab, setActiveTab] = useState<'minutes' | 'speed'>('minutes');
  const screenWidth = Dimensions.get('window').width - spacing.md * 2 - spacing.md * 2;
  const chartWidth = Math.max(300, screenWidth);
  const totalMinutes = minutesData.reduce((a, b) => a + b, 0);
  const peakSpeed = speedData.length > 0 ? Math.max(...speedData) : 0;
  const hasActivity = totalMinutes > 0 || peakSpeed > 0;

  const baseChartConfig = {
    backgroundColor: '#151D2F',
    backgroundGradientFrom: '#151D2F',
    backgroundGradientTo: '#151D2F',
    decimalPlaces: 0,
    color: (opacity = 1) =>
      activeTab === 'minutes'
        ? `rgba(245, 158, 11, ${opacity})` // Amber
        : `rgba(59, 130, 246, ${opacity})`, // Blue
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    style: {
      borderRadius: borderRadius.md,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#60A5FA',
    },
    propsForBackgroundLines: {
      stroke: '#1E293B',
      strokeDasharray: '4',
    },
    barPercentage: 0.6,
  };

  return (
    <View style={styles.container}>
      {/* Header with Title & Toggle */}
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <View style={styles.iconBox}>
            <Ionicons
              name={activeTab === 'minutes' ? 'bar-chart-outline' : 'trending-up-outline'}
              size={18}
              color={activeTab === 'minutes' ? '#F59E0B' : '#3B82F6'}
            />
          </View>
          <View>
            <Text style={styles.title}>Weekly Activity</Text>
            <Text style={styles.subtitle}>
              {activeTab === 'minutes' ? 'Daily reading time in minutes' : 'Reading speed velocity (WPM)'}
            </Text>
          </View>
        </View>

        {/* Toggle Pills */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === 'minutes' && styles.toggleBtnActiveMinutes]}
            onPress={() => setActiveTab('minutes')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleText,
                activeTab === 'minutes' && styles.toggleTextActiveMinutes,
              ]}
            >
              Minutes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === 'speed' && styles.toggleBtnActiveSpeed]}
            onPress={() => setActiveTab('speed')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleText,
                activeTab === 'speed' && styles.toggleTextActiveSpeed,
              ]}
            >
              Speed
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Charts */}
      <View style={styles.chartWrapper}>
        {activeTab === 'minutes' ? (
          <BarChart
            data={{
              labels,
              datasets: [{ data: minutesData }],
            }}
            width={chartWidth}
            height={190}
            yAxisLabel=""
            yAxisSuffix="m"
            chartConfig={baseChartConfig}
            style={styles.chart}
            showValuesOnTopOfBars={true}
            fromZero={true}
          />
        ) : (
          <LineChart
            data={{
              labels,
              datasets: [{ data: speedData }],
            }}
            width={chartWidth}
            height={190}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={baseChartConfig}
            bezier
            style={styles.chart}
            fromZero={true}
          />
        )}
      </View>

      {!hasActivity && (
        <View style={styles.noActivityBanner}>
          <Ionicons name="information-circle-outline" size={16} color="#94A3B8" />
          <Text style={styles.noActivityText}>
            No reading sessions recorded this week yet. Start reading to see your chart!
          </Text>
        </View>
      )}

      {/* Summary Footer */}
      <View style={styles.footerRow}>
        <View style={styles.statChip}>
          <Text style={styles.statChipLabel}>Weekly Total:</Text>
          <Text style={styles.statChipValue}>{totalMinutes} mins</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statChipLabel}>Peak Speed:</Text>
          <Text style={styles.statChipValue}>{peakSpeed} WPM</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#151D2F',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#243048',
    padding: spacing.md,
    marginVertical: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#0B0F19',
    borderRadius: borderRadius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  toggleBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: borderRadius.sm,
  },
  toggleBtnActiveMinutes: {
    backgroundColor: '#F59E0B',
  },
  toggleBtnActiveSpeed: {
    backgroundColor: '#2563EB',
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  toggleTextActiveMinutes: {
    color: '#0F172A',
    fontWeight: '700',
  },
  toggleTextActiveSpeed: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  chartWrapper: {
    alignItems: 'center',
    overflow: 'hidden',
  },
  chart: {
    borderRadius: borderRadius.md,
    marginLeft: -12,
  },
  noActivityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  noActivityText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statChipLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  statChipValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
});
