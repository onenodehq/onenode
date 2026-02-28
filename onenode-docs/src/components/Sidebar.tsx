'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface NavItem {
  title: string;
  href: string;
  external?: boolean;
  icon?: React.ReactNode;
}

interface SidebarSection {
  title: string;
  items: NavItem[];
}

// External links for the top navbar
const externalLinks: NavItem[] = [
  { title: 'Dashboard', href: 'https://console.onenode.ai', external: true },
  { title: 'Contact', href: 'https://onenode.ai/home/contact', external: true },
];

// Documentation sidebar sections
const docSidebarSections: SidebarSection[] = [
  {
    title: 'Getting Started',
    items: [
      { 
        title: 'Overview', 
        href: '/overview',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        )
      },
      { 
        title: 'Quick Start', 
        href: '/',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        )
      },
    ],
  },
  {
    title: 'Core Operations',
    items: [
      { 
        title: 'Insert', 
        href: '/document/insert',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        )
      },
      { 
        title: 'Query', 
        href: '/document/query',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"></path>
          </svg>
        )
      },
      { 
        title: 'Find', 
        href: '/document/find',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        )
      },
      { 
        title: 'Update', 
        href: '/document/update',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
        )
      },
      { 
        title: 'Delete', 
        href: '/document/delete',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        )
      },
    ],
  },
  {
    title: 'Collection Operations',
    items: [
      { 
        title: 'Create', 
        href: '/collection/create',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        )
      },
      { 
        title: 'Drop', 
        href: '/collection/drop',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        )
      },
    ],
  },
  {
    title: 'Multimodal',
    items: [
      { 
        title: 'Overview', 
        href: '/multimodal',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
        )
      },
      { 
        title: 'Text', 
        href: '/multimodal/text',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
          </svg>
        )
      },
      { 
        title: 'Image', 
        href: '/multimodal/image',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        )
      },
    ],
  },
  {
    title: 'LLM Models',
    items: [
      { 
        title: 'Overview', 
        href: '/llm_models',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
          </svg>
        )
      },
      { 
        title: 'Embedding Models', 
        href: '/llm_models/embedding',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
          </svg>
        )
      },
      { 
        title: 'Vision Models', 
        href: '/llm_models/vision',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        )
      },
    ],
  },
  {
    title: 'Syntax',
    items: [
      { 
        title: 'Filter', 
        href: '/syntax/filter',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
          </svg>
        )
      },
      { 
        title: 'Projection', 
        href: '/syntax/projection',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
          </svg>
        )
      },
      { 
        title: 'Update', 
        href: '/syntax/update',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        )
      },
    ],
  },
];

interface SidebarProps {
  className?: string;
}

const Sidebar = React.memo(({ className }: SidebarProps) => {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  
  // Save scroll position on scroll
  const handleScroll = () => {
    if (navRef.current) {
      sessionStorage.setItem('sidebar-scroll-position', navRef.current.scrollTop.toString());
    }
  };

  // Restore scroll position on mount and pathname change
  useEffect(() => {
    if (navRef.current) {
      const savedPosition = sessionStorage.getItem('sidebar-scroll-position');
      if (savedPosition) {
        navRef.current.scrollTop = parseInt(savedPosition, 10);
      }
    }
  }, [pathname]);

  // Add scroll listener
  useEffect(() => {
    const nav = navRef.current;
    if (nav) {
      nav.addEventListener('scroll', handleScroll, { passive: true });
      return () => nav.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  return (
    <aside className={`fixed inset-y-0 left-0 z-10 w-56 sidebar-bg shadow-sm flex flex-col ${className}`}>
      <div className="flex items-center h-14 px-4 flex-shrink-0">
        <Link href="https://onenode.ai" className="flex items-center group">
          <div className="relative">
            <div className="absolute -inset-2 bg-red-100 rounded-lg blur-lg opacity-0 group-hover:opacity-75 transition duration-200"></div>
            <Image
              src="https://onenode.ai/images/mainIcon.png"
              alt="OneNode logo"
              width={28}
              height={28}
              className="relative"
              priority
              loading="eager"
              unoptimized
            />
          </div>
          <span className="ml-2 font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">OneNode</span>
        </Link>
      </div>
      <nav ref={navRef} className="p-3 flex-1 overflow-y-auto">
        {docSidebarSections.map((section, idx) => (
          <div key={idx} className="mb-4">
            <h3 className="text-[10px] font-bold text-app-tertiary uppercase tracking-wider mb-1.5 ml-1.5 flex items-center">
              <div className="w-1 h-1 bg-red-400 rounded-full mr-1"></div>
              <span className="text-app-secondary">{section.title}</span>
            </h3>
            <ul className="space-y-0.5">
              {section.items.map((item, idx) => {
                const isActive = pathname === item.href || pathname?.endsWith(`${item.href}/`);
                return (
                  <li key={idx}>
                    <Link 
                      href={item.href}
                      scroll={false}
                      className={`
                        block w-full rounded-md text-xs
                        transition-all duration-200 px-2 py-1.5
                        flex items-center
                        ${isActive 
                          ? 'bg-red-100 text-red-900 shadow-sm' 
                          : 'text-app-secondary hover:bg-gray-100'
                        }
                      `}
                    >
                      {item.icon}
                      <span className={isActive ? 'font-semibold' : 'font-medium'}>
                        {item.title}
                      </span>
                      {isActive && (
                        <div className="ml-auto">
                          <div className="w-1 h-1 bg-red-400 rounded-full mr-0.5"></div>
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar; 