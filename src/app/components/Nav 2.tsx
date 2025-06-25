"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Nav() {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Novo Orçamento" },
    { href: "/partes-processo", label: "Partes do Processo" },
    { href: "/trabalhos", label: "Trabalhos" },
    { href: "/orcamentos", label: "Orçamentos Salvos" },
  ];
  
  return (
    <nav className="w-full bg-white shadow-md py-4 px-6 flex justify-center items-center fixed top-0 left-0 z-20 border-b border-zinc-200">
      <div className="flex gap-8 items-center w-full max-w-5xl mx-auto">
        <Link href="/" className="flex items-center mr-6 group">
          <Image 
            src="/RE9.png" 
            alt="Logo RE9" 
            width={120}
            height={56}
            className="h-14 w-auto mr-2 transition-transform group-hover:scale-105" 
            style={{maxHeight:56}}
            priority
          />
        </Link>
        <div className="flex gap-8 items-center flex-1 justify-center">
          {links.map(link => {
            let isActive = false;
            if (link.href === '/') {
              isActive = pathname === '/' || pathname === '/orcamentos/novo' || pathname.startsWith('/orcamentos/novo');
            } else if (link.href === '/orcamentos') {
              isActive = pathname === '/orcamentos' || (pathname.startsWith('/orcamentos') && !pathname.startsWith('/orcamentos/novo'));
            } else {
              isActive = pathname === link.href || pathname.startsWith(link.href);
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  `relative font-medium px-4 py-2 rounded-xl transition-colors duration-150 flex items-center gap-2 text-base ` +
                  (isActive
                    ? "text-white bg-blue-700 font-bold"
                    : "text-zinc-800 hover:text-blue-700 hover:bg-blue-50")
                }
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-1 animate-pulse" aria-hidden="true"></span>
                )}
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
} 