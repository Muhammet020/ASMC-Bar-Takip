'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import BottomMenu from '@/components/BottomMenu';


export default function AdisyonListePage() {
  const [adisyonlar, setAdisyonlar] = useState<any[]>([]);
  const [filtre, setFiltre] = useState<'acik' | 'odendi' | 'borclu'>('acik');

  useEffect(() => {
    fetchAdisyonlar();
  }, [filtre]);

  const fetchAdisyonlar = async () => {
    // Adisyonları ve ilişkili müşteri ismini getiriyoruz
    const { data } = await supabase
      .from('adisyonlar')
      .select('*, musteriler(isim_soyisim)')
      .eq('durum', filtre)
      .order('created_at', { ascending: false });
    
    if (data) setAdisyonlar(data);
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-cyan-400">Adisyon Listesi</h1>
        <a href="/satis" className="bg-slate-800 px-4 py-2 rounded-lg text-sm hover:bg-slate-700">Yeni Satışa Dön</a>
      </div>

      {/* Filtreleme Butonları */}
      <div className="flex gap-2 mb-6">
        {(['acik', 'odendi', 'borclu'] as const).map((d) => (
          <button 
            key={d}
            onClick={() => setFiltre(d)}
            className={`px-6 py-2 rounded-lg capitalize font-medium transition-all ${
              filtre === d ? 'bg-cyan-600 shadow-lg shadow-cyan-900/20' : 'bg-slate-800 hover:bg-slate-700'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Liste Tablosu */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-800 text-slate-400 text-sm">
              <th className="p-4">Müşteri</th>
              <th className="p-4">Toplam Tutar</th>
              <th className="p-4">Tarih</th>
              <th className="p-4 text-center">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {adisyonlar.length > 0 ? (
              adisyonlar.map((a) => (
                <tr key={a.id} className="border-t border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-medium">{a.musteriler?.isim_soyisim || 'Misafir'}</td>
                  <td className="p-4 font-bold text-cyan-400">{Number(a.toplam_tutar).toFixed(2)} TL</td>
                  <td className="p-4 text-sm text-slate-400">
                    {new Date(a.created_at).toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4 text-center">
                    {a.durum === 'acik' && (
                      <button className="bg-cyan-900/30 text-cyan-400 px-3 py-1 rounded-md text-xs border border-cyan-800 hover:bg-cyan-800">
                        Detay / Kapat
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">Kayıtlı adisyon bulunamadı.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div><BottomMenu />
    </div>
    
  );
}