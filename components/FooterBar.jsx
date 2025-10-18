"use client";
import Image from "next/image";
import { useMemo } from "react";

export default function FooterBar({ initialSettings }) {
  const year = new Date().getFullYear();

  const store = useMemo(() => initialSettings || {
    store_name: "Eybitech",
    locality: "Trinidad, Cuba",
    schedule: "8:00 AM - 8:00 PM (Lun-Sáb)",
    email: "eybtech@gmail.com",
    whatsapp: "+5358408409",
    phone: "+5358408409",
    socials: {},
  logoSrc: "/logo.png",
  }, [initialSettings]);

  const normalizeUrl = (platform, value) => {
    if (!value) return "";
    // Convert handles to URLs when needed
    const v = value.trim();
    if (platform === "instagram") {
      if (v.startsWith("@")) return `https://instagram.com/${v.slice(1)}`;
      if (!/^https?:\/\//i.test(v)) return `https://instagram.com/${v}`;
      return v;
    }
    if (platform === "facebook") {
      if (!/^https?:\/\//i.test(v)) return `https://facebook.com/${v}`;
      return v;
    }
    if (platform === "tiktok") {
      if (v.startsWith("@")) return `https://tiktok.com/${v}`;
      if (!/^https?:\/\//i.test(v)) return `https://tiktok.com/@${v}`;
      return v;
    }
    if (platform === "youtube") {
      if (!/^https?:\/\//i.test(v)) return `https://youtube.com/${v}`;
      return v;
    }
    if (platform === "twitter") {
      if (v.startsWith("@")) return `https://twitter.com/${v.slice(1)}`;
      if (!/^https?:\/\//i.test(v)) return `https://twitter.com/${v}`;
      return v;
    }
    if (platform === "whatsapp") {
      // Accept full link if provided; else build from number
      if (/^https?:\/\//i.test(v)) return v;
      const digits = v.replace(/[^\d]/g, "");
      return digits ? `https://wa.me/${digits}` : "";
    }
    return v;
  };

  const socialLinks = [
    { key: "facebook", url: normalizeUrl("facebook", store.socials?.facebook), label: "Facebook", icon: (
      <svg viewBox="0 0 320 512" className="w-5 h-5 text-[#1877F2]"><path fill="currentColor" d="M279.14 288l14.22-92.66h-88.91V127.53c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.09 44.38-121.09 124.72v70.62H22.89V288h81.38v224h100.2V288z"/></svg>
    )},
    { key: "instagram", url: normalizeUrl("instagram", store.socials?.instagram), label: "Instagram", icon: (
      <svg viewBox="0 0 448 512" className="w-5 h-5 text-[#E1306C]"><path fill="currentColor" d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.2 0-74.7-33.4-74.7-74.7s33.4-74.7 74.7-74.7 74.7 33.4 74.7 74.7-33.5 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zM398.8 80C362.4 43.7 313.2 24 262.4 24H185.6C134.8 24 85.6 43.7 49.2 80 12.9 116.4-6.8 165.6-6.8 216.4v76.8c0 50.8 19.7 100 56 136.4C85.6 466.3 134.8 486 185.6 486h76.8c50.8 0 100-19.7 136.4-56 36.3-36.4 56-85.6 56-136.4v-76.8c0-50.8-19.7-100-56-136.4zM224 338.6c-45.4 0-82.6-37.2-82.6-82.6S178.6 173.4 224 173.4s82.6 37.2 82.6 82.6-37.2 82.6-82.6 82.6z"/></svg>
    )},
    { key: "tiktok", url: normalizeUrl("tiktok", store.socials?.tiktok), label: "TikTok", icon: (
      <svg viewBox="0 0 448 512" className="w-5 h-5 text-[#000000]"><path fill="currentColor" d="M448 209.9v89.6c-50.7-1.1-97-16.2-137.5-43.2v122.8c0 73.7-59.7 133.4-133.4 133.4S43.7 452.8 43.7 379.2 103.4 245.8 177.1 245.8c9.6 0 18.9 1 27.9 2.9v92.6c-8.5-2.6-17.6-4-27.1-4-40.3 0-73 32.7-73 73s32.7 73 73 73 73-32.7 73-73V0h89.6c8.3 63.9 57.6 114.7 120.9 120.9z"/></svg>
    )},
    { key: "youtube", url: normalizeUrl("youtube", store.socials?.youtube), label: "YouTube", icon: (
      <svg viewBox="0 0 576 512" className="w-5 h-5 text-[#FF0000]"><path fill="currentColor" d="M549.655 124.083c-6.281-23.65-24.787-42.207-48.284-48.516C458.83 64 288 64 288 64S117.17 64 74.629 75.567c-23.497 6.309-42.003 24.866-48.284 48.516C14.72 166.9 14.72 256.1 14.72 256.1s0 89.2 11.625 131.983c6.281 23.65 24.787 42.207 48.284 48.516C117.17 448.7 288 448.7 288 448.7s170.83 0 213.371-11.567c23.497-6.309 42.003-24.866 48.284-48.516C561.28 345.3 561.28 256.1 561.28 256.1s0-89.2-11.625-131.983zM232.2 338.2V173.9l142.7 82.1-142.7 82.2z"/></svg>
    )},
    { key: "twitter", url: normalizeUrl("twitter", store.socials?.twitter), label: "Twitter", icon: (
      <svg viewBox="0 0 512 512" className="w-5 h-5 text-[#1DA1F2]"><path fill="currentColor" d="M459.4 151.7c.3 4.5.3 9 .3 13.6 0 139-105.8 299-299 299-59.5 0-114.7-17.2-161.1-47 8.4 1 16.8 1.3 25.6 1.3 49.1 0 94.2-16.6 130.3-44.8-46-1-84.8-31.2-98.1-72.8 6.5 1 13.1 1.6 20 1.6 9.6 0 19-1.3 27.8-3.6-48.1-9.7-84.3-52.1-84.3-103v-1.3c14.3 7.9 30.8 12.7 48.3 13.3-28.6-19.1-47.3-51.7-47.3-88.6 0-19.5 5.2-37.7 14.3-53.4 52.1 64 130.4 106 218.4 110.5-1.6-7.8-2.6-15.9-2.6-24.1 0-58.5 47.4-105.9 105.9-105.9 30.5 0 58.1 12.9 77.5 33.7 24.1-4.7 46.7-13.6 67-25.6-7.9 24.6-24.6 45.2-46.4 58.3 21.4-2.4 41.9-8.1 60.7-16.2-14.3 21.1-32.4 39.6-53.1 54.5z"/></svg>
    )},
    { key: "whatsapp", url: normalizeUrl("whatsapp", store.socials?.whatsapp || store.whatsapp), label: "WhatsApp", icon: (
      <svg viewBox="0 0 448 512" className="w-5 h-5 text-[#25D366]"><path fill="currentColor" d="M380.9 97.1C339 55.1 283.2 32 224.9 32c-116.1 0-210 93.9-210 210 0 37 9.7 73.1 28.1 105L0 480l137.9-42.7c30.8 16.8 65.6 25.6 101.1 25.6h.1c116.1 0 210-93.9 210-210 .1-58.3-22.9-114.1-64.2-156.8zM224.9 438.7h-.1c-32.2 0-63.7-8.6-91.2-24.9l-6.5-3.9-81.8 25.3 26.1-79.7-4.1-6.6c-17.4-28.1-26.6-60.6-26.6-93.8 0-97.4 79.2-176.6 176.6-176.6 47.1 0 91.3 18.3 124.6 51.6 33.3 33.4 51.6 77.6 51.5 124.7 0 97.4-79.2 176.6-176.5 176.6z"/></svg>
    )},
  ].filter(i => i.url);

  return (
    <footer className="bg-gray-900 text-white mt-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
              {/* Logo */}
              <div className="w-10 h-10 relative">
                <Image src={store.logoSrc} alt="Logo" fill sizes="40px" className="object-contain" />
              </div>
              <h3 className="text-xl font-bold">
                <span className="text-blue-400">{(store.store_name || "Eybitech").slice(0,4)}</span>
                {(store.store_name || "Eybitech").slice(4)}
              </h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Tu tienda de tecnología en Cuba
            </p>
            <p className="text-gray-500 text-xs mt-2">Desde 2025</p>
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold mb-3 text-gray-200">Contacto</h4>
            <div className="space-y-2 text-sm text-gray-400">
              {store.phone && (
                <div>
                  Teléfono: <a className="hover:text-white" href={`tel:${store.phone.replace(/[^\d+]/g, "")}`}>{store.phone}</a>
                </div>
              )}
              {store.whatsapp && (
                <div>
                  WhatsApp: <a className="hover:text-white" href={`https://wa.me/${store.whatsapp.replace(/[^\d]/g, "")}`} target="_blank" rel="noopener noreferrer">{store.whatsapp}</a>
                </div>
              )}
              {store.email && (
                <div>
                  Email: <a className="hover:text-white" href={`mailto:${store.email}`}>{store.email}</a>
                </div>
              )}
              {(store.address || store.locality) && (
                <div>{store.address ? `${store.address}, ` : ""}{store.locality}</div>
              )}
            </div>
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold mb-3 text-gray-200">Horario</h4>
            <div className="space-y-2 text-sm text-gray-400">
              {store.schedule && <div>{store.schedule}</div>}
              <p className="text-xs text-gray-500 italic mt-3">Domingos cerrado</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">© {year} <span className="font-semibold text-blue-400">{store.store_name || "Eybitech"}</span>. Todos los derechos reservados.</p>
            <div className="flex items-center gap-3">
              {socialLinks.length > 0 ? (
                socialLinks.map(s => (
                  <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors" aria-label={s.label} title={s.label}>
                    {s.icon}
                  </a>
                ))
              ) : (
                <span className="text-sm text-gray-500">Síguenos en redes</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
