import React from 'react';
import { AboutScreen } from '../../../src/screens/marketing/AboutScreen';

/**
 * About Page
 * Route: app/(marketing)/about/page.tsx
 *
 * Implements Phase 7 Prompt 10: Create Contact and About Pages
 * - Company mission and vision
 * - Team member cards with photos & bios
 * - Company timeline / milestones
 * - Values and culture section
 * - Press mentions and awards
 * - Join our team CTA
 */
export default function AboutPage() {
  return <AboutScreen />;
}

export { AboutScreen as AboutView };
