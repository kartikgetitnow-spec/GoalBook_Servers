import './commands';

// Prevent uncaught react native web exceptions from breaking tests
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore specific known benign react-native-web animation or resize observer errors
  if (
    err.message.includes('ResizeObserver') ||
    err.message.includes('react-native') ||
    err.message.includes('Animated:')
  ) {
    return false;
  }
  return true;
});
