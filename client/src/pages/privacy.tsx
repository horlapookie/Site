
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={false} />

      <main className="container px-4 py-16 md:px-6">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-3xl">Privacy Policy</CardTitle>
              <CardDescription>
                Last updated: {new Date().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
                <p className="text-muted-foreground">
                  We collect information you provide directly to us, including your email address, 
                  name, and WhatsApp bot session data. We also collect information about your usage 
                  of our services, including deployment logs and bot activity.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
                <p className="text-muted-foreground mb-2">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Deploy and manage your WhatsApp bots</li>
                  <li>Process referral rewards and coin claims</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Monitor and analyze usage patterns</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
                <p className="text-muted-foreground">
                  We do not sell or share your personal information with third parties except as 
                  necessary to provide our services (such as deployment hosting providers) or as 
                  required by law.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
                <p className="text-muted-foreground">
                  We implement appropriate security measures to protect your information. However, 
                  no method of transmission over the Internet is 100% secure, and we cannot guarantee 
                  absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Your Bot Data</h2>
                <p className="text-muted-foreground">
                  Your WhatsApp bot session data is encrypted and stored securely. We do not access 
                  your bot's messages or contacts unless necessary for technical support with your 
                  explicit permission.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Cookies and Tracking</h2>
                <p className="text-muted-foreground">
                  We use local storage and authentication tokens to maintain your session. We do not 
                  use third-party tracking cookies.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
                <p className="text-muted-foreground">
                  You have the right to access, update, or delete your personal information at any time. 
                  You can also request a copy of your data or close your account.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Children's Privacy</h2>
                <p className="text-muted-foreground">
                  Our services are not intended for users under the age of 13. We do not knowingly 
                  collect information from children under 13.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will notify you of any 
                  changes by posting the new Privacy Policy on this page and updating the "Last updated" 
                  date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us through our 
                  support channels.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
