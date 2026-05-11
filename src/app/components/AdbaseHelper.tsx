// src/services/adbase.ts

export interface AdbasePayload {
  id: number;
  addid: string;
  sourceip: string;
  destinationip: string;
  clientid: string;
  mktgurl: string;
  origplatform: string;
  targetplatform: string;
  uid: string;
  ulat: string;
  ulong: string;
  cost: number;
  price: number;
  discount: number;
}

/**
 * postAdbase
 * ----------
 * Lightweight helper for sending Adbase events.
 * Works before or after login, fills missing fields automatically,
 * and never throws (safe for production + low‑security mode).
 */
export async function postAdbase(partial: Partial<AdbasePayload>) {
  try {
    // Pull values from localStorage if available
    const uid = localStorage.getItem("uid") || "";
    const latitude = localStorage.getItem("latitude") || "";
    const longitude = localStorage.getItem("longitude") || "";
    const ip = localStorage.getItem("ipAddress") || "";

    // Build the payload matching backend schema EXACTLY
    const payload: AdbasePayload = {
      id: 0,
      addid: partial.addid ?? "generic",
      sourceip: partial.sourceip ?? ip,
      destinationip: partial.destinationip ?? "",
      clientid: partial.clientid ?? uid,
      mktgurl: partial.mktgurl ?? window.location.href,
      origplatform: partial.origplatform ?? "web",
      targetplatform: partial.targetplatform ?? "web",
      uid: partial.uid ?? uid,
      ulat: partial.ulat ?? latitude,
      ulong: partial.ulong ?? longitude,
      cost: partial.cost ?? 0,
      price: partial.price ?? 0,
      discount: partial.discount ?? 0
    };

    // POST to the correct endpoint (root only)
    await fetch(
      "https://lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net/api/Addbase",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

  } catch (err) {
    console.warn("Adbase post failed:", err);
  }
}

/**
 * postAdbaseMany
 * --------------
 * Posts an array of Adbase records one at a time.
 * Use this when you have nested/grouped ad data — the API
 * does not yet support bulk/nested payloads so we loop individually.
 */
export async function postAdbaseMany(items: Partial<AdbasePayload>[]) {
  for (const item of items) {
    await postAdbase(item);
  }
}
