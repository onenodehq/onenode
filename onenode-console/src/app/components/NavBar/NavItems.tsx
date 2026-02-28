import { useAppContext } from "@/app/contexts/AppContext";
import {
  ChatBubbleBottomCenterTextIcon,
  KeyIcon,
  CircleStackIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NavigationItem } from "@/app/interface/navigationItem";

export default function NavItems() {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const { currentOrg, currentProject } = useAppContext();
  const pathname = usePathname();

  useEffect(() => {
    setNavigationItems([
      {
        name: "Data Storage",
        href: `/databases`,
        icon: CircleStackIcon,
        current: pathname === `/databases` || pathname.startsWith(`/databases/`),
      },
      {
        name: "Secrets",
        href: `/api-keys`,
        icon: KeyIcon,
        current: `/api-keys` === pathname,
      },
    ]);
  }, [currentOrg, currentProject, pathname]);

  return (
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-7 px-6">
        <li>
          <div className="text-xs font-semibold leading-6 text-zinc-400 uppercase tracking-wider mb-2">
            Getting Started
          </div>
          <div className="space-y-2">
            <Link
              href="/quick-start"
              className={`${
                pathname === "/quick-start"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
              } group flex gap-x-3 items-center rounded-md p-2 text-sm font-medium transition-colors duration-150 ease-in-out`}
            >
              <RocketLaunchIcon aria-hidden="true" className="h-5 w-5 flex-shrink-0" />
              Quick Start
            </Link>
          </div>
        </li>
        <li>
          <div className="text-xs font-semibold leading-6 text-zinc-400 uppercase tracking-wider mb-2">
            Resources
          </div>
          <ul role="list" className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`${
                    item.current
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                  } group flex gap-x-3 items-center rounded-md p-2 text-sm font-medium transition-colors duration-150 ease-in-out`}
                >
                  <item.icon aria-hidden="true" className="h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </li>
        <li className="mt-auto">
          <div className="text-xs font-semibold leading-6 text-zinc-400 uppercase tracking-wider mb-2">
            Support
          </div>
          <Link
            href="/feedback"
            className="group flex gap-x-3 rounded-md p-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-white transition-colors duration-150 ease-in-out"
          >
            <ChatBubbleBottomCenterTextIcon
              aria-hidden="true"
              className="h-5 w-5 flex-shrink-0"
            />
            Feedback
          </Link>
        </li>
      </ul>
    </nav>
  );
}
