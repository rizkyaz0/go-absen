"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  User,
  LogIn,
  LogOut,
  AlertCircle
} from "lucide-react";

interface AttendanceStatus {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
  };
  attendance?: {
    id: number;
    date: string;
    checkIn?: string;
    checkOut?: string;
    status: string;
    location?: string;
    note?: string;
  };
  status: 'not_checked_in' | 'checked_in' | 'checked_out';
  canCheckIn: boolean;
  canCheckOut: boolean;
  isLate: boolean;
  workDuration?: string;
  today: string;
}

export default function EmployeeDashboard() {
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // For demo purposes, using user ID 3 (Alice Johnson)
  const currentUserId = 3;

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchAttendanceStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/attendance/status?userId=${currentUserId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch attendance status');
      }
      
      const data = await response.json();
      setAttendanceStatus(data);
    } catch (err) {
      console.error('Error fetching attendance status:', err);
      setError('Failed to load attendance status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceStatus();
  }, []);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError(null);
      
      const response = await fetch('/api/attendance/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUserId,
          location: 'Main Office',
          note: 'Check-in via web dashboard'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check in');
      }
      
      // Refresh attendance status
      await fetchAttendanceStatus();
    } catch (err) {
      console.error('Error checking in:', err);
      setError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError(null);
      
      const response = await fetch('/api/attendance/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUserId,
          note: 'Check-out via web dashboard'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check out');
      }
      
      // Refresh attendance status
      await fetchAttendanceStatus();
    } catch (err) {
      console.error('Error checking out:', err);
      setError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!attendanceStatus) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-red-600 mb-4">Failed to load dashboard</p>
          <Button onClick={fetchAttendanceStatus}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Selamat Datang, {attendanceStatus.user.name}!
          </h1>
          <p className="text-xl text-gray-600">
            {formatDate(attendanceStatus.today)}
          </p>
          <p className="text-lg text-gray-500">
            {currentTime.toLocaleTimeString('id-ID')}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Karyawan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{attendanceStatus.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <Badge variant="outline">{attendanceStatus.user.role}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={attendanceStatus.user.status === 'Active' ? 'default' : 'secondary'}>
                  {attendanceStatus.user.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Status Absensi Hari Ini
            </CardTitle>
            <CardDescription>
              Kelola kehadiran Anda untuk hari ini
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Status */}
            <div className="text-center">
              {attendanceStatus.status === 'not_checked_in' && (
                <div>
                  <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-red-600">Belum Check-in</h3>
                  <p className="text-gray-600">Silakan lakukan check-in untuk memulai hari kerja</p>
                </div>
              )}
              
              {attendanceStatus.status === 'checked_in' && (
                <div>
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-600">Sudah Check-in</h3>
                  <p className="text-gray-600">
                    {attendanceStatus.isLate ? 'Anda terlambat hari ini' : 'Selamat bekerja!'}
                  </p>
                  {attendanceStatus.workDuration && (
                    <p className="text-sm text-gray-500 mt-2">
                      Durasi kerja: {attendanceStatus.workDuration}
                    </p>
                  )}
                </div>
              )}
              
              {attendanceStatus.status === 'checked_out' && (
                <div>
                  <CheckCircle className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-blue-600">Sudah Check-out</h3>
                  <p className="text-gray-600">Terima kasih atas kerja keras Anda hari ini!</p>
                  {attendanceStatus.workDuration && (
                    <p className="text-sm text-gray-500 mt-2">
                      Total durasi kerja: {attendanceStatus.workDuration}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Attendance Details */}
            {attendanceStatus.attendance && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center">
                  <LogIn className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Check-in</p>
                  <p className="font-semibold text-lg">
                    {formatTime(attendanceStatus.attendance.checkIn)}
                  </p>
                  {attendanceStatus.isLate && (
                    <Badge variant="secondary" className="mt-1">Terlambat</Badge>
                  )}
                </div>
                
                <div className="text-center">
                  <LogOut className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Check-out</p>
                  <p className="font-semibold text-lg">
                    {formatTime(attendanceStatus.attendance.checkOut)}
                  </p>
                </div>
                
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Lokasi</p>
                  <p className="font-semibold">
                    {attendanceStatus.attendance.location || 'Main Office'}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-6">
              {attendanceStatus.canCheckIn && (
                <Button
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                  size="lg"
                  className="px-8"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Check-in
                    </>
                  )}
                </Button>
              )}
              
              {attendanceStatus.canCheckOut && (
                <Button
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" />
                      Check-out
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Hari Ini</p>
              <p className="text-2xl font-bold">
                {attendanceStatus.status === 'checked_out' ? 'Selesai' : 
                 attendanceStatus.status === 'checked_in' ? 'Bekerja' : 'Belum Mulai'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Jam Kerja</p>
              <p className="text-2xl font-bold">08:00 - 17:00</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Lokasi</p>
              <p className="text-2xl font-bold">Main Office</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}