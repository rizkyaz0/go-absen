"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getCurrentUser, getAbsencesByUser, toggleAbsenceAction } from "@/lib/actions";

interface Absence {
  id: number;
  userId: number;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status: string;
}

export default function AbsenceButton() {
  const [sudahMasuk, setSudahMasuk] = useState(false);
  const [sudahPulang, setSudahPulang] = useState(false);
  const [time, setTime] = useState(new Date());
  const [absenceId, setAbsenceId] = useState<number | null>(null); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [userId, setUserId] = useState<number | null>(null);
  const [shiftId, setShiftId] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Safe date formatter
  const formatDate = (date?: string | Date | number | null) => {
    if (!date) return "-";
    const d = date instanceof Date ? date : new Date(date as string | number);
    if (Number.isNaN(d.getTime())) return "-";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Ambil info user login
  useEffect(() => {
    async function fetchUser() {
      try {
        const result = await getCurrentUser();
        if (result.error) {
          console.error(result.error);
          return;
        }
        setUserId(result.id);
        setShiftId(result.shiftId || 1);
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
        const result = await getAbsencesByUser(userId!);
        if (result.error) {
          console.error(result.error);
          return;
        }
        
        const absences = result.data;
        const todayUTC7 = new Date(new Date().getTime() + 7 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10);

        const todayAbsence = absences.find(
          (a: Absence) => a.userId === userId && formatDate(a.date) === formatDate(todayUTC7)
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

  const handleToggleAbsence = async () => {
    if (!userId || actionLoading) return;

    setActionLoading(true);
    try {
      const result = await toggleAbsenceAction(userId!, shiftId);
      
      if (result.error) {
        alert("❌ " + result.error);
        return;
      }

      if (result.success) {
        if (result.action === 'checkin') {
          setAbsenceId(result.data.id);
          setSudahMasuk(true);
          setSudahPulang(false);
        } else if (result.action === 'checkout') {
          setSudahPulang(true);
          // Update absenceId if needed
          if (result.data.id) {
            setAbsenceId(result.data.id);
          }
        }
        
        alert("✅ " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Terjadi kesalahan saat melakukan absensi");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="text-center">
        <p className="text-lg font-semibold">{tanggalDisplay}</p>
        <p className="text-3xl font-bold">{jamDisplay} WIB</p>
      </div>

      {/* Tombol Absen Toggle */}
      {!sudahPulang && (
        <Button
          onClick={handleToggleAbsence}
          disabled={actionLoading}
          className={`w-full py-5 text-lg shadow-lg sm:w-auto ${
            sudahMasuk 
              ? "bg-gradient-to-r from-pink-500 to-purple-400" 
              : "bg-gradient-to-r from-blue-500 to-cyan-400"
          }`}
        >
          {actionLoading ? "Loading..." : sudahMasuk ? "Absen Pulang" : "Absen Masuk"}
        </Button>
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