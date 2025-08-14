export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      console.log("✅ Service Worker registered:", reg);
    } catch (err) {
      console.error("❌ SW registration failed:", err);
    }
  }
}
