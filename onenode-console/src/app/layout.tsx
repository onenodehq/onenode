import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import getUser from "./utils/user/getUser";
import { AuthContextProvider } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import DeleteModal from "./components/modal/DeleteModal";
import NavBar from "./components/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OneNode",
  description: "All-in-one db for AI-apps",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();

  return (
    <html lang="en  bg-white relative">
      <AuthContextProvider user={user}>
        <AppProvider>
          <body className={`${inter.className} relative h-dvh`}>
            <ToastContainer
              theme="dark"
              hideProgressBar
              stacked
              autoClose={3000}
            />
            <main className="w-full h-full">
              <DeleteModal />
              <NavBar>{children}</NavBar>
            </main>
          </body>
        </AppProvider>
      </AuthContextProvider>
    </html>
  );
}
