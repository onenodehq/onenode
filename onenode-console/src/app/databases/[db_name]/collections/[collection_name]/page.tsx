"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppContext } from "@/app/contexts/AppContext";
import PageLoader from "@/app/components/PageLoader";

export default function Page({
  params,
}: {
  params: { db_name: string; collection_name: string };
}) {
  const { currentProject } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Only redirect if we have the project data
    if (currentProject) {
      setIsRedirecting(true);
      router.replace(`${pathname}/documents`);
    }
  }, [currentProject, router, pathname]);

  // If no project data yet, show simple loading state
  if (!currentProject && !isRedirecting) {
    return <PageLoader />;
  }

  // Return null during the redirect to avoid flashing content
  return null;
}
