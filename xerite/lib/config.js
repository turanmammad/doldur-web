// İctimai müştəri açarları — mobil tətbiqdə də açıq göndərilir (publishable).
// RLS hər yazı/oxu hüququnu serverdə yoxlayır; bu açar heç bir gizli icazə vermir.
export const SUPABASE_URL = 'https://cruqwpypobvoifcoaqxh.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_Vzh9aNRxkjjq8kElijd_Zg_jJIH8YfS';
export const MAPTILER_KEY = 'YA8BKDDSs5XfLXyg9JsS';
export const GOOGLE_WEB_CLIENT_ID = '723130328915-i2p3v67kifmlb4bap9rfkv7lvtjvekjh.apps.googleusercontent.com';

// Apple «Services ID» (Sign in with Apple JS). Boşdursa düymə deaktivdir («tezliklə»).
export const APPLE_WEB_SERVICES_ID = 'az.doldur.web';
export const APPLE_REDIRECT_URI = 'https://doldur.pro-tech.az/xerite/';
// Keşli oxuma API-si (lead quraşdırıb): CORS *, gzip, 5 dəq keş.
export const RELAY_BASE = 'https://doldur-relay.pro-tech.az/doldur/v1';

export const PLAY_URL = 'https://play.google.com/store/apps/details?id=az.doldur';
export const APPSTORE_URL = 'https://apps.apple.com/az/app/id6804632387';

// Coğrafi mövqe yoxdursa məsafə buradan sayılır (Bakı mərkəzi) — UI bunu açıq deyir.
export const BAKU_CENTER = { lat: 40.3700, lng: 49.8360 }; // Fəvvarələr meydanı (şəhər mərkəzi)
export const POLL_MS = 300000;
