"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AbsenButton() {
  const [sudahMasuk, setSudahMasuk] = useState(false);
  const [sudahPulang, setSudahPulang] = useState(false);
  const [time, setTime] = useState(new Date());
  const [jamPulang, setJamPulang] = useState(17);
  const [absenceId, setAbsenceId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [shiftId, setShiftId] = useState(null);
  const [location, setLocation] = useState("Kantor Pusat");
  const [loading, setLoading] = useState(true);

  // Ambil info user login
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) throw new Error("Gagal fetch user");
        const data = await res.json();
        setUserId(data.id);
        setShiftId(data.shiftId || 1);
      } catch (err) {
        console.error(err);
      }
    }
    fetchUser();
  }, []);

  // Update jam real-time (UTC+7)
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cek absensi hari ini
  useEffect(() => {
    if (!userId) return;

    async function fetchTodayAbsence() {
      setLoading(true);
      try {
        const res = await fetch(`/api/absences?userId=${userId}`);
        if (!res.ok) throw new Error("Gagal fetch absensi");
        const absences = await res.json();
        const todayUTC7 = new Date(new Date().getTime() + 7 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10);

        const todayAbsence = absences.find(
          (a) => a.userId === userId && a.date.slice(0, 10) === todayUTC7
        );

        if (todayAbsence) {
          setAbsenceId(todayAbsence.id);
          setSudahMasuk(!!todayAbsence.checkIn);
          setSudahPulang(!!todayAbsence.checkOut);
        } else {
          setAbsenceId(null);
          setSudahMasuk(false);
          setSudahPulang(false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTodayAbsence();
  }, [userId]);

  const tanggalDisplay = time.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Jakarta",
  });

  const jamDisplay = time.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  const handleAbsenMasuk = async () => {
    if (!userId || !shiftId || sudahMasuk || sudahPulang) return;

    try {
      const checkInTime = new Date();
      const checkInUTC7 = new Date(checkInTime.getTime() + 7 * 60 * 60 * 1000);

      const res = await fetch("/api/absences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          shiftId,
          date: checkInUTC7.toISOString(),
          checkIn: checkInUTC7.toISOString(),
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
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("❌ Absen Masuk Gagal");
    }
  };

  const handleAbsenPulang = async () => {
    if (!absenceId || sudahPulang) return;

    const now = new Date();

    // Buat jam pulang target di WIB
    const jamPulangDate = new Date();
    jamPulangDate.setHours(jamPulang, 0, 0, 0);

    // Dapatkan jam sekarang di WIB
    const nowWIB = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );

    if (nowWIB < jamPulangDate) {
      alert(`⏱ Tidak bisa absen pulang sebelum jam ${jamPulang}:00 WIB`);
      return;
    }

    try {
      const res = await fetch("/api/absences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: absenceId,
          checkOut: nowWIB.toISOString(),
          status: "Pulang",
          note: "Pulang sesuai jadwal",
        }),
      });

      if (!res.ok) throw new Error("Gagal absen pulang");

      setSudahPulang(true);
      alert("✅ Absen Pulang Berhasil!");
    } catch (err) {
      console.error(err);
      alert("❌ Absen Pulang Gagal");
    }
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="text-center">
        <p className="text-lg font-semibold">{tanggalDisplay}</p>
        <p className="text-3xl font-bold">{jamDisplay} WIB</p>
      </div>

      {/* Tombol Absen Masuk */}
      {!sudahMasuk && !sudahPulang && (
        <Button
          onClick={handleAbsenMasuk}
          className="w-full py-5 bg-gradient-to-r from-blue-500 to-cyan-400 text-lg shadow-lg sm:w-auto"
        >
          Absen Masuk
        </Button>
      )}

      {/* Tombol Absen Pulang */}
      {sudahMasuk && !sudahPulang && (
        <>
          <div className="w-full text-center">
            <label className="text-sm text-gray-400 block mb-1">
              Pilih Jam Pulang
            </label>
            <select
              value={jamPulang}
              onChange={(e) => setJamPulang(Number(e.target.value))}
              className="w-full p-2 rounded-md bg-white/5 text-white border border-white/10 sm:w-auto"
            >
              {[16, 17, 18, 19].map((jam) => (
                <option key={jam} className="text-black" value={jam}>
                  {jam}:00
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleAbsenPulang}
            className="w-full py-5 bg-gradient-to-r from-pink-500 to-purple-400 text-lg shadow-lg sm:w-auto"
          >
            Absen Pulang
          </Button>
        </>
      )}

      {/* Status Absen */}
      {sudahMasuk && sudahPulang && (
        <p className="text-green-500 font-semibold mt-3">
          Anda sudah selesai absen hari ini ✅
        </p>
      )}
    </div>
  );
}
