import { AuthLayout } from '@/components/Auth/AuthLayout';
import { ResetPasswordForm } from '@/components/Auth/ResetPasswordForm';

export default function ResetPassword() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Create a new password for your account"
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}