import { cookies } from 'next/headers';
import { MainLayout } from '@/components/layout/MainLayout';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies();
  const isGuest = cookieStore.get('guest-mode')?.value === '1';

  return <MainLayout isGuest={isGuest}>{children}</MainLayout>;
}
