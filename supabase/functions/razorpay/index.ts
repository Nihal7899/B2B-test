import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};
const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const encoder = new TextEncoder();

async function hmacSha256(secret: string, value: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(value));
  return Array.from(new Uint8Array(signature)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Authentication required" }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Authentication required" }, 401);
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keyId || !keySecret) return json({ error: "Payment service is unavailable" }, 503);
    const body = await req.json() as { action?: string; order_id?: string; amount?: number; payment_id?: string; signature?: string };

    if (body.action === "create_order") {
      if (!body.order_id || typeof body.amount !== "number" || body.amount <= 0) return json({ error: "Invalid payment request" }, 400);
      const { data: order } = await supabase.from("orders").select("id, user_id, total").eq("id", body.order_id).eq("user_id", user.id).maybeSingle();
      if (!order || Math.round(Number(order.total) * 100) !== Math.round(body.amount * 100)) return json({ error: "Invalid order" }, 400);
      const response = await fetch("https://api.razorpay.com/v1/orders", { method: "POST", headers: { Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`, "Content-Type": "application/json" }, body: JSON.stringify({ amount: Math.round(body.amount * 100), currency: "INR", receipt: body.order_id }) });
      if (!response.ok) return json({ error: "Could not start payment" }, 502);
      const razorOrder = await response.json() as { id?: string };
      if (!razorOrder.id) return json({ error: "Could not start payment" }, 502);
      await supabase.from("payments").upsert({ order_id: body.order_id, user_id: user.id, provider: "razorpay", provider_order_id: razorOrder.id, amount: body.amount, status: "pending" }, { onConflict: "order_id" });
      // Mark order as pending_payment until verification succeeds
      await supabase.from("orders").update({ status: "pending_payment" }).eq("id", body.order_id);
      return json({ razorpay_order_id: razorOrder.id, key_id: keyId });
    }

    if (body.action === "verify_payment") {
      if (!body.order_id || !body.payment_id || !body.signature) return json({ error: "Invalid payment verification" }, 400);
      const { data: payment } = await supabase.from("payments").select("provider_order_id").eq("order_id", body.order_id).eq("user_id", user.id).maybeSingle();
      if (!payment?.provider_order_id) return json({ error: "Payment not found" }, 404);
      const expected = await hmacSha256(keySecret, `${payment.provider_order_id}|${body.payment_id}`);
      if (expected !== body.signature) return json({ error: "Payment verification failed" }, 400);
      const { error: payErr } = await supabase.from("payments").update({ provider_payment_id: body.payment_id, status: "paid" }).eq("order_id", body.order_id).eq("user_id", user.id);
      if (payErr) return json({ error: "Could not save payment" }, 500);
      // Only confirm the order after signature verification succeeds
      const { error: orderErr } = await supabase.from("orders").update({ status: "confirmed" }).eq("id", body.order_id);
      if (orderErr) return json({ error: "Could not update order status" }, 500);
      return json({ verified: true });
    }

    if (body.action === "cancel_order") {
      if (!body.order_id) return json({ error: "Order ID required" }, 400);
      const { data: order } = await supabase.from("orders").select("id, user_id, status").eq("id", body.order_id).eq("user_id", user.id).maybeSingle();
      if (!order) return json({ error: "Order not found" }, 404);
      if (order.status === "pending_payment") {
        await supabase.from("orders").update({ status: "cancelled" }).eq("id", body.order_id);
        await supabase.from("payments").update({ status: "cancelled" }).eq("order_id", body.order_id);
      }
      return json({ cancelled: true });
    }

    return json({ error: "Invalid payment action" }, 400);
  } catch {
    return json({ error: "Could not complete payment request" }, 500);
  }
});
