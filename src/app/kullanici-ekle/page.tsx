'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import BottomMenu from '@/components/BottomMenu';

interface Profil {
  id: string;
  isim_soyisim: string;
  rol: 'super_admin' | 'sistem_yoneticisi' | 'satis_elemani';
  created_at: string;
}

// Türkçe rol gösterimleri için eşleştirme tablosu
const ROL_ETIKETLERI = {
  super_admin: '👑 Süper Admin',
  sistem_yoneticisi: '🛠️ Sistem Yöneticisi',
  satis_elemani: '💰 Satış Elemanı',
};

export default function KullaniciEklePage() {
  const [profiller, setProfiller] = useState<Profil[]>([]);
  
  // Personel Ekleme Form Alanları
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [secilenRol, setSecilenRol] = useState<'super_admin' | 'sistem_yoneticisi' | 'satis_elemani'>('satis_elemani');

  const [loading, setLoading] = useState(false);
  const [mesaj, setMesaj] = useState<{ durum: 'basari' | 'hata'; metin: string } | null>(null);

  // 1. Sistemdeki kayıtlı tüm profilleri çek
  const profilleriGetir = async () => {
    const { data, error } = await supabase
      .from('profil_yetkileri')
      .select('id, isim_soyisim, rol, created_at')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setProfiller(data as Profil[]);
    }
  };

  useEffect(() => {
    profilleriGetir();
  }, []);

  // 2. Yeni Personel Kaydetme (Auth + Profil)
  const handleKullaniciEkle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMesaj(null);

    // Supabase Auth'a yeni kullanıcı kaydet (Meta veri olarak ad soyadı gönderiyoruz)
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      setMesaj({ durum: 'hata', metin: `❌ Kayıt başarısız: ${authError.message}` });
      setLoading(false);
      return;
    }

    // Veritabanındaki tetikleyicimiz otomatik profil oluşturuyor.
    // Ancak seçilen özel rolü (eğer varsayılan satış elemanından farklıysa) güncellememiz gerekir.
    if (data.user && secilenRol !== 'satis_elemani') {
      await supabase
        .from('profil_yetkileri')
        .update({ rol: secilenRol })
        .eq('id', data.user.id);
    }

    setMesaj({ durum: 'basari', metin: '🎉 Personel başarıyla oluşturuldu!' });
    setEmail('');
    setPassword('');
    setFullName('');
    setSecilenRol('satis_elemani');
    setLoading(false);
    profilleriGetir(); // Listeyi yenile
  };

  // 3. Canlı Yetki/Rol Güncelleme Fonksiyonu
  const handleRolDegistir = async (id: string, yeniRol: 'super_admin' | 'sistem_yoneticisi' | 'satis_elemani') => {
    const { error } = await supabase
      .from('profil_yetkileri')
      .update({ rol: yeniRol })
      .eq('id', id);

    if (!error) {
      alert('🔒 Kullanıcı yetkisi başarıyla güncellendi!');
      profilleriGetir(); // Listeyi güncelle
    } else {
      alert(`❌ Yetki güncellenirken hata oluştu: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      <div>
        <Header />
        
        <main className="max-w-md mx-auto p-4 flex flex-col gap-6">
          
          {/* BÖLÜM 1: YENİ PERSONEL EKLEME FORMU */}
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              👤 YENİ PERSONEL / KULLANICI EKLE
            </h2>

            {mesaj && (
              <div className={`p-4 rounded-xl text-center text-sm font-semibold border mb-4 ${
                mesaj.durum === 'basari' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {mesaj.metin}
              </div>
            )}

            <form onSubmit={handleKullaniciEkle} className="bg-slate-900 border border-slate-850 p-5 rounded-3xl flex flex-col gap-4">
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5 uppercase tracking-wider">Adı Soyadı</label>
                <input 
                  type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500"
                  placeholder="Örn: Ahmet Yılmaz"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5 uppercase tracking-wider">E-Posta Adresi</label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500"
                  placeholder="ahmet@sirket.com"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5 uppercase tracking-wider">Giriş Şifresi</label>
                <input 
                  type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500"
                  placeholder="En az 6 karakter"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5 uppercase tracking-wider">Atanacak Başlangıç Yetkisi</label>
                <select 
                  value={secilenRol} onChange={(e) => setSecilenRol(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500 text-slate-200"
                >
                  <option value="satis_elemani">Satış Elemanı</option>
                  <option value="sistem_yoneticisi">Sistem Yöneticisi</option>
                  <option value="super_admin">Süper Admin</option>
                </select>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold py-3.5 rounded-xl text-sm active:scale-[0.98] transition-all disabled:opacity-50 mt-1"
              >
                {loading ? 'Sisteme Kaydediliyor...' : 'Kullanıcıyı Kaydet'}
              </button>
            </form>
          </div>

          {/* BÖLÜM 2: YETKİ YÖNETİM PANELİ (LİSTE) */}
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              🛡️ MEVCUT PERSONELLER VE YETKİ DEĞİŞTİRME
            </h2>

            <div className="flex flex-col gap-3">
              {profiller.length === 0 ? (
                <p className="text-center text-slate-500 text-xs py-4">Kayıtlı personel bulunamadı.</p>
              ) : (
                profiller.map((p) => (
                  <div key={p.id} className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-sm text-slate-200">{p.isim_soyisim}</h4>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">ID: {p.id.slice(0, 8)}...</span>
                      </div>
                      <span className="text-xs bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-cyan-400 font-medium">
{ROL_ETIKETLERI[p.rol as keyof typeof ROL_ETIKETLERI] || p.rol}                      </span>
                    </div>

                    {/* Canlı Yetki Değiştirme Seçeneği */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-850/50">
                      <span className="text-xs text-slate-400 whitespace-nowrap">Yetkiyi Değiştir:</span>
                      <select
                        value={p.rol}
                        onChange={(e) => handleRolDegistir(p.id, e.target.value as any)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs focus:outline-none focus:border-cyan-500 text-slate-300"
                      >
                        <option value="satis_elemani">Satış Elemanı</option>
                        <option value="sistem_yoneticisi">Sistem Yöneticisi</option>
                        <option value="super_admin">Süper Admin</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </main>
      </div>
      <BottomMenu />
    </div>
  );
}