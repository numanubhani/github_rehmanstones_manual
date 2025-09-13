    // src/hooks/useA2HS.ts
import { useEffect, useState } from "react";

export default function useA2HS() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));

    // detect standalone mode
    const isStandalone =
      (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      // @ts-ignore iOS
      (window.navigator as any).standalone === true;
    if (isStandalone) setInstalled(true);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const canInstall = !!deferredPrompt && !installed;

  const install = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return outcome === "accepted";
  };

  return { canInstall, install, installed };
}
