"use client";
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase/browserClient';

export default function AdminLayout({ children }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(session);
      setReady(true);
      if (!session && pathname !== '/admin/login') {
        router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      }
    })();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (!sess && pathname !== '/admin/login') {
        router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      }
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [pathname, router]);

  if (!ready) return <div className="min-h-screen flex items-center justify-center">Cargando…</div>;
  if (!session && pathname !== '/admin/login') return null;

  // Render only children; AdminDashboardClient handles its own header/nav.
  return children;
}
