/**
 * Client-side feature flags (Vite env).
 * Toggle without redeploying code logic — set in .env.local / Vercel env.
 *
 * VITE_FEATURE_BLOOM_ANALYTICS=true|false  (weekly + monthly insights card)
 * VITE_FEATURE_INSIGHTS_XAI=true|false     (explainable AI narrative before recommendations)
 */
function envFlag(name: "VITE_FEATURE_BLOOM_ANALYTICS" | "VITE_FEATURE_INSIGHTS_XAI"): boolean {
  const raw =
    (typeof import.meta !== "undefined" && import.meta.env?.[name]) ||
    "";
  const value = String(raw).trim().toLowerCase();
  return value === "true" || value === "1" || value === "yes" || value === "on";
}

/** Weekly + monthly insights / analytics card. */
export function isBloomAnalyticsEnabled(): boolean {
  return envFlag("VITE_FEATURE_BLOOM_ANALYTICS");
}

/** XAI explain-block before recommendations (requires Bloom Analytics flag too). */
export function isInsightsXaiEnabled(): boolean {
  if (!isBloomAnalyticsEnabled()) return false;
  // Default ON when parent flag is on, unless explicitly disabled
  const raw =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_FEATURE_INSIGHTS_XAI) ||
    "";
  if (String(raw).trim() === "") return true;
  return envFlag("VITE_FEATURE_INSIGHTS_XAI");
}
