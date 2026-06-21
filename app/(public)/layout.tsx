import Image from "next/image";
import { PublicNav } from "@/components/public/nav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicNav />
      <div className="flex-1">{children}</div>

      <footer className="bg-brand-950 text-brand-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <Image
                src="/giki-logo.png"
                alt="GIKI"
                width={34}
                height={34}
                className="rounded-full opacity-80"
              />
              <div>
                <p className="text-brand-200 font-semibold text-sm">GIKI Plus</p>
                <p className="text-brand-500 text-xs">Not affiliated with GIKI officially</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-5">
              <a href="/privacy"
                 className="hover:text-brand-200 transition-colors">Privacy Policy</a>
              <a href="/contact"
                 className="hover:text-brand-200 transition-colors">Contact</a>
              <a href="https://discord.gg/giki" target="_blank" rel="noopener noreferrer"
                 className="hover:text-brand-200 transition-colors">Discord</a>
            </div>

            <p className="text-brand-600 text-[11px]">
              © {new Date().getFullYear()} GIKI Plus
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
