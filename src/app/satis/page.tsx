'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '@/lib/supabase';
import BottomMenu from '@/components/BottomMenu';


export default function SatisPage() {
  const [musteriler, setMusteriler] = useState<any[]>([]);
  const [seciliMusteri, setSeciliMusteri] = useState('');
  const [barkod, setBarkod] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [aktifAdisyon, setAktifAdisyon] = useState<any>(null);
  const [kalemler, setKalemler] = useState<any[]>([]);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);


  useEffect(() => {
    const fetchMusteriler = async () => {
      const { data } = await supabase.from('musteriler').select('*');
      if (data) setMusteriler(data);
    };
    fetchMusteriler();
  }, []);

  // Ürün Bul ve Ekle (Hem input hem kamera için ortak)
  const urunEkle = async (barkodNo: string) => {
    const { data: urun, error } = await supabase
      .from('urunler')
      .select('*')
      .eq('barkod', barkodNo)
      .single();

    if (urun) {
      // Kalemi ekle (Stok düşüşü Trigger ile otomatik olacak)
      await supabase.from('adisyon_kalemleri').insert([{ 
        adisyon_id: aktifAdisyon.id, 
        urun_id: urun.id, 
        satis_fiyati: urun.satis_fiyati 
      }]);
      
      setKalemler([...kalemler, { ...urun, satis_fiyati: urun.satis_fiyati }]);
      setBarkod('');
      setIsScannerOpen(false); // Okuma sonrası tarayıcıyı kapa
      scannerRef.current?.clear();
    } else {
      alert('Ürün bulunamadı!');
    }
  };

  const adisyonBaslat = async () => {
    if (!seciliMusteri) return alert('Lütfen müşteri seçin');
    const { data } = await supabase
      .from('adisyonlar')
      .insert([{ musteri_id: seciliMusteri, durum: 'acik', toplam_tutar: 0 }])
      .select()
      .single();
    if (data) setAktifAdisyon(data);
  };

 const kamerayiBaslat = async () => {
    setIsScannerOpen(true);
    
    // DOM'un render edilmesi için 100ms bekleyelim
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
      scannerRef.current = scanner;
      scanner.render(
        (decodedText) => {
          urunEkle(decodedText);
          // Tarayıcıyı temizle ve kamerayı durdur
          scanner.clear().catch(err => console.error("Kamera temizleme hatası:", err));
          setIsScannerOpen(false);
        }, 
        (error) => {
          // Hataları burada sessiz bırakabiliriz
        }
      );
    }, 100);
  };
  const adisyonuKapat = async (durum: 'odendi' | 'borclu') => {
    const toplam = kalemler.reduce((acc, curr) => acc + Number(curr.satis_fiyati), 0);
    await supabase.from('adisyonlar').update({ durum, toplam_tutar: toplam }).eq('id', aktifAdisyon.id);
    setAktifAdisyon(null);
    setKalemler([]);
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6 text-cyan-400">Adisyon Sistemi</h1>

      {!aktifAdisyon ? (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <label className="block text-sm text-slate-400 mb-2">Müşteri Seçin</label>
          <select onChange={(e) => setSeciliMusteri(e.target.value)} className="w-full bg-slate-800 p-3 rounded-xl mb-4 border border-slate-700">
            <option value="">Müşteri Seçin...</option>
            {musteriler.map(m => <option key={m.id} value={m.id}>{m.isim_soyisim}</option>)}
          </select>
          <button onClick={adisyonBaslat} className="w-full bg-cyan-600 p-3 rounded-xl font-bold">Yeni Adisyon Başlat</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <label className="block text-xs text-slate-400 font-medium mb-1.5 uppercase">Barkod No</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={barkod} 
                onChange={(e) => setBarkod(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && urunEkle(barkod)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-mono" 
              />
              <button type="button" onClick={kamerayiBaslat} className="bg-slate-800 px-4 rounded-xl">📷</button>
            </div>
            
            {isScannerOpen && <div id="reader" className="mt-4"></div>}

            <div className="mt-4 space-y-2 h-64 overflow-y-auto">
              {kalemler.map((k, i) => (
                <div key={i} className="flex justify-between border-b border-slate-800 p-2 text-sm">
                  <span>{k.urun_adi}</span>
                  <span className="text-cyan-400 font-bold">{k.satis_fiyati} TL</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col gap-4">
            <div className="text-center py-4">
              <h2 className="text-4xl font-bold text-cyan-400">{kalemler.reduce((acc, curr) => acc + Number(curr.satis_fiyati), 0)} TL</h2>
            </div>
            <button onClick={() => adisyonuKapat('odendi')} className="bg-emerald-600 py-4 rounded-xl font-bold">Ödeme Alındı</button>
            <button onClick={() => adisyonuKapat('borclu')} className="bg-amber-600 py-4 rounded-xl font-bold">Borçlu Kapat</button>
          </div>
        </div>
      )}
      <BottomMenu />
    </div>
  );
}