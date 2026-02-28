"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "./contexts/AppContext";
import Image from "next/image";
import Loader from "./components/Loader";

export default function Page() {
  const { collections } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (collections.length) {
      const db_name = collections[0].db_name;
      const collection_name = collections[0].name;
      router.push(
        `/databases/${db_name}/collections/${collection_name}/documents`
      );
    } else {
      // If no collections are found after a short delay, redirect to databases page
      const timer = setTimeout(() => {
        router.push('/databases');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [collections, router]);

  // Show loading screen while checking for collections
  return (
    <div className="w-full h-svh flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center">
        <Image
          src="https://onenode.ai/images/mainIcon.png"
          width={80}
          height={80}
          alt="OneNode Logo"
          className="mb-6"
        />
        <Loader 
          color="#3B82F6" 
          size="medium" 
          type="dots" 
          text="Loading your OneNode workspace..." 
        />
      </div>
    </div>
  );
}
