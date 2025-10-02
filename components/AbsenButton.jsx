"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { notifications } from "@/lib/notifications";
import { LoadingSpinner } from "@/components/LoadingSpinner";

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
      notifications.attendance.checkInSuccess();
      window.location.reload();
    } catch (err) {
      console.error(err);
      notifications.attendance.checkInError();
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
      notifications.attendance.tooEarly(`${jamPulang}:00`);
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
      notifications.attendance.checkOutSuccess();
    } catch (err) {
      console.error(err);
      notifications.attendance.checkOutError();
    }
  };

  if (loading) return (
    <div className="flex justify-center py-8">
      <LoadingSpinner text="Memuat data absensi..." />
    </div>
  );

  return (
    <div className="flex flex-col gap-6 items-center w-full max-w-md mx-auto">
      {/* Clock Display */}
      <div className="text-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-2xl p-6 w-full shadow-sm">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
          {tanggalDisplay}
        </p>
        <p className="text-3xl font-bold text-slate-800 dark:text-white font-mono">
          {jamDisplay}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">WIB</p>
      </div>

      {/* Tombol Absen Masuk */}
      {!sudahMasuk && !sudahPulang && (
        <Button
          onClick={handleAbsenMasuk}
          className="w-full py-4 px-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            Absen Masuk
          </div>
        </Button>
      )}

      {/* Tombol Absen Pulang */}
      {sudahMasuk && !sudahPulang && (
        <div className="w-full space-y-4">
          <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl p-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
              Pilih Jam Pulang
            </label>
            <select
              value={jamPulang}
              onChange={(e) => setJamPulang(Number(e.target.value))}
              className="w-full p-3 rounded-lg bg-white dark:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {[16, 17, 18, 19].map((jam) => (
                <option key={jam} value={jam}>
                  {jam}:00
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleAbsenPulang}
            className="w-full py-4 px-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              Absen Pulang
            </div>
          </Button>
        </div>
      )}

      {/* Status Absen */}
      {sudahMasuk && sudahPulang && (
        <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-semibold">Absensi Hari Ini Selesai</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            Terima kasih atas kerja keras Anda! ✨
          </p>
        </div>
      )}
    </div>
  );
}
