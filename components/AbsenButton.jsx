// components/AbsenButton.jsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AbsenButton() {
  const [sudahMasuk, setSudahMasuk] = useState(false);
  const [time, setTime] = useState(null);
  const [jamPulang, setJamPulang] = useState(17);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const tanggalDisplay = time
    ? time.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Jakarta",
      })
    : "—";

  const jamDisplay = time
    ? time.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Jakarta",
      })
    : "—";

  const handleAbsenMasuk = () => {
    setSudahMasuk(true);
    console.log("✅ Absen Masuk", time?.toString());
  };

  const handleAbsenPulang = () => {
    setSudahMasuk(false);
    console.log("✅ Absen Pulang", time?.toString());
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      {/* Tanggal & Jam */}
      <div className="text-center">
        <p className="text-lg font-semibold">{tanggalDisplay}</p>
        <p className="text-3xl font-bold">{jamDisplay} WIB</p>
      </div>

      {/* Dropdown pilih jam pulang (hanya muncul setelah absen masuk) */}
      {sudahMasuk && (
        <div className="w-full text-center">
          <label className="text-sm text-gray-400 block mb-1">
            Geser Jam Pulang
          </label>
          <select
            value={jamPulang}
            onChange={(e) => setJamPulang(Number(e.target.value))}
            className="w-full p-2 rounded-md bg-white/5 text-white border border-white/10 sm:w-auto sm:px-25 sm:py-3"
          >
            <option className="text-black" value={14}>14:00</option>
            <option className="text-black" value={18}>18:00</option>
            <option className="text-black" value={19}>19:00</option>
            <option className="text-black" value={20}>20:00</option>
          </select>
        </div>
      )}

      {/* Tombol Absen */}
      {!sudahMasuk ? (
        <Button
          onClick={handleAbsenMasuk}
          className="w-full py-5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-lg shadow-lg sm:w-auto sm:px-25 sm:py-3"
        >
          Absen Masuk
        </Button>
      ) : (
        <Button
          onClick={handleAbsenPulang}
          className="w-full py-5 bg-gradient-to-r from-pink-500 to-purple-400 text-white text-lg shadow-lg sm:w-auto sm:px-25 sm:py-3"
        >
          Absen Pulang
        </Button>
      )}
    </div>
  );
}
