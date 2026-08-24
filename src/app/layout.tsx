import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  description:
    "Premier university student and alumni networking platform in Bangladesh. Connect, collaborate, and discover opportunities.",
  icons: {
    apple: "/icon.svg?v=3",
    icon: [
      { type: "image/svg+xml", url: "/icon.svg?v=3" },
      { type: "image/png", url: "/icon.png" },
      { type: "image/png", url: "/brand/icon.png" },
    ],
    shortcut: "/icon.svg?v=3",
  },
  title: "Shongjog | University Student & Alumni Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased`}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <link href="/icon.svg?v=3" rel="icon" type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('shongjog-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary">
        {children}
      </body>
    </html>
  );
}
