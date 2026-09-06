import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Card } from '../Card';

describe('Card Component', () => {
  it('renders children content when not loading', () => {
    const { getByText } = render(
      <Card>
        <Text>Card Inner Content</Text>
      </Card>
    );

    expect(getByText('Card Inner Content')).toBeTruthy();
  });

  it('handles press event when onPress prop is provided', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Card onPress={onPressMock}>
        <Text>Clickable Card</Text>
      </Card>
    );

    fireEvent.press(getByText('Clickable Card'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('renders skeleton lines and suppresses children when loading is true', () => {
    const { queryByText } = render(
      <Card loading={true}>
        <Text>Should Be Hidden</Text>
      </Card>
    );

    expect(queryByText('Should Be Hidden')).toBeNull();
  });
});
