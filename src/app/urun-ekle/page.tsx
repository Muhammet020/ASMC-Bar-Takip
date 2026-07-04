'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import BottomMenu from '@/components/BottomMenu';
import dynamic from 'next/dynamic';

const BarcodeScanner = dynamic(() => import('@/components/BarcodeScanner'), { ssr: false });

interface Dolap {
  id: number;
  dolap_adi: string;
}

export default function UrunEklePage() {
  const router = useRouter();
  const [dolaplar, setDolaplar] = useState<Dolap[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  // Form Alanları
  const [barkod, setBarkod] = useState('');
  const [urunAdi, setUrunAdi] = useState('');
  const [gorselUrl, setGorselUrl] = useState('');
  const [dolapId, setDolapId] = useState('');
  const [alisFiyati, setAlisFiyati] = useState('');
  const [satisFiyati, setSatisFiyati] = useState('');
  const [mevcutStok, setMevcutStok] = useState('');
  const [kritikStok, setKritikStok] = useState('5');

  const [loading, setLoading] = useState(false);
  const [mesaj, setMesaj] = useState<{ durum: 'basari' | 'hata'; metin: string } | null>(null);

  useEffect(() => {
    async function dolaplariGetir() {
      const { data } = await supabase.from('dolaplar').select('id, dolap_adi');
      if (data) {
        setDolaplar(data);
        if (data.length > 0) setDolapId(data[0].id.toString());
      }
    }
    dolaplariGetir();
  }, []);

  const handleScanSuccess = async (code: string) => {
    setBarkod(code);
    setIsScannerOpen(false);
    
    console.log("--- API İSTEĞİ BAŞLADI ---");
    
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}`);
      const data = await response.json();

      if (data.status === 1 && data.product) {
        console.log("API'den gelen tüm ürün verisi:", data.product);
        
        // Görsel alanlarını logla ki hangisinin dolu olduğunu görelim
        console.log("image_front_url:", data.product.image_front_url);
        console.log("image_url:", data.product.image_url);
        console.log("image_small_url:", data.product.image_small_url);

        setUrunAdi(data.product.product_name || '');
        
        // Hangi görsel alanı doluysa onu öncelikli al
        const gorsel = data.product.image_front_url || data.product.image_url || '';
        setGorselUrl(gorsel);
        
        setMesaj({ durum: 'basari', metin: '✅ Ürün bilgileri ve görseli getirildi!' });
      } else {
        console.log("Ürün API'de bulunamadı veya status 0 döndü.");
        setMesaj({ durum: 'hata', metin: '⚠️ Ürün API\'de bulunamadı.' });
      }
    } catch (error) {
      console.error("API hatası:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMesaj(null);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('urunler').insert([
      {
        barkod,
        urun_adi: urunAdi,
        gorsel_url: gorselUrl,
        dolap_id: parseInt(dolapId),
        alis_fiyati: parseFloat(alisFiyati) || 0,
        satis_fiyati: parseFloat(satisFiyati) || 0,
        mevcut_stok: parseInt(mevcutStok) || 0,
        kritik_stok: parseInt(kritikStok) || 5,
        ekleyen_kullanici_id: user?.id,
      }
    ]);

    setLoading(false);
    if (error) {
      setMesaj({ durum: 'hata', metin: `❌ Hata: ${error.message}` });
    } else {
      setMesaj({ durum: 'basari', metin: '✅ Ürün başarıyla eklendi!' });
      setBarkod(''); setUrunAdi(''); setGorselUrl(''); setAlisFiyati(''); setSatisFiyati(''); setMevcutStok('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      {isScannerOpen ? (
        <BarcodeScanner onScanSuccess={handleScanSuccess} onClose={() => setIsScannerOpen(false)} />
      ) : (
        <div>
          <Header />
          <main className="max-w-md mx-auto p-4 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">➕ YENİ ÜRÜN EKLE</h2>

            {mesaj && (
              <div className={`p-4 rounded-xl text-center text-sm font-semibold border ${mesaj.durum === 'basari' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {mesaj.metin}
              </div>
            )}

            {/* Görsel Önizleme */}
           {urunAdi && (
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 flex items-center gap-4 mb-2 animate-in fade-in zoom-in duration-300">
                {gorselUrl ? (
                  <img src={gorselUrl} alt="Ürün" className="w-16 h-16 object-contain rounded-xl bg-white p-1" />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center bg-slate-800 rounded-xl text-slate-500">📷</div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-slate-100 text-sm">{urunAdi}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">{barkod}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-850 p-5 rounded-3xl flex flex-col gap-4">
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5 uppercase">Barkod No</label>
                <div className="flex gap-2">
                  <input type="text" required value={barkod} onChange={(e) => setBarkod(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-mono" />
                  <button type="button" onClick={() => setIsScannerOpen(true)} className="bg-slate-800 px-4 rounded-xl">📷</button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5 uppercase">Ürün Adı</label>
                <input type="text" required value={urunAdi} onChange={(e) => setUrunAdi(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm" />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5 uppercase">Bulunduğu Dolap</label>
                <select value={dolapId} onChange={(e) => setDolapId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm">{dolaplar.map((d) => <option key={d.id} value={d.id}>{d.dolap_adi}</option>)}</select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input type="number" step="0.01" required value={alisFiyati} onChange={(e) => setAlisFiyati(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm" placeholder="Alış ₺" />
                <input type="number" step="0.01" required value={satisFiyati} onChange={(e) => setSatisFiyati(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm" placeholder="Satış ₺" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input type="number" required value={mevcutStok} onChange={(e) => setMevcutStok(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm" placeholder="Stok" />
                <input type="number" required value={kritikStok} onChange={(e) => setKritikStok(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm" placeholder="Kritik" />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-cyan-600 py-3 rounded-xl font-bold text-sm">
                {loading ? 'Kaydediliyor...' : 'Ürünü Stoka Ekle'}
              </button>
            </form>
          </main>
          <BottomMenu />
        </div>
      )}
    </div>
  );
}