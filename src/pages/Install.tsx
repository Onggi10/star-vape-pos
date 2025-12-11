import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, CheckCircle, Share, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Aplikasi Sudah Terinstall!
          </h1>
          <p className="text-muted-foreground mb-6">
            Star Vape POS sudah terinstall di perangkat Anda.
          </p>
          <Button onClick={() => navigate("/")} className="w-full">
            Buka Aplikasi
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <img
            src="/images/starvape-logo.jpeg"
            alt="Star Vape Logo"
            className="w-24 h-24 rounded-2xl mx-auto mb-4 shadow-lg"
          />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Install Star Vape POS
          </h1>
          <p className="text-muted-foreground">
            Install aplikasi untuk akses cepat dari home screen
          </p>
        </div>

        {isIOS ? (
          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">
                Cara Install di iPhone/iPad:
              </h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </span>
                  <span className="flex items-center gap-2">
                    Tap tombol <Share className="w-4 h-4 inline" /> Share di Safari
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  <span>Scroll ke bawah dan pilih "Add to Home Screen"</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </span>
                  <span>Tap "Add" di pojok kanan atas</span>
                </li>
              </ol>
            </div>
          </div>
        ) : deferredPrompt ? (
          <Button onClick={handleInstall} className="w-full gap-2" size="lg">
            <Download className="w-5 h-5" />
            Install Sekarang
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">
                Cara Install di Android:
              </h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </span>
                  <span className="flex items-center gap-2">
                    Tap tombol <MoreVertical className="w-4 h-4 inline" /> menu di Chrome
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  <span>Pilih "Install app" atau "Add to Home screen"</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </span>
                  <span>Tap "Install" untuk konfirmasi</span>
                </li>
              </ol>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Keuntungan Install:
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Akses cepat dari home screen</li>
            <li>✓ Bisa digunakan offline</li>
            <li>✓ Tampilan fullscreen tanpa browser</li>
            <li>✓ Loading lebih cepat</li>
          </ul>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="w-full mt-6"
        >
          Kembali ke Aplikasi
        </Button>
      </Card>
    </div>
  );
}
