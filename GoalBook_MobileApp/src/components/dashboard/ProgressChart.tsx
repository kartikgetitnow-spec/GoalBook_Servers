import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, borderRadius, spacing } from '../../constants/theme';

interface ProgressChartProps {
  data?: number[];
  labels?: string[];
  title?: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  data = [0, 0, 0, 0, 0, 0, 0],
  labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  title = 'Weekly Reading (Minutes)',
}) => {
  const screenWidth = Dimensions.get('window').width - spacing.lg * 2 - spacing.md * 2;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <LineChart
        data={{
          labels,
          datasets: [
            {
              data,
              color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`, // primary indigo
              strokeWidth: 3,
            },
          ],
        }}
        width={Math.max(280, screenWidth)}
        height={180}
        fromZero={true}
        chartConfig={{
          backgroundColor: colors.dark.surface,
          backgroundGradientFrom: colors.dark.surface,
          backgroundGradientTo: colors.dark.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
          style: {
            borderRadius: borderRadius.md,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: colors.dark.primary,
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dark.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
    marginVertical: spacing.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.dark.text,
    marginBottom: spacing.sm,
  },
  chart: {
    borderRadius: borderRadius.md,
    alignSelf: 'center',
  },
});
