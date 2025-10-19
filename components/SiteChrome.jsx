"use client";
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import FooterBar from './FooterBar';
import AdAnnouncement from './AdAnnouncement.jsx';

export default function SiteChrome({ initialSettings, children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return children;
  }

  return (
    <>
      <Navbar initialSettings={initialSettings} />
      <AdAnnouncement /> 
      {children}
      <FooterBar initialSettings={initialSettings} />
    </>
  );
}
