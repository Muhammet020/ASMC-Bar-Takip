'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import BottomMenu from '@/components/BottomMenu';

interface SatisRaporu {
  id: number;
  adet: number;
  satis_fiyati: number;
  alis_fiyati: number;
  satis_notu: string;
  satis_tarihi: string;
  urunler: {
    urun_adi: string;
    dolaplar: {
      dolap_adi: string;
    } | null;
  } | null;
}

export default function RaporPage() {
  const [satislar, setSatislar] = useState<SatisRaporu[]>([]);
  const [loading, setLoading] = useState(true);

  // Finansal özet durumları
  const [toplamCiro, setToplamCiro] = useState(0);
  const [toplamKar, setToplamKar] = useState(0);

  useEffect(() => {
    async function raporVerileriniGetir() {
      setLoading(true);
      
      // Supabase'den ilişkili tablolarla beraber satış geçmişini çekiyoruz
      const { data, error } = await supabase
        .from('satislar')
        .select(`
          id, adet, satis_fiyati, alis_fiyati, satis_notu, satis_tarihi,
          urunler (
            urun_adi,
            dolaplar ( dolap_adi )
          )
        `)
        .order('satis_tarihi', { ascending: false });

      if (data && !error) {
        const formatliData = data as unknown as SatisRaporu[];
        setSatislar(formatliData);

        // Ciro ve Kâr hesaplamalarını yapalım
        let ciro = 0;
        let kar = 0;

        formatliData.forEach((s) => {
          const toplamSatisBedeli = s.satis_fiyati * s.adet;
          const toplamAlisBedeli = s.alis_fiyati * s.adet;
          
          ciro += toplamSatisBedeli;
          kar += (toplamSatisBedeli - toplamAlisBedeli);
        });

        setToplamCiro(ciro);
        setToplamKar(kar);
      }
      setLoading(false);
    }

    raporVerileriniGetir();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      <div>
        <Header />
        
        <main className="max-w-md mx-auto p-4 flex flex-col gap-5">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            📊 KASA & RAPOR ANALİZLERİ
          </h2>

          {/* FİNANSAL ÖZET KARTLARI */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl">
              <span className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">Toplam Ciro</span>
              <span className="text-xl font-bold font-mono text-cyan-400">₺{toplamCiro.toFixed(2)}</span>
            </div>
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl">
              <span className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">Net Kâr Durumu</span>
              <span className="text-xl font-bold font-mono text-emerald-400">₺{toplamKar.toFixed(2)}</span>
            </div>
          </div>

          {/* SON SATIŞLARIN LİSTESİ */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              🧾 SON YAPILAN SATIŞLAR
            </h3>

            {loading ? (
              <p className="text-center text-slate-500 text-xs py-8 font-mono animate-pulse">Raporlar yükleniyor...</p>
            ) : satislar.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-900 p-8 rounded-2xl text-center text-slate-500 text-xs">
                Henüz yapılmış bir satış kaydı bulunamadı.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {satislar.map((s) => (
                  <div key={s.id} className="bg-slate-900 border border-slate-850 p-3.5 rounded-2xl flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-sm text-slate-200">
                          {s.urunler?.urun_adi || 'Bilinmeyen Ürün'}
                        </h4>
                        <span className="text-[10px] bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-slate-400 font-medium inline-block mt-1">
                          📍 {s.urunler?.dolaplar?.dolap_adi || 'Dolap Belirtilmemiş'}
                        </span>
                      </div>
                      <span className="font-mono text-sm font-bold text-cyan-400">
                        +₺{(s.satis_fiyati * s.adet).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1.5 border-t border-slate-850/40">
                      <span>💬 {s.satis_notu}</span>
                      <span>{new Date(s.satis_tarihi).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
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