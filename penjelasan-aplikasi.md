## Penjelasan Proyek Aplikasi Absensi (Go-Absen)

### 1) Struktur Proyek

Ringkasan struktur direktori dan fungsi utamanya:

- `app/` (routing Next.js App Router)
  - `(auth)/login/page.tsx`: Halaman login (client component) yang memanggil aksi server `loginUser`.
  - `dashboard/page.tsx`: Dashboard karyawan; menampilkan tombol absensi, modal cuti, dan kartu statistik.
  - `admin/dashboard/` (area admin)
    - `page.tsx`: Dashboard admin (ringkasan kehadiran, izin, absensi terkini).
    - `absensi/page.tsx`: Tabel data absensi + filter + export CSV.
    - `izin/page.tsx`: Daftar permintaan izin/cuti (approve/reject + reset kuota bulanan).
    - `izin/[id]/page.tsx`: Detail permintaan izin.
    - `karyawan/` (CRUD user): `page.tsx`, `tambah/page.tsx`, `edit/[id]/page.tsx`, `detail/[id]/page.tsx`.
    - `hari-libur/page.tsx`: CRUD hari libur (full-day/half-day) untuk perhitungan hari kerja.
    - `laporan/page.tsx`: Laporan komprehensif + export Excel.
    - `layout.jsx`: Layout admin + sidebar + header.
  - `layout.tsx`, `globals.css`: Root layout & stylesheet global.
- `components/` (UI dan komponen domain)
  - `AbsenceButton.tsx`: Tombol toggle absen (Masuk/Pulang) untuk karyawan.
  - `CutiModal.jsx`: Form pengajuan cuti/izin.
  - `StatCard.tsx`, `StatCardServer.tsx`: Kartu statistik (client) dan kartu dari aksi server.
  - `LogoutModal.tsx`, `ConfirmModal.tsx`, `DeleteConfirmModal.tsx`: Modal utilitas.
  - `ui/*`: Kumpulan komponen UI (shadcn/radix: `button.tsx`, `card.tsx`, `table.tsx`, dsb.).
  - `legacy/*`: Komponen lama (tidak utama).
- `lib/` (utilitas dan aksi server)
  - `actions/`
    - `auth.ts`: Login (JWT cookie), logout, dan fetch user saat ini.
    - `absences.ts`: Query, create/update/delete Absence, dan `toggleAbsenceAction` (check-in/out).
    - `users.ts`: Query dan CRUD User (role-based: admin-only untuk create/update/delete).
    - `leave.ts`: Query & CRUD LeaveRequest, reset kuota cuti bulanan (`resetMonthlyLeaveQuota`).
    - `reports.ts`: Ringkasan, laporan harian/bulanan, top terlambat, dan laporan komprehensif.
    - `stats.ts`: Statistik ringan (hadir bulan ini, sisa cuti user, dsb.).
    - `holidays.ts`: Query & CRUD `Holiday` (admin-only).
    - `index.ts`: Barrel export untuk seluruh aksi.
  - `utils.ts`, `toast-utils.ts`: Helper kecil dan utilitas toast.
- `prisma/`
  - `schema.prisma`: Skema database (MySQL/SQLite via env `DATABASE_URL`).
  - `migrations/*`: Migrasi Prisma.
- `prisma.ts`: Inisialisasi `PrismaClient` singleton (log query aktif saat dev).
- `middleware.ts`: Proteksi rute via verifikasi JWT (JOSE) + autorisasi role (admin vs non-admin).
- Konfigurasi & aset: `package.json`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.mjs`, `components.json`, `public/*`.


### 2) Alur Utama Aplikasi (End-to-End Flow)

- **Login → Set Session (JWT Cookie)**
  - Frontend: `app/(auth)/login/page.tsx` kirim email/password ke `loginUser`.
  - Backend: `lib/actions/auth.ts::loginUser` verifikasi user, lalu membuat JWT (`jsonwebtoken`) dan menyimpannya di cookie `token` (HTTPOnly, SameSite=Lax, Secure di prod). Redirect:
    - `roleId === 3` → `/admin/dashboard`
    - selain itu → `/dashboard`
  - Proteksi: `middleware.ts` memverifikasi cookie `token` dengan `jose.jwtVerify` dan membatasi akses rute:
    - Publik: `/`, `/login`, `/register`, dll.
    - Non-admin hanya boleh ke `/dashboard`.
- **Masuk ke Dashboard**
  - Admin: `app/admin/dashboard/page.tsx` memanggil paralel `getAllUsersCached`, `getAllAbsencesCached`, `getAllLeaveRequestsCached` untuk merender ringkasan & aktivitas.
  - Karyawan: `app/dashboard/page.tsx` memanggil `getCurrentUserCached`, lalu menampilkan `AbsenceButton` dan `CutiModal`, serta kartu statistik via aksi server (`getAttendanceStatsCached`, `getUserLeaveStatsCached`).
- **Melakukan Absensi (Check-in → Check-out)**
  - UI: `components/AbsenceButton.tsx` membaca user login, cek absensi hari ini (`getAbsencesByUserCached`), dan memanggil `toggleAbsenceAction` saat tombol ditekan.
  - Server: `lib/actions/absences.ts::toggleAbsenceAction`
    - Menghitung tanggal lokal Asia/Jakarta (pakai `date-fns-tz`).
    - Mencari absensi hari ini untuk `userId` (jam 00:00–23:59, UTC-harmonized).
    - Jika belum ada: buat record check-in (status: "Hadir").
    - Jika sudah check-in dan belum check-out: hanya izinkan checkout ≥ 16:00 WIB.
    - Jika sudah check-in & check-out: tolak ("Anda sudah selesai absen hari ini").
    - Revalidate halaman yang relevan agar UI terbarui.
- **Melihat Laporan**
  - UI: `app/admin/dashboard/laporan/page.tsx` mengambil `getComprehensiveReport` (ringkasan, bulanan, harian, top terlambat). Fallback ke pemanggilan individual jika perlu.
  - Server: `lib/actions/reports.ts` mengerjakan agregasi (kombinasi Prisma query dan `$queryRaw`) dengan normalisasi zona waktu.
- **Export Data**
  - Export Excel: di halaman `laporan`, menggunakan lib `xlsx` untuk membuat workbook berisi beberapa sheet (Ringkasan, Rekap Bulanan, Karyawan Terlambat, Rekap Harian).
  - Export CSV: di halaman `absensi`, utility inline membuat CSV dari data yang sudah difilter.

Aliran data: Client component → memanggil Server Action (Next.js "use server") → Prisma ORM ke DB → hasil dikembalikan ke komponen → opsional revalidate cache/path agar halaman lain ikut segar.


### 3) Fitur & Logika Detail

- **Login & Autentikasi**
  - Mekanisme: JWT (bukan NextAuth). File terkait:
    - `lib/actions/auth.ts`: `loginUser`, `getCurrentUserCached`, `logoutUser`.
    - `middleware.ts`: verifikasi JWT dengan `jose`, penyaringan rute berdasarkan role.
  - Token disimpan sebagai cookie `token` (HTTPOnly). `getCurrentUserCached` mengurai token dan fetch user (cached dengan `unstable_cache`).
  - Catatan: `bcryptjs` sudah terpasang di dependencies, namun validasi password saat ini masih membandingkan plaintext. Disarankan meng-hash password ke depan.

- **Absensi (Check-in & Check-out)**
  - Create/Update/Delete & Query: `lib/actions/absences.ts`.
  - `toggleAbsenceAction(userId, shiftId=1)` menangani logika harian:
    - Cek record Absence pada tanggal lokal berjalan.
    - Jika belum ada → buat check-in (status "Hadir").
    - Jika ada check-in tapi belum check-out → izinkan check-out mulai pukul 16:00 WIB.
    - Jika sudah check-in & check-out → tolak double absen.
  - Validasi penting:
    - Cegah check-in ganda dengan mencari record hari ini sebelum membuat.
    - Cegah check-out terlalu awal (< 16:00 WIB).
    - Penentuan "terlambat" digunakan dalam laporan/statistik (lihat bagian Laporan & Stats) dengan ambang 08:00/08:15 WIB (tergantung konteks perhitungan).

- **Dashboard & Role User**
  - Role:
    - `roleId === 3` = Admin (akses penuh area admin).
    - Non-admin hanya akses `/dashboard`.
  - Admin Dashboard (`app/admin/dashboard/page.tsx`): menampilkan total karyawan aktif, hadir/telat/absen hari ini, izin pending/approved/rejected, dan aktivitas terbaru.
  - Karyawan Dashboard (`app/dashboard/page.tsx`): fokus ke tombol absensi, pengajuan izin, dan statistik personal (hadir bulan ini, sisa cuti bulan ini).

- **Izin/Cuti & Kuota**
  - Aksi: `lib/actions/leave.ts` (CRUD `LeaveRequest`), approve/reject (admin-only), dan `resetMonthlyLeaveQuota`.
  - `resetMonthlyLeaveQuota`: mencatat event reset (`LeaveReset`) dan men-set `LeaveQuota` bulan berjalan per-user agar sisa cuti menjadi 2 hari tanpa menghapus histori.
  - UI Admin: `app/admin/dashboard/izin/*` untuk daftar, detail, approve/reject, dan tombol reset kuota bulanan.

- **Hari Libur**
  - Aksi: `lib/actions/holidays.ts` (admin-only) untuk CRUD `Holiday` (full day / half day) dan revalidasi tag `reports` agar perhitungan hari kerja ikut terbarui.
  - UI: `app/admin/dashboard/hari-libur/page.tsx`.

- **Laporan & Export (PDF/Excel)**
  - Laporan: `lib/actions/reports.ts` menyediakan:
    - `getSummaryReport(start, end)`: total hari kerja (Mon–Fri minus holiday), rata-rata kehadiran, total terlambat, izin disetujui/ditolak.
    - `getDailyReport`, `getMonthlyReport`, `getLateEmployeesReport`.
    - `getComprehensiveReport`: aggregator paralel.
  - Export:
    - Excel: `app/admin/dashboard/laporan/page.tsx` menggunakan `xlsx` (multi-sheet + auto-fit kolom + metadata workbook).
    - CSV: `app/admin/dashboard/absensi/page.tsx` untuk dump data absensi yang sudah difilter.
  - Validasi & logika penting:
    - Zona waktu selalu dinormalisasi ke Asia/Jakarta (menghindari mismatch check-in/out).
    - Hitung hari kerja: exclude weekend + kurangi full-day holiday, half-day mengurangi 0.5 dari kapasitas hari kerja.
    - Keterlambatan: check-in setelah cut-off (umumnya > 08:00 atau > 08:15; konsistensi cut-off dapat dinormalkan sesuai kebijakan).


### 4) Koneksi ke Database (Prisma)

- **Datasource & Generator**
  - `provider = "mysql"` (bisa diganti), `url = env("DATABASE_URL")`.
  - Generator: `prisma-client-js`.

- **Model Utama & Relasi**
  - `Role (1) — (∞) User`: Role menyimpan jabatan (Admin, Developer, dll.).
  - `Status (1) — (∞) User`: Status aktif/nonaktif.
  - `User (1) — (∞) Absence`: Riwayat absensi per user.
  - `Shift (1) — (∞) Absence`: Opsi jadwal/shift.
  - `User (1) — (∞) LeaveRequest`: Pengajuan izin/cuti.
  - `Holiday`: Tanggal merah (unique per `date`, dengan `isHalfDay`).
  - `LeaveReset`: Log reset kuota cuti.
  - `LeaveQuota`: Kuota cuti bulanan per user (unique composite `userId_year_month`).

- **Contoh Query Penting (berdasarkan implementasi)**
  - Buat Absence (check-in): `prisma.absence.create({ data: { userId, date, checkIn, status: 'Hadir', ... } })`.
  - Update Absence (check-out): `prisma.absence.update({ where: { id }, data: { checkOut, status: 'Pulang' } })`.
  - Ambil absensi user: `prisma.absence.findMany({ where: { userId }, include: { user, shift } })`.
  - Agregasi laporan (raw): `prisma.$queryRaw` untuk menghitung hadir unik per hari/ bulan, total terlambat, dll. dengan `DATE_ADD(..., INTERVAL 7 HOUR)`.
  - Reset kuota cuti: `prisma.leaveQuota.upsert({ where: { userId_year_month }, update: { quota }, create: {...} })`.

- **Inisialisasi Prisma**
  - `prisma.ts` mengekspor singleton `prisma` dan mengaktifkan `log: ["query"]` saat dev untuk debugging query.


### 5) Teknologi & Library yang Digunakan

- **Next.js 15 (App Router)**: Framework React fullstack (routing, middleware, server actions, cache/revalidate).
- **React 19**: UI library.
- **Prisma 6**: ORM untuk akses DB yang aman dan tiped.
- **Tailwind CSS 4 + Radix UI + shadcn**: Styling & komponen UI siap pakai.
- **JWT (jsonwebtoken/jose)**: Autentikasi berbasis token, verifikasi di `middleware` dan aksi server.
- **date-fns-tz**: Normalisasi waktu Asia/Jakarta agar perhitungan harian akurat.
- **xlsx**: Export Excel multi-sheet untuk laporan.
- **sonner**: Toast notifikasi.
- Lainnya: `framer-motion` (animasi), `lucide-react` & `@tabler/icons-react` (ikon), `@tanstack/react-table` (tabel), `bcryptjs` (belum dipakai; direkomendasikan untuk hash password), dsb.


### 6) Penjelasan Teknis & Pemahaman Konseptual

- **Kenapa JWT + Middleware?**
  - Anggap JWT seperti "karcis akses" tersimpan di cookie. Setiap kali user akses halaman, `middleware` memeriksa karcis ini. Jika valid dan role cocok, user boleh lewat. Ini membuat proteksi rute konsisten tanpa harus menambah guard di tiap halaman.

- **Server Actions sebagai "API internal"**
  - Alih-alih membuat endpoint REST/GraphQL terpisah, halaman memanggil fungsi server langsung (annotasi `'use server'`). Secara mental model, ini mirip memanggil service layer di backend—hanya saja dipanggil dari komponen React. Lebih sedikit boilerplate, tetap aman karena verifikasi cookie dilakukan di sisi server.

- **Zona Waktu Asia/Jakarta**
  - Sumber umum bug absensi adalah pergeseran timezone. Aplikasi ini selalu mengonversi waktu ke Asia/Jakarta saat membuat/menampilkan data (misalnya saat check-in jam 08:10 WIB, tidak terekam 01:10 UTC keesokan harinya). Ini menjaga logika harian (00:00–23:59) tetap konsisten.

- **Caching & Revalidate**
  - `unstable_cache` dipakai untuk data yang sering diakses (user saat ini, daftar absensi) agar halaman cepat. Setelah mutasi (misal check-in), `revalidatePath`/`revalidateTag` dipanggil supaya halaman/statistik lain ikut segar.

- **Kebijakan Bisnis Absensi**
  - Cegah double check-in: hanya satu record per hari. 
  - Cegah check-out dini: minimal jam 16:00.
  - Keterlambatan: ditandai jika check-in melewati cut-off (08:00/08:15 sesuai konteks perhitungan). Ambang bisa diseragamkan di satu tempat jika diinginkan.

- **Kuota Cuti Bulanan**
  - Reset tidak menghapus histori—hanya menyesuaikan `LeaveQuota` bulan berjalan supaya sisa cuti konsisten (default 2 hari/bulan), dengan tetap menghargai cuti yang sudah disetujui sebelumnya.


### 7) Kesimpulan Akhir

- Aplikasi ini memadukan **Next.js App Router**, **Server Actions**, dan **Prisma** untuk menghadirkan sistem absensi yang cepat, aman, dan mudah dirawat.
- Alur utama: login (JWT cookie) → dashboard sesuai role → karyawan absen via tombol (cek-unik harian & kebijakan jam) → admin memantau data real-time, mengelola izin/hari libur → menghasilkan laporan komprehensif dan **export Excel/CSV**.
- Fokus teknis pada: proteksi rute via middleware, normalisasi zona waktu, caching pintar + revalidate, serta agregasi data berbasis SQL/Prisma.
- Rekomendasi peningkatan:
  - Pakai `bcryptjs` untuk hash password (ganti pembanding plaintext).
  - Seragamkan cut-off keterlambatan (08:00 vs 08:15) di satu konfigurasi.
  - Tambahkan audit log untuk perubahan penting (opsional), dan pengaturan role/permission lebih granular jika dibutuhkan.

Dengan penjelasan ini, Anda dapat menjelaskan kembali bagaimana sistem bekerja end-to-end, dari arsitektur hingga detail logika bisnis yang mencegah kasus umum absensi (double input dan checkout dini), serta bagaimana laporan dihitung dan diekspor.