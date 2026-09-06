import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, ActivityIndicator } from 'react-native';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders button title correctly', () => {
    const { getByText } = render(<Button title="Start Reading" />);
    expect(getByText('Start Reading')).toBeTruthy();
  });

  it('triggers onPress callback when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Continue" onPress={onPressMock} />);

    fireEvent.press(getByText('Continue'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled is true', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Disabled Action" disabled={true} onPress={onPressMock} />
    );

    fireEvent.press(getByText('Disabled Action'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('renders ActivityIndicator and hides title when loading is true', () => {
    const onPressMock = jest.fn();
    const { queryByText, UNSAFE_getByType } = render(
      <Button title="Loading Action" loading={true} onPress={onPressMock} />
    );

    expect(queryByText('Loading Action')).toBeNull();
    // ActivityIndicator is rendered
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('renders custom left and right icons', () => {
    const { getByText } = render(
      <Button
        title="With Icons"
        leftIcon={<Text testID="left-icon">👈</Text>}
        rightIcon={<Text testID="right-icon">👉</Text>}
      />
    );

    expect(getByText('👈')).toBeTruthy();
    expect(getByText('With Icons')).toBeTruthy();
    expect(getByText('👉')).toBeTruthy();
  });
});
