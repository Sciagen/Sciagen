// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD — Protected server component
// ─────────────────────────────────────────────────────────────────────────────
import { redirect }    from 'next/navigation';
import { cookies }     from 'next/headers';
import { verifySessionToken, getUserRole } from '@/lib/firebase/admin';
import { AdminShell }  from '@/components/admin/AdminShell';

export const metadata = { title: 'Admin Dashboard | Sciagen' };

async function getAuthenticatedAdmin() {
  const cookieStore = cookies();
  const token       = cookieStore.get('session')?.value;
  if (!token) return null;

  const decoded = await verifySessionToken(token);
  if (!decoded) return null;

  const role = await getUserRole(decoded.uid);
  if (role !== 'admin' && role !== 'editor') return null;

  return { uid: decoded.uid, role };
}

export default async function AdminPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) redirect('/auth/login?from=/admin');

  return <AdminShell adminRole={admin.role} />;
}
