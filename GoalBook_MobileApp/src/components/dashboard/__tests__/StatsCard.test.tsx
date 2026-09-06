import React from 'react';
import { render } from '@testing-library/react-native';
import { StatsCard } from '../StatsCard';

describe('StatsCard Component', () => {
  it('renders title, numeric value, and subtitle', () => {
    const { getByText } = render(
      <StatsCard
        title="Pages Read"
        value={142}
        subtitle="+12% from last week"
        icon="book"
        iconColor="#3B82F6"
      />
    );

    expect(getByText('Pages Read')).toBeTruthy();
    expect(getByText('142')).toBeTruthy();
    expect(getByText('+12% from last week')).toBeTruthy();
  });

  it('renders string value without subtitle when omitted', () => {
    const { getByText, queryByText } = render(
      <StatsCard title="Current Streak" value="7 Days" icon="flame" />
    );

    expect(getByText('Current Streak')).toBeTruthy();
    expect(getByText('7 Days')).toBeTruthy();
    expect(queryByText('from last week')).toBeNull();
  });
});
