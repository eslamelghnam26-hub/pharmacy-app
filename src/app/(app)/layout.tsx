import { cookies } from "next/headers";
import { AppProvider } from "@/components/providers";
import { Shell } from "@/components/Shell";
import { parseSettings, SETTINGS_COOKIE } from "@/lib/i18n";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = parseSettings((await cookies()).get(SETTINGS_COOKIE)?.value);

  return (
    <AppProvider initialLang={settings.lang} initialTheme={settings.theme}>
      <Shell>{children}</Shell>
    </AppProvider>
  );
}