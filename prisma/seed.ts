import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin' }
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {},
    create: { name: 'Manager' }
  });

  const employeeRole = await prisma.role.upsert({
    where: { name: 'Employee' },
    update: {},
    create: { name: 'Employee' }
  });

  console.log('✅ Roles created');

  // Create statuses
  const activeStatus = await prisma.status.upsert({
    where: { name: 'Active' },
    update: {},
    create: { name: 'Active' }
  });

  const inactiveStatus = await prisma.status.upsert({
    where: { name: 'Inactive' },
    update: {},
    create: { name: 'Inactive' }
  });

  const onLeaveStatus = await prisma.status.upsert({
    where: { name: 'On Leave' },
    update: {},
    create: { name: 'On Leave' }
  });

  console.log('✅ Statuses created');

  // Create shifts
  const morningShift = await prisma.shift.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Morning Shift',
      startTime: new Date('2024-01-01T08:00:00Z'),
      endTime: new Date('2024-01-01T17:00:00Z')
    }
  });

  const afternoonShift = await prisma.shift.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Afternoon Shift',
      startTime: new Date('2024-01-01T13:00:00Z'),
      endTime: new Date('2024-01-01T22:00:00Z')
    }
  });

  console.log('✅ Shifts created');

  // Create users
  const users = [
    {
      name: 'Admin User',
      email: 'admin@company.com',
      password: 'admin123', // In production, this should be hashed
      roleId: adminRole.id,
      statusId: activeStatus.id
    },
    {
      name: 'John Manager',
      email: 'john@company.com',
      password: 'manager123',
      roleId: managerRole.id,
      statusId: activeStatus.id
    },
    {
      name: 'Alice Johnson',
      email: 'alice@company.com',
      password: 'employee123',
      roleId: employeeRole.id,
      statusId: activeStatus.id
    },
    {
      name: 'Bob Smith',
      email: 'bob@company.com',
      password: 'employee123',
      roleId: employeeRole.id,
      statusId: activeStatus.id
    },
    {
      name: 'Carol Brown',
      email: 'carol@company.com',
      password: 'employee123',
      roleId: employeeRole.id,
      statusId: activeStatus.id
    },
    {
      name: 'David Wilson',
      email: 'david@company.com',
      password: 'employee123',
      roleId: employeeRole.id,
      statusId: activeStatus.id
    },
    {
      name: 'Eva Davis',
      email: 'eva@company.com',
      password: 'employee123',
      roleId: employeeRole.id,
      statusId: onLeaveStatus.id
    },
    {
      name: 'Frank Miller',
      email: 'frank@company.com',
      password: 'employee123',
      roleId: employeeRole.id,
      statusId: activeStatus.id
    },
    {
      name: 'Grace Taylor',
      email: 'grace@company.com',
      password: 'employee123',
      roleId: employeeRole.id,
      statusId: activeStatus.id
    },
    {
      name: 'Henry Anderson',
      email: 'henry@company.com',
      password: 'employee123',
      roleId: employeeRole.id,
      statusId: activeStatus.id
    }
  ];

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData
    });
  }

  console.log('✅ Users created');

  // Create sample attendance data for the last 30 days
  const createdUsers = await prisma.user.findMany();
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    for (const user of createdUsers) {
      // Skip some users randomly to simulate absences
      if (Math.random() < 0.1) continue;
      
      const isLate = Math.random() < 0.15; // 15% chance of being late
      const hasCheckOut = Math.random() < 0.9; // 90% chance of checking out
      
      const baseCheckIn = new Date(date);
      baseCheckIn.setHours(8, 0, 0, 0);
      
      if (isLate) {
        // Add 15-60 minutes for late arrival
        baseCheckIn.setMinutes(baseCheckIn.getMinutes() + Math.floor(Math.random() * 45) + 15);
      } else {
        // Add some variation for normal arrival (-10 to +10 minutes)
        baseCheckIn.setMinutes(baseCheckIn.getMinutes() + Math.floor(Math.random() * 21) - 10);
      }
      
      let checkOut = null;
      if (hasCheckOut) {
        checkOut = new Date(date);
        checkOut.setHours(17, 0, 0, 0);
        // Add some variation for checkout time (-30 to +60 minutes)
        checkOut.setMinutes(checkOut.getMinutes() + Math.floor(Math.random() * 91) - 30);
      }
      
      await prisma.absence.create({
        data: {
          userId: user.id,
          shiftId: morningShift.id,
          date: date,
          checkIn: baseCheckIn,
          checkOut: checkOut,
          status: 'Hadir',
          location: 'Main Office',
          note: isLate ? 'Terlambat karena macet' : null
        }
      });
    }
  }

  console.log('✅ Sample attendance data created');

  // Create sample leave requests
  const leaveRequests = [
    {
      userId: createdUsers[2].id, // Alice
      startDate: new Date('2024-12-20'),
      endDate: new Date('2024-12-22'),
      type: 'Cuti',
      status: 'Approved',
      reason: 'Liburan keluarga'
    },
    {
      userId: createdUsers[3].id, // Bob
      startDate: new Date('2024-12-15'),
      endDate: new Date('2024-12-15'),
      type: 'Sakit',
      status: 'Approved',
      reason: 'Demam dan flu'
    },
    {
      userId: createdUsers[4].id, // Carol
      startDate: new Date('2024-12-25'),
      endDate: new Date('2024-12-27'),
      type: 'Cuti',
      status: 'Pending',
      reason: 'Acara keluarga'
    },
    {
      userId: createdUsers[5].id, // David
      startDate: new Date('2024-12-18'),
      endDate: new Date('2024-12-18'),
      type: 'Izin',
      status: 'Rejected',
      reason: 'Keperluan pribadi'
    },
    {
      userId: createdUsers[7].id, // Frank
      startDate: new Date('2024-12-30'),
      endDate: new Date('2025-01-02'),
      type: 'Cuti',
      status: 'Pending',
      reason: 'Liburan tahun baru'
    }
  ];

  for (const leaveData of leaveRequests) {
    await prisma.leaveRequest.create({
      data: leaveData
    });
  }

  console.log('✅ Sample leave requests created');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });