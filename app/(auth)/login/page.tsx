import type { Metadata } from 'next';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your Health Tracker account.',
  openGraph: {
    title: 'Sign in · Health Tracker',
    description: 'Sign in to your Health Tracker account.',
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
