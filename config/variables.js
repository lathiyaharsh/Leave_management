module.exports.role = {
  admin: 1,
  faculty: 3,
  student: 4,
};

module.exports.roleByName = {
  1: "admin",
  3: "faculty",
  4: "student",
};

module.exports.leaveDetails = {
  student: {
    totalLeave: 20,
    availableLeave: 20,
    usedLeave: 0,
    academicYear: new Date().getFullYear(),
    totalWorkingDays: 220,
    attendancePercentage: 100,
  },
  faculty: {
    totalLeave: 15,
    availableLeave: 15,
    usedLeave: 0,
    academicYear: new Date().getFullYear(),
    totalWorkingDays: 225,
    attendancePercentage: 100.0,
  },
};

module.exports.pagination = {
  limitDoc: 10,
  pageCount: 1,
};
