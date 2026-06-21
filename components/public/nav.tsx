"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Room Finder",   href: "/room-finder",      icon: "🏫" },
  { label: "Calculators",   href: "/calculators/gpa",  icon: "📊" },
  { label: "Professors",    href: "/professors",        icon: "👨‍🏫" },
  { label: "Memories",      href: "/memories",          icon: "📍" },
  { label: "Mess Menu",     href: "/mess",              icon: "🍽️" },
  { label: "Events",        href: "/events",            icon: "📅" },
  { label: "Lost & Found",  href: "/lost-found",        icon: "🔍" },
  { label: "AI Chat",       href: "/ai-chat",           icon: "🤖" },
];

export function PublicNav() {
  const pathname = usePathname();
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-shadow duration-200
        ${scrolled
          ? "bg-brand-950/95 backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-brand-900"}`}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <Image
            src="/giki-logo.png"
            alt="GIKI"
            width={44}
            height={44}
            className="rounded-full flex-shrink-0"
          />
          <div className="hidden sm:block">
            <span className="font-bold text-white text-sm tracking-tight">GIKI Plus</span>
            <span className="hidden md:inline text-brand-400 text-xs ml-2">Student Portal</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                ${isActive(link.href)
                  ? "bg-white/15 text-white"
                  : "text-brand-300 hover:text-white hover:bg-white/10"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                       border border-white/20 text-white/80 hover:text-white hover:bg-white/10
                       text-xs font-medium transition-all duration-150"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
            </svg>
            Admin
          </Link>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden border-t border-white/10 bg-brand-950/98 backdrop-blur-md
                        px-4 py-4 animate-fade-in">
          <div className="grid grid-cols-2 gap-1.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium
                            transition-colors
                  ${isActive(link.href)
                    ? "bg-brand-700 text-white"
                    : "text-brand-300 hover:text-white hover:bg-white/10"}`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/10">
            <Link
              href="/admin/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                         text-brand-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              Admin Panel
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
