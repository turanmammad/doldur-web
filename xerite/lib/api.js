// Doldur veb — Supabase sorğuları. Hər sorğu mobil tətbiqin
// `app/lib/data/*_repository.dart` fayllarındakı ilə EYNİDİR (ad, parametr, sıra).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { SUPABASE_URL, SUPABASE_KEY, RELAY_BASE } from './config.js';

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'doldur-web-auth' },
});

/** Xəta → { code, message, status } (UI dürüst mətn seçsin deyə). */
async function norm(error) {
  if (!error) return null;
  let code = error.code || null, status = error.status || null, body = null;
  // supabase-js FunctionsHttpError: cavab gövdəsi `context`-dədir.
  if (error.context && typeof error.context.json === 'function') {
    try { body = await error.context.clone().json(); } catch (e) { /* gövdə JSON deyil */ }
    status = error.context.status;
    if (body && body.error) code = typeof body.error === 'string' ? body.error : (body.error.code || code);
  }
  if (!code && /Failed to fetch|NetworkError|Load failed/i.test(error.message || '')) code = 'offline';
  return { code, status, message: error.message || String(error), body };
}
/**
 * 19.11.2026 — veb hadisələri (mobil tətbiqlə eyni `log_events`, platform 'web').
 * Cihaz nömrəsi və DNT/bot/host yoxlaması `/assets/site/track.js`-dəndir (sayt ilə ortaq);
 * o yüklənməyibsə heç nə göndərilmir. Girişlisənsə JWT ilə gedir → hesaba bağlanır (tətbiqdəki kimi).
 */
export function track(name, props) {
  try {
    if (typeof window.doldurDeviceId !== 'function' || !window.doldurTrackOff || window.doldurTrackOff()) return;
    sb.rpc('log_events', {
      p_device_id: window.doldurDeviceId(),
      p_events: [{ name, ts: new Date().toISOString(), props: props || {} }],
      p_platform: 'web', p_app_version: null,
    }).then(() => {}, () => {});
  } catch (e) { /* analitika heç vaxt UI-ni sındırmır */ }
}

async function run(p) {
  try {
    const { data, error } = await p;
    if (error) return { error: await norm(error) };
    return { data };
  } catch (e) {
    return { error: await norm(e) };
  }
}

// ---- ANONİM OXUMA: keşli relay (Supabase egress qoruması) ----
// 🔴 Anonim oxuma sorğuları Supabase-ə BİRBAŞA getmir — relay 5 dəq keşləyir,
// Supabase düşəndə köhnə cavabı verir. Cavab forması RPC ilə eynidir.
async function relay(path) {
  try {
    const r = await fetch(RELAY_BASE + path, { headers: { Accept: 'application/json' } });
    if (!r.ok) return { error: { code: r.status === 404 ? 'not_found' : 'relay_' + r.status, status: r.status, message: 'HTTP ' + r.status } };
    return { data: await r.json() };
  } catch (e) {
    return { error: { code: 'offline', message: String(e && e.message || e) } };
  }
}
/** Bütün AZ stansiyaları (stations_in_bounds_lite). distance_meters/is_favorite istifadəçiyə görə DEYİL. */
export const stationsLite = () => relay('/stations');
/** station_detail — istifadəçi koordinatı olmadan (məsafə brauzerdə hesablanır). */
export const stationDetail = (id) => relay('/station?id=' + encodeURIComponent(id));
export const costConfig = () => relay('/cost-config');
export const vehicleCatalog = () => relay('/catalog');
/** operators — relay `id` vermir: stansiyaya operator ADI ilə bağlanır. */
export const operators = () => relay('/operators');
export const reviews = (stationId) => relay('/reviews?id=' + encodeURIComponent(stationId));

// ---- rəylər (ReviewRepository) ----
/** 🔴 YAZI — yoxlanmayıb (test zamanı prod-a yazılmadı). Tətbiqin StationReview.toJson-u. */
export function insertReview({ stationId, worked, reasons, comment }) {
  const row = { station_id: stationId, worked, reasons: reasons || [] };
  if (comment && comment.trim()) row.comment = comment.trim();
  return run(sb.from('station_reviews').insert(row));
}

// ---- favoritlər (FavoriteRepository) ----
export const favoriteStations = () => run(sb.rpc('favorite_stations'));
/** 🔴 YAZI — yoxlanmayıb. Qaytarır: yeni vəziyyət (true = favoritdədir). */
export const toggleFavorite = (stationId) => run(sb.rpc('toggle_favorite', { p_station_id: stationId }));

// ---- tarixçə (SessionRepository) ----
export const history = (offset = 0, limit = 50) => run(sb.from('v_session_history').select().order('started_at', { ascending: false }).range(offset, offset + limit));
export const monthlySummary = (months = 6) => run(sb.rpc('session_monthly_summary', { p_months: months }));

// ---- marşrut (RouteRepository) ----
/** Birbaşa Supabase — YALNIZ Marşrut səhifəsində, debounce ≥400 ms, ≥3 simvol. */
export const searchPlaces = (q) => run(sb.rpc('search_places', { p_query: q, p_limit: 10 }));
/** route-plan — Google Routes-a pul xərcləyir: YALNIZ «Hesabla» düyməsi ilə çağırılır. */
export const routePlan = (body) => run(sb.functions.invoke('route-plan', { body }));

// ---- hesab (AuthRepository) ----
/** 🔴 E-poçt GÖNDƏRİR — test zamanı çağırılmadı. */
export const sendEmailCode = (email) => run(sb.auth.signInWithOtp({
  email: email.trim().toLowerCase(),
  options: { shouldCreateUser: true, data: { signup_platform: 'web', signup_app: 'doldur-web' } },
}));
export const verifyEmailCode = (email, code) => run(sb.auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.replace(/\D/g, ''), type: 'email' }));
export const signInWithIdToken = (provider, idToken, nonce) => run(sb.auth.signInWithIdToken({ provider, token: idToken, nonce }));
export const signOut = () => run(sb.auth.signOut());
/** 🔴 DAĞIDICI — yalnız açıq təsdiqdən sonra; yoxlanmayıb. */
export const deleteAccount = () => run(sb.functions.invoke('account-delete'));
export const profile = (uid) => run(sb.from('profiles').select('*').eq('id', uid).maybeSingle());
export const userVehicles = () => run(sb.from('user_vehicles').select('*').order('created_at'));

/**
 * 🔴 YAZI — yoxlanmayıb. Tətbiqin VehicleRepository.saveUserVehicle-ı
 * (əvvəlki əsas maşını is_primary=false et, sonra bu modeli yenilə/yarat).
 */
export async function saveUserVehicle(uid, modelId) {
  const fields = { is_primary: true, updated_at: new Date().toISOString() };
  const r1 = await run(sb.from('user_vehicles').update({ is_primary: false }).eq('user_id', uid).eq('is_primary', true).neq('model_id', modelId));
  if (r1.error) return r1;
  const ex = await run(sb.from('user_vehicles').select('id').eq('user_id', uid).eq('model_id', modelId).order('created_at').limit(1));
  if (ex.error) return ex;
  if (ex.data && ex.data.length) return run(sb.from('user_vehicles').update(fields).eq('id', ex.data[0].id));
  return run(sb.from('user_vehicles').insert({ ...fields, user_id: uid, model_id: modelId }));
}
