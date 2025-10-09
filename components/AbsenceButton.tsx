"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getCurrentUserCached, getAbsencesByUserCached, toggleAbsenceAction } from "@/lib/actions";
import { toZonedTime, format } from 'date-fns-tz';
import { showErrorToast, showAbsenceCheckInToast, showAbsenceCheckOutToast } from "@/lib/toast-utils";

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

  // Safe date formatter with timezone support
  const formatDate = (date?: string | Date | number | null) => {
    if (!date) return "-";
    const d = date instanceof Date ? date : new Date(date as string | number);
    if (Number.isNaN(d.getTime())) return "-";
    
    // Convert UTC date to Asia/Jakarta timezone for display
    const localDate = toZonedTime(d, 'Asia/Jakarta');
    const day = String(localDate.getDate()).padStart(2, "0");
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const year = localDate.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Ambil info user login
  useEffect(() => {
    let isMounted = true;

    async function fetchUser() {
      try {
        const result = await getCurrentUserCached();
        if (isMounted) {
          if ('error' in result) {
            console.error(result.error);
            return;
          }
          setUserId(result.id);
          setShiftId(result.shiftId || 1);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchUser();

    return () => {
      isMounted = false;
    };
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

    let isMounted = true;

    async function fetchTodayAbsence() {
      setLoading(true);
      try {
        const result = await getAbsencesByUserCached(userId!);
        if (isMounted) {
          if ('error' in result) {
            console.error(result.error);
            return;
          }
          
          const absences = result.data;
          
          // Get today's date in Asia/Jakarta timezone
          const now = new Date();
          const localTime = toZonedTime(now, 'Asia/Jakarta');
          const todayDateString = format(localTime, 'yyyy-MM-dd', { timeZone: 'Asia/Jakarta' });

          const todayAbsence = absences.find(
            (a: Absence) => a.userId === userId && formatDate(a.date) === formatDate(todayDateString)
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
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchTodayAbsence();

    return () => {
      isMounted = false;
    };
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
        showErrorToast("❌ Gagal Absen", result.error);
        return;
      }

      if (result.success) {
        if (result.action === 'checkin') {
          setAbsenceId(result.data.id);
          setSudahMasuk(true);
          setSudahPulang(false);
          showAbsenceCheckInToast(jamDisplay);
        } else if (result.action === 'checkout') {
          setSudahPulang(true);
          // Update absenceId if needed
          if (result.data.id) {
            setAbsenceId(result.data.id);
          }
          showAbsenceCheckOutToast(jamDisplay);
        }
      }
    } catch (err) {
      console.error(err);
      showErrorToast("❌ Terjadi Kesalahan", "Gagal melakukan absensi, silakan coba lagi");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 items-center w-full">
        <div className="text-center space-y-2">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="h-8 w-32 bg-muted animate-pulse rounded mx-auto" />
        </div>
        <div className="h-12 w-full sm:w-48 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-foreground">{tanggalDisplay}</p>
        <p className="text-3xl font-bold text-primary">{jamDisplay} WIB</p>
      </div>

      {/* Tombol Absen Toggle */}
      {!sudahPulang && (
        <Button
          onClick={handleToggleAbsence}
          disabled={actionLoading}
          size="lg"
          className={`w-full sm:w-auto transition-all duration-200 ${
            sudahMasuk 
              ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600" 
              : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          }`}
        >
          {actionLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Memproses...
            </>
          ) : (
            sudahMasuk ? "Absen Pulang" : "Absen Masuk"
          )}
        </Button>
      )}

      {/* Status Absen */}
      {sudahMasuk && sudahPulang && (
        <div className="flex items-center gap-2 text-green-600 font-semibold">
          <div className="h-2 w-2 bg-green-500 rounded-full" />
          Anda sudah selesai absen hari ini
        </div>
      )}
    </div>
  );
}