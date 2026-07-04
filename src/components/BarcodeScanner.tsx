'use client';

import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScanSuccess, onClose }: BarcodeScannerProps) {
  // Kamerayı kontrol edeceğimiz saf nesneyi tutan referans
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const elementId = 'pure-qr-reader';

  useEffect(() => {
    // 1. Saf motoru ID üzerinden başlat
    const html5Qrcode = new Html5Qrcode(elementId);
    html5QrcodeRef.current = html5Qrcode;

    // 2. Arka kamerayı (environment) hedef alarak video akışını başlat
    html5Qrcode.start(
      { facingMode: 'environment' }, // Mobil cihazın arka kamerasını zorunlu tutar
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      (decodedText) => {
        // Başarılı tarama
        stopScanner().then(() => onScanSuccess(decodedText));
      },
      (errorMessage) => {
        // Sürekli log basıp cihazı yormasın diye burayı sessize alıyoruz
      }
    ).catch((err) => {
      console.error('Kamera başlatma hatası:', err);
      alert('Kamera açılamadı. Lütfen tarayıcı izinlerinden kameraya izin verildiğinden emin olun.');
    });

    // Kamerayı tamamen kapatan güvenli fonksiyon
    const stopScanner = async () => {
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        try {
          await html5QrcodeRef.current.stop();
        } catch (err) {
          console.error('Kamera durdurma hatası:', err);
        }
      }
    };

    // 3. Bileşen ekrandan kaldırıldığında (Unmount) kamerayı mutlaka serbest bırak
    return () => {
      stopScanner();
    };
  }, [onScanSuccess]);

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-2xl max-w-md mx-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Kamera Taranıyor
        </h3>
        <button 
          onClick={onClose}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
        >
          Kapat
        </button>
      </div>
      
      {/* Saf video akışının basılacağı temiz alan */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-black aspect-square">
        <div id={elementId} className="w-full h-full"></div>
      </div>
      
      <p className="text-center text-xs text-slate-500 mt-3">
        Ürün barkodunu kameraya doğru tutun.
      </p>
    </div>
  );
}