// utils/pollStatus.js
export async function pollStatus(orderTrackingId, interval = 3000, timeout = 60000) {
  const BACKEND = "https://your-backend.example.com";
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      const resp = await fetch(`${BACKEND}/pesapal/status/${encodeURIComponent(orderTrackingId)}`);
      const json = await resp.json();
      const status = json?.status;

      if (status && ["COMPLETED", "FAILED", "ERROR"].includes(status.toUpperCase())) {
        return json;
      }
    } catch (err) {
      console.error("pollStatus error", err);
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  return { timeout: true };
}
