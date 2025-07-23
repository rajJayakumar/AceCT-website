import Head from "next/head";
import Header from "./components/landing/Header";
import { AuthProvider } from './context/AuthContext';
import './globals.css'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>AceCT</Head>
      <body className="bg-gray-100">
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
