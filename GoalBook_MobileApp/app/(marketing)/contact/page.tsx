import React from 'react';
import { ContactScreen } from '../../../src/screens/marketing/ContactScreen';

/**
 * Contact Page
 * Route: app/(marketing)/contact/page.tsx
 *
 * Implements Phase 7 Prompt 10: Create Contact and About Pages
 * - Contact form with name, email, subject, message
 * - Form validation and error states
 * - Success message with animation
 * - Contact information cards (email, phone, address)
 * - Map integration
 * - FAQ accordion for common issues
 * - Response time expectations (< 2 hours)
 */
export default function ContactPage() {
  return <ContactScreen />;
}

export { ContactScreen as ContactView };
