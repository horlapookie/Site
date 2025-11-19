import { SiWhatsapp, SiTelegram } from "react-icons/si";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-background">
      <div className="container px-4 py-6 md:px-6">
        <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © 2024 Eclipse-MD. All rights reserved.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <p className="text-sm font-medium">Get Support:</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2"
                data-testid="link-whatsapp-channel"
              >
                <a
                  href="https://whatsapp.com/channel/0029VbBu7CaLtOjAOyp5kR1i"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SiWhatsapp className="h-4 w-4" />
                  Follow us on WhatsApp
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2"
                data-testid="link-telegram-admin"
              >
                <a
                  href="https://t.me/horlapookie"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SiTelegram className="h-4 w-4" />
                  Contact Admin
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
