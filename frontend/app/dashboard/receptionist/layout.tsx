import ReceptionistShell from '@/components/receptionist/ReceptionistShell';

export default function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  return <ReceptionistShell>{children}</ReceptionistShell>;
}
