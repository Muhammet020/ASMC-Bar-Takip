'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true); 
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (isLogin) {
      // GİRİŞ İŞLEMİ
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        // BAŞARILI GİRİŞ - SATIŞ EKRANINA YÖNLENDİR
        router.push('/satis');
        router.refresh();
      }
    } else {
      // KAYIT İŞLEMİ
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        setIsLogin(true); 
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-850 p-6 rounded-3xl shadow-2xl">
        <div className="text-center mb-6">
          <span className="text-3xl block mb-2">{isLogin ? '⚡' : '👤'}</span>
          <h2 className="text-xl font-bold text-cyan-400">
            {isLogin ? 'ASMC Dolap Stok Giriş' : 'Yeni Hesap Oluştur'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isLogin ? 'Devam etmek için giriş yapın' : 'Sisteme kaydolun'}
          </p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs text-center mb-4">{error}</div>}
        {success && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs text-center mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1.5 uppercase tracking-wider">E-Posta Adresi</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500 font-sans" placeholder="isim@sirket.com" />
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1.5 uppercase tracking-wider">Şifre</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500 font-sans" placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-cyan-500/5 active:scale-[0.98] transition-all disabled:opacity-50 mt-2">
            {loading ? 'İşleniyor...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
          </button>

          <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-xs text-slate-500 hover:text-cyan-400 transition-colors text-center mt-2">
            {isLogin ? 'Hesabın yok mu? Kayıt Ol' : 'Zaten hesabın var mı? Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}