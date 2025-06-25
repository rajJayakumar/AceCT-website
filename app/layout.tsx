import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Navbar from "./components/navbar";
import BootstrapClient from "./components/BootstrapClient";
import { AuthProvider } from './context/AuthContext';
import './globals.css'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body data-bs-theme="light">
        <AuthProvider>
          <Navbar />
          {children}
          <BootstrapClient />
        </AuthProvider>
      </body>
    </html>
  );
}
