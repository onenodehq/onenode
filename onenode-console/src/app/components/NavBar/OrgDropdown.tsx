import { useAppContext } from "@/app/contexts/AppContext";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { BuildingOfficeIcon, CheckIcon } from "@heroicons/react/24/outline";

export default function OrgDropdown() {
  const { orgs, currentOrg, setCurrentOrg } = useAppContext();

  return (
    <div className="space-y-1">
      <h1 className="text-zinc-400 text-xs font-medium tracking-wide uppercase">Organization</h1>
      <div className="w-full">
        <Menu as="div" className="relative inline-block w-full text-left">
          <div>
            <MenuButton className="group w-full px-3 py-1.5 inline-flex justify-between items-center rounded-full bg-zinc-800/80 backdrop-blur-sm text-sm font-medium text-white hover:bg-zinc-700/90 focus:bg-zinc-700/90 focus:outline-none focus:ring-2 focus:ring-zinc-500/50 focus:ring-offset-1 focus:ring-offset-zinc-900 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md border border-zinc-700/50 hover:border-zinc-600/50">
              <div className="flex items-center gap-2 truncate">
                <div className="flex-shrink-0 p-0.5 rounded-full bg-zinc-700/50 group-hover:bg-zinc-600/50 transition-colors duration-200">
                  <BuildingOfficeIcon className="h-3 w-3 text-zinc-300" />
                </div>
                <span className="truncate text-zinc-100 font-medium">{currentOrg?.name}</span>
              </div>
              <ChevronDownIcon
                aria-hidden="true"
                className="text-zinc-400 h-3.5 w-3.5 flex-shrink-0 group-hover:text-zinc-300 transition-colors duration-200"
              />
            </MenuButton>
          </div>

          <MenuItems
            transition
            className="absolute w-full z-20 mt-1 origin-top-right rounded-xl bg-zinc-800/95 backdrop-blur-md shadow-xl ring-1 ring-zinc-700/50 focus:outline-none border border-zinc-700/30 transition data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-150 data-[leave]:duration-100 data-[enter]:ease-out data-[leave]:ease-in overflow-hidden"
          >
            <div className="py-1">
              {orgs ? (
                orgs.map((org, index) => (
                  <MenuItem key={index}>
                    {({ active }) => (
                      <button
                        className={`w-full text-left px-3 py-1.5 text-sm flex items-center justify-between transition-all duration-150 ${
                          active 
                            ? "bg-zinc-700/60 text-white" 
                            : "text-zinc-200 hover:bg-zinc-700/30"
                        } ${
                          currentOrg?.id === org.id 
                            ? "bg-zinc-700/40 text-white font-medium" 
                            : ""
                        }`}
                        onClick={() => setCurrentOrg(org)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0 p-0.5 rounded-full bg-zinc-700/30">
                            <BuildingOfficeIcon className="h-2.5 w-2.5 text-zinc-400" />
                          </div>
                          <span className="truncate">{org.name}</span>
                        </div>
                        {currentOrg?.id === org.id && (
                          <CheckIcon className="h-3.5 w-3.5 text-zinc-300 flex-shrink-0" />
                        )}
                      </button>
                    )}
                  </MenuItem>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-zinc-400 text-center">
                  No organizations available
                </div>
              )}
            </div>
          </MenuItems>
        </Menu>
      </div>
    </div>
  );
}
