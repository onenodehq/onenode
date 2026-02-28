import type { Metadata } from 'next';
import { IBM_Plex_Sans } from 'next/font/google';
import '@/styles/globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { ApiLanguageProvider } from '@/context/ApiLanguageContext';
import { DownloadModalProvider } from '@/context/DownloadModalContext';
import DownloadModal from '@/components/DownloadModal';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

const ibmPlexSans = IBM_Plex_Sans({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'OneNode Docs',
  description: 'The chillest AI-native database out there.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={ibmPlexSans.className}>
        <DownloadModalProvider>
          <div className="flex min-h-screen content-bg">
            {/* Sidebar - moved outside language contexts to prevent re-renders */}
            <Sidebar />
            
            {/* Main content area with language contexts */}
            <main className="flex-1 ml-56">
              <LanguageProvider>
                <ApiLanguageProvider>
                  {/* Navbar - kept inside contexts as it may need language/api context */}
                  <Navbar />
                  
                  {/* Content */}
                  <div className="max-w-[1400px] mx-auto px-6 pt-2 pb-8">
                    {children}
                  </div>
                  
                  <ToastContainer 
                    position="bottom-right"
                    autoClose={4000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                  />
                </ApiLanguageProvider>
              </LanguageProvider>
            </main>
          </div>
          
          {/* Global modal - rendered at app level, not constrained by navbar */}
          <DownloadModal />
        </DownloadModalProvider>
      </body>
    </html>
  );
} 