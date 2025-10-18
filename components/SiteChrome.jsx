"use client";
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import FooterBar from './FooterBar';

export default function SiteChrome({ initialSettings, children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return children;
  }

  return (
    <>
      <Navbar initialSettings={initialSettings} />
      {children}
      <FooterBar initialSettings={initialSettings} />
    </>
  );
}
