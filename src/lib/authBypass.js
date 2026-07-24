// TEMPORARY — lets the app run without a working Supabase login session while
// auth issues are being sorted out. Set back to false (or delete this file and
// its two call sites in App.jsx / DataContext.jsx) to restore normal auth.
//
// This only skips checks in the frontend. If Supabase's Row Level Security
// policies require an authenticated user (typical for this kind of app),
// anonymous requests are still rejected at the database — flipping this flag
// does not touch RLS, so you may see empty data even with the login screen
// skipped, since that part is enforced server-side, not here.
export const AUTH_BYPASS_ENABLED = false;
