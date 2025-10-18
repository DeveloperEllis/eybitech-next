import { supabaseServer } from "../../lib/supabase/serverClient";
import { CONTACT_INFO, URLS, BUSINESS_INFO } from "../../constants/appConstants";

// Simple in-memory cache to avoid frequent DB reads on server
let cache = { data: null, ts: 0 };
const REVALIDATE_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch store settings from Supabase and merge with defaults from appConstants.
 * Returns a normalized settings object that the app can consume.
 */
export async function getStoreSettings() {
  const now = Date.now();
  if (cache.data && now - cache.ts < REVALIDATE_MS) return cache.data;

  const supabase = supabaseServer();
  // Prefer the most recently updated row if multiple exist
  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) {
    // On error, just return defaults
    const defaults = buildDefaults();
    cache = { data: defaults, ts: now };
    return defaults;
  }

  const row = (data && data[0]) || {};
  const merged = {
    store_name: row.store_name || BUSINESS_INFO.NAME || "Eybitech",
    phone: row.phone || CONTACT_INFO.PHONE_NUMBER || "",
    whatsapp: row.whatsapp || CONTACT_INFO.WHATSAPP_NUMBER || "",
    email: row.email || CONTACT_INFO.EMAIL || "",
    address: row.address || "",
    locality: row.locality || CONTACT_INFO.LOCATION || "",
    schedule: row.schedule || CONTACT_INFO.BUSINESS_HOURS || "",
    socials: {
      facebook: row.facebook_url || URLS.FACEBOOK_PAGE || "",
      instagram: row.instagram_url || URLS.INSTAGRAM_HANDLE || "",
      tiktok: row.tiktok_url || "",
      youtube: row.youtube_url || "",
      twitter: row.twitter_url || URLS.TWITTER_HANDLE || "",
      whatsapp: row.whatsapp_url || "",
    },
  // Static asset path for logo (placed in /public)
  logoSrc: "/logo.png",
  };

  cache = { data: merged, ts: now };
  return merged;
}

function buildDefaults() {
  return {
    store_name: BUSINESS_INFO.NAME || "Eybitech",
    phone: CONTACT_INFO.PHONE_NUMBER || "",
    whatsapp: CONTACT_INFO.WHATSAPP_NUMBER || "",
    email: CONTACT_INFO.EMAIL || "",
    address: "",
    locality: CONTACT_INFO.LOCATION || "",
    schedule: CONTACT_INFO.BUSINESS_HOURS || "",
    socials: {
      facebook: URLS.FACEBOOK_PAGE || "",
      instagram: URLS.INSTAGRAM_HANDLE || "",
      tiktok: "",
      youtube: "",
      twitter: URLS.TWITTER_HANDLE || "",
      whatsapp: "",
    },
  logoSrc: "/logo.png",
  };
}
