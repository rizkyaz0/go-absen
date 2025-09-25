"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AbsenButton() {
  const [sudahMasuk, setSudahMasuk] = useState(false);
  const [time, setTime] = useState(null);
  const [jamPulang, setJamPulang] = useState(17);
  const [absenceId, setAbsenceId] = useState(null); // untuk update absen pulang
  const userId = 4; // sementara hardcode
  const shiftId = 1; // default shift
  const location = "Kantor Pusat"; // default lokasi

  // Update jam real-time
  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cek absensi hari ini
  useEffect(() => {
    async function fetchTodayAbsence() {
      try {
        const res = await fetch("/api/absences");
        if (!res.ok) throw new Error("Gagal fetch absensi");
        const absences = await res.json();

        const today = new Date().toISOString().slice(0, 10);
        const myTodayAbsence = absences.find(
          (a) => a.userId === userId && a.date.slice(0, 10) === today
        );

        if (
          myTodayAbsence &&
          myTodayAbsence.checkIn &&
          !myTodayAbsence.checkOut
        ) {
          setSudahMasuk(true);
          setAbsenceId(myTodayAbsence.id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchTodayAbsence();
  }, [userId]);

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

  const handleAbsenMasuk = async () => {
    try {
      const checkInTime = new Date();
      const res = await fetch("/api/absences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          shiftId,
          date: checkInTime.toISOString(),
          checkIn: checkInTime.toISOString(),
          status: "Hadir",
          location,
          note: "Datang tepat waktu",
        }),
      });
      if (!res.ok) throw new Error("Gagal absen masuk");

      const data = await res.json();
      setAbsenceId(data.id);
      setSudahMasuk(true);
      alert("✅ Absen Masuk Berhasil!");
    } catch (err) {
      console.error(err);
      alert("❌ Absen Masuk Gagal");
    }
  };

  const handleAbsenPulang = async () => {
    if (!absenceId) {
      alert("❌ Absensi masuk belum terdeteksi");
      return;
    }

    try {
      const checkOutTime = new Date();
      checkOutTime.setHours(jamPulang, 0, 0, 0);

      const res = await fetch("/api/absences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: absenceId,
          checkOut: checkOutTime.toISOString(),
          status: "Pulang",
          note: "Pulang sesuai jadwal",
        }),
      });
      if (!res.ok) throw new Error("Gagal absen pulang");

      setSudahMasuk(false);
      setAbsenceId(null);
      alert("✅ Absen Pulang Berhasil!");
    } catch (err) {
      console.error(err);
      alert("❌ Absen Pulang Gagal");
    }
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      {/* Tanggal & Jam */}
      <div className="text-center">
        <p className="text-lg font-semibold">{tanggalDisplay}</p>
        <p className="text-3xl font-bold">{jamDisplay} WIB</p>
      </div>

      {/* Dropdown Jam Pulang */}
      {sudahMasuk && (
        <div className="w-full text-center">
          <label className="text-sm text-gray-400 block mb-1">
            Pilih Jam Pulang
          </label>
          <select
            value={jamPulang}
            onChange={(e) => setJamPulang(Number(e.target.value))}
            className="w-full p-2 rounded-md bg-white/5 text-white border border-white/10 sm:w-auto"
          >
            <option className="text-black" value={16}>
              16:00
            </option>
            <option className="text-black" value={17}>
              17:00
            </option>
            <option className="text-black" value={18}>
              18:00
            </option>
            <option className="text-black" value={19}>
              19:00
            </option>
          </select>
        </div>
      )}

      {/* Tombol Absen */}
      {!sudahMasuk ? (
        <Button
          onClick={handleAbsenMasuk}
          className="w-full py-5 bg-gradient-to-r from-blue-500 to-cyan-400 text-lg shadow-lg sm:w-auto"
        >
          Absen Masuk
        </Button>
      ) : (
        <Button
          onClick={handleAbsenPulang}
          className="w-full py-5 bg-gradient-to-r from-pink-500 to-purple-400 text-lg shadow-lg sm:w-auto"
        >
          Absen Pulang
        </Button>
      )}
    </div>
  );
}
