'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomMenu() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path ? 'text-cyan-400' : 'text-slate-500';

  return (
    <nav className="fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 p-3 flex justify-around pb-5 z-50">
      <Link href="/" className={`flex flex-col items-center ${isActive('/')}`}>
        <span>📦</span><span className="text-[9px] mt-1">Stok</span>
      </Link>
      <Link href="/adisyonliste" className={`flex flex-col items-center ${isActive('/adisyonliste')}`}>
        <span>📋</span><span className="text-[9px] mt-1">Adisyon</span>
      </Link>
      <Link href="/urun-ekle" className={`flex flex-col items-center ${isActive('/urun-ekle')}`}>
        <span>➕</span><span className="text-[9px] mt-1">Ürün</span>
      </Link>
      <Link href="/satis" className={`flex flex-col items-center ${isActive('/satis')}`}>
        <span>💰</span><span className="text-[9px] mt-1">Satış</span>
      </Link>
      <Link href="/rapor" className={`flex flex-col items-center ${isActive('/rapor')}`}>
        <span>📊</span><span className="text-[9px] mt-1">Rapor</span>
      </Link>
      <Link href="/kullanici-ekle" className={`flex flex-col items-center ${isActive('/kullanici-ekle')}`}>
        <span>👤</span><span className="text-[9px] mt-1">Yönetim</span>
      </Link>
    </nav>
  );
}