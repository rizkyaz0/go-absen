# Go Absen - Sistem Manajemen Absensi Karyawan

Aplikasi web modern untuk mengelola absensi karyawan dengan fitur lengkap dan interface yang user-friendly.

## 🚀 Fitur Utama

### 📊 Dashboard Admin
- **Overview Dashboard**: Statistik real-time kehadiran karyawan
- **Manajemen Karyawan**: CRUD lengkap untuk data karyawan
- **Manajemen Absensi**: Monitor dan kelola data absensi
- **Manajemen Izin**: Approve/reject permintaan izin dan cuti
- **Laporan Komprehensif**: Export ke Excel/PDF dengan visualisasi data

### 👥 Dashboard Karyawan
- **Check-in/Check-out**: Absensi real-time dengan deteksi keterlambatan
- **Status Kehadiran**: Monitor status absensi harian
- **Tracking Waktu Kerja**: Hitung durasi kerja otomatis

### 🔧 Fitur Teknis
- **Database**: SQLite dengan Prisma ORM
- **API**: RESTful API dengan validasi data
- **UI/UX**: Modern interface dengan Tailwind CSS dan shadcn/ui
- **Real-time**: Update data secara real-time
- **Responsive**: Optimized untuk desktop dan mobile

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: SQLite dengan Prisma ORM
- **UI Framework**: Tailwind CSS, shadcn/ui
- **Icons**: Lucide React
- **Export**: jsPDF, xlsx, html2canvas

## 📦 Instalasi

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd go-absen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev --name init
   
   # Seed database with sample data
   npm run db:seed
   ```

4. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file sesuai kebutuhan.

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Akses aplikasi**
   - Landing Page: http://localhost:3000
   - Employee Dashboard: http://localhost:3000/dashboard
   - Admin Dashboard: http://localhost:3000/admin/dashboard

## 📚 Struktur Database

### Users (Karyawan)
- ID, nama, email, password
- Role (Admin, Manager, Employee)
- Status (Active, Inactive, On Leave)

### Absences (Absensi)
- User ID, tanggal, check-in, check-out
- Status, lokasi, catatan
- Relasi dengan user dan shift

### Leave Requests (Permintaan Izin)
- User ID, tanggal mulai/selesai
- Tipe (Cuti, Izin, Sakit)
- Status (Pending, Approved, Rejected)
- Alasan dan approver

### Roles & Statuses
- Master data untuk role dan status karyawan

### Shifts
- Jadwal kerja karyawan (opsional)

## 🎯 Cara Penggunaan

### Admin Dashboard
1. Akses `/admin/dashboard`
2. Monitor statistik kehadiran real-time
3. Kelola data karyawan di menu "Data Karyawan"
4. Review dan approve izin di menu "Daftar Izin"
5. Generate laporan di menu "Laporan Absensi"

### Employee Dashboard
1. Akses `/dashboard`
2. Lakukan check-in saat tiba di kantor
3. Monitor status kehadiran
4. Lakukan check-out saat pulang

### API Endpoints
- `GET/POST /api/users` - Manajemen karyawan
- `GET/POST/PUT/DELETE /api/absences` - Manajemen absensi
- `GET/POST/PATCH /api/leave` - Manajemen izin
- `POST /api/attendance/checkin` - Check-in
- `POST /api/attendance/checkout` - Check-out
- `GET /api/attendance/status` - Status absensi
- `GET /api/reports/*` - Generate laporan

## 📊 Sample Data

Aplikasi sudah dilengkapi dengan sample data:
- 10 karyawan dengan berbagai role
- Data absensi 30 hari terakhir
- Sample permintaan izin
- Role dan status default

## 🔒 Keamanan

- Password hashing (TODO: implementasi bcrypt)
- Input validation pada semua API
- Error handling yang comprehensive
- SQL injection protection via Prisma

## 🚧 Development

### Available Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run db:seed      # Seed database
npm run db:reset     # Reset & seed database
```

### Database Commands
```bash
npx prisma studio    # Database GUI
npx prisma migrate   # Run migrations
npx prisma generate  # Generate client
```

## 📈 Roadmap

- [ ] Authentication & authorization system
- [ ] Password hashing dengan bcrypt
- [ ] Multi-tenant support
- [ ] Mobile app (React Native)
- [ ] Advanced reporting & analytics
- [ ] Integration dengan sistem payroll
- [ ] Notification system
- [ ] Geolocation-based check-in

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - lihat file LICENSE untuk detail.

## 📞 Support

Untuk pertanyaan atau dukungan, silakan buat issue di repository ini.

---

**Go Absen** - Sistem Manajemen Absensi Karyawan Modern 🚀