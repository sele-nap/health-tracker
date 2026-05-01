import type { Metadata } from 'next';
import { RegisterForm } from './RegisterForm';

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Create your Health Tracker account.',
  openGraph: {
    title: 'Create account · Health Tracker',
    description: 'Create your Health Tracker account.',
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
