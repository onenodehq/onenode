/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
"use client";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import OrgDropdown from "./OrgDropdown";
import ProjectDropdown from "./ProjectDropdown";
import Image from "next/image";
import Link from "next/link";
import { useAuthContext } from "@/app/contexts/AuthContext";
import { useAppContext } from "@/app/contexts/AppContext";
import { signOut } from "next-auth/react";
import NavItems from "./NavItems";
import { NavProvider } from "./NavContext";
import CollectionCreationModal from "./CollectionCreationModal";
import { usePathname } from "next/navigation";
import CodeBlock from "../button/CodeBlock";
import { useState } from "react";
import DeleteAccountModal from "../modal/DeleteAccountModal";

export default function NavBar({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useAuthContext();
  const { currentProject } = useAppContext();
  const pathname = usePathname();
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);

  if (!pathname.startsWith("/auth")) {
    return (
      <>
        {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-white">
        <body class="h-full">
        ```
      */}
        <NavProvider>
          <div className="relative w-full h-full bg-zinc-900 flex flex-col">
            <div className="top-0 z-40 flex w-full h-16 items-center gap-x-4 border-b border-zinc-800 px-8">
              <div>
                <Link
                  href="https://onenode.ai"
                  className="flex h-16 shrink-0 items-center"
                >
                  <Image
                    alt="OneNode"
                    src="https://www.onenode.ai/images/mainIcon.png"
                    width={50}
                    height={50}
                    className="h-8 w-auto"
                  />
                  <h1 className="text-white mx-2 font-bold">OneNode</h1>
                </Link>
              </div>

              <div className="flex justify-end flex-1 gap-x-4 self-stretch lg:gap-x-6 text-white">
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                  <Link
                    href="https://docs.onenode.ai"
                    className="hover:text-zinc-500"
                    target="_blank"
                  >
                    Docs
                  </Link>
                  {/* Profile dropdown */}
                  <Menu as="div" className="relative">
                    <MenuButton className="-m-1.5 flex items-center p-1.5">
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full overflow-hidden">
                        <Image
                          alt="Profile Picture"
                          src={user?.picture as string}
                          width={50}
                          height={50}
                        />
                      </div>

                      <span className="hidden lg:flex lg:items-center">
                        <span
                          aria-hidden="true"
                          className="ml-4 text-sm font-semibold leading-6 text-white"
                        >
                          {user?.email}
                        </span>
                        <ChevronDownIcon
                          aria-hidden="true"
                          className="ml-2 h-5 w-5 text-zinc-400"
                        />
                      </span>
                    </MenuButton>
                    <MenuItems
                      transition
                      className="absolute right-0 z-10 mt-2.5 w-44 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-zinc-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                    >
                      <MenuItem key="delete-account">
                        <button
                          onClick={() => setIsDeleteAccountModalOpen(true)}
                          className="block w-full px-3 py-1 text-sm leading-6 text-red-600 data-[focus]:bg-zinc-50"
                        >
                          Delete Account
                        </button>
                      </MenuItem>
                      <MenuItem key="signout">
                        <button
                          onClick={() => {
                            signOut();
                          }}
                          className="block w-full px-3 py-1 text-sm leading-6 text-zinc-900 data-[focus]:bg-zinc-50"
                        >
                          Log out
                        </button>
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                </div>
              </div>
            </div>

            <main className="relative overflow-auto w-full flex-1 flex">
              <div className="h-full flex w-64 min-w-64 max-w-64 flex-shrink-0 flex-col">
                <div className="flex grow flex-col overflow-y-auto bg-zinc-900 border-r border-zinc-800 py-5">
                  <ul role="list" className="flex flex-col gap-y-3 px-6 mb-8">
                    <li>
                      <OrgDropdown />
                    </li>
                    <li>
                      <ProjectDropdown />
                    </li>
                  </ul>

                  <NavItems />
                </div>
              </div>
              <div className="grow h-full">
                <div className="overflow-auto rounded-tl-lg w-full h-full bg-white p-6">
                  {children}
                </div>
              </div>
              <CollectionCreationModal />
              <DeleteAccountModal 
                isOpen={isDeleteAccountModalOpen}
                setIsOpen={setIsDeleteAccountModalOpen}
              />
            </main>
          </div>
        </NavProvider>
      </>
    );
  } else {
    return <>{children}</>;
  }
}
