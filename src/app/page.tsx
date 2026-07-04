'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import BottomMenu from '@/components/BottomMenu';

const BarcodeScanner = dynamic(() => import('@/components/BarcodeScanner'), {
  ssr: false,
  loading: () => <p className="text-center text-slate-500 py-6 text-sm font-mono animate-pulse">Kamera hazırlanıyor...</p>
});

interface Urun {
  id: number;
  urun_adi: string;
  mevcut_stok: number;
  satis_fiyati: number;
  dolaplar: { dolap_adi: string } | null;
}

export default function Home() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [urunler, setUrunler] = useState<Urun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function stoklariGetir() {
      setLoading(true);
      const { data, error } = await supabase
        .from('urunler')
        .select(`
          id, urun_adi, mevcut_stok, satis_fiyati,
          dolaplar ( dolap_adi )
        `);

      if (data && !error) setUrunler(data as unknown as Urun[]);
      setLoading(false);
    }
    stoklariGetir();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      <div>
        <Header />

        <main className="max-w-md mx-auto p-4 flex flex-col gap-6">

          {isScannerOpen ? (
            <BarcodeScanner
              onScanSuccess={(b) => { console.log(b); setIsScannerOpen(false); }}
              onClose={() => setIsScannerOpen(false)}
            />
          ) : (
            <button
              onClick={() => setIsScannerOpen(true)}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold py-5 rounded-2xl text-lg shadow-xl shadow-cyan-500/5 active:scale-[0.99] transition-all"
            >
              ║▌║ BARKOD TARAT
            </button>
          )}

          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              📦 GÜNCEL STOK LİSTESİ
            </h2>

            {loading ? (
              <p className="text-center text-slate-600 text-sm py-10">Stoklar yükleniyor...</p>
            ) : (
              <div className="flex flex-col gap-2">
                {urunler.map((urun) => (
                  <div key={urun.id} className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-sm">{urun.urun_adi}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                        📍 {urun.dolaplar?.dolap_adi || 'Bilinmiyor'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="block font-mono font-bold text-cyan-400">{urun.mevcut_stok} Adet</span>
                      <span className="text-xs text-slate-400">₺{urun.satis_fiyati}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <BottomMenu />
    </div>
  );
}