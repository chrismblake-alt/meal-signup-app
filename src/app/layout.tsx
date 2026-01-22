import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meal Sign-Up | Kids In Crisis",
  description: "Sign up to provide a meal for children at Kids In Crisis shelter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <img
                src="https://www.kidsincrisis.org/wp-content/themes/iop-kidsincrisis-1_0_2/dist/images/kids-in-crisis-logo@2x.png"
                alt="Kids In Crisis"
                className="h-12 w-auto"
              />
              <div>
                <p className="text-sm text-gray-500">Meal Sign-Up</p>
              </div>
            </a>
            <div className="text-right hidden sm:block">
              <p className="text-sm text-gray-500">Need Help?</p>
              <a href="tel:2036611911" className="text-[#e31837] font-semibold">(203) 661-1911</a>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-gray-50">
          {children}
        </main>

        <footer className="bg-gray-800 text-white py-8">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="font-semibold mb-2">Kids In Crisis</p>
            <p className="text-gray-400 text-sm">1 Salem Street, Cos Cob, CT 06807</p>
            <p className="text-gray-400 text-sm">(203) 661-1911</p>
            <div className="mt-4 flex justify-center gap-4">
              <a href="https://www.kidsincrisis.org" target="_blank" rel="noopener noreferrer" className="text-[#e31837] hover:underline text-sm">
                kidsincrisis.org
              </a>
              <a href="/admin" className="text-gray-500 hover:text-gray-300 text-sm">
                Admin
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
