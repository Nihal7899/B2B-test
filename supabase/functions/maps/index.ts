import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Authentication required" }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Authentication required" }, 401);

    const key = Deno.env.get("GOOGLE_MAPS_API_KEY") ?? Deno.env.get("MAPS_API_KEY");
    if (!key) return json({ error: "Maps service is unavailable" }, 503);
    const body = await req.json() as { action?: string; lat?: number; lng?: number; query?: string };
    if (body.action === "get_api_key") {
      return json({ api_key: key });
    }
    let url: string;
    if (body.action === "reverse_geocode" && typeof body.lat === "number" && typeof body.lng === "number") {
      url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(`${body.lat},${body.lng}`)}&key=${encodeURIComponent(key)}`;
    } else if (body.action === "search" && typeof body.query === "string" && body.query.trim()) {
      url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(body.query.trim())}&key=${encodeURIComponent(key)}`;
    } else {
      return json({ error: "Invalid map request" }, 400);
    }
    const response = await fetch(url);
    if (!response.ok) return json({ error: "Maps service is unavailable" }, 502);
    const result = await response.json() as { status?: string; results?: Array<{ formatted_address?: string; place_id?: string; geometry?: { location?: { lat?: number; lng?: number } }; address_components?: Array<{ long_name: string; types: string[] }> }> };
    if (result.status !== "OK" || !result.results?.[0]) return json({ address: null });
    const first = result.results[0];
    const component = (type: string) => first.address_components?.find((item) => item.types.includes(type))?.long_name ?? "";
    return json({ address: { formatted_address: first.formatted_address ?? "", place_id: first.place_id ?? null, line1: `${component("street_number")} ${component("route")}`.trim(), city: component("locality") || component("administrative_area_level_2"), state: component("administrative_area_level_1"), postal_code: component("postal_code"), latitude: first.geometry?.location?.lat ?? null, longitude: first.geometry?.location?.lng ?? null } });
  } catch {
    return json({ error: "Could not complete map request" }, 500);
  }
});
