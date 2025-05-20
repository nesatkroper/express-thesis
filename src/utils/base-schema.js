const modelSchemas = {
  student: {
    id: "String",
    studentId: "String",
    firstName: "String",
    lastName: "String",
    email: "String",
    phone: "String",
    address: "String",
    birthDate: "Date",
    gender: "String",
    classId: "String",
    createdAt: "Date",
    updatedAt: "Date"
  },
  teacher: {
    id: "String",
    staffId: "String",
    firstName: "String",
    lastName: "String",
    email: "String",
    phone: "String",
    address: "String",
    hireDate: "Date",
    role: "String", // TEACHER, ADMINISTRATOR, etc.
    createdAt: "Date",
    updatedAt: "Date"
  },
  class: {
    id: "String",
    className: "String",
    classCode: "String",
    academicYear: "String",
    roomNumber: "String",
    teacherId: "String",
    createdAt: "Date",
    updatedAt: "Date"
  },
  subject: {
    id: "String",
    subjectName: "String",
    subjectCode: "String",
    description: "String",
    teacherId: "String",
    classId: "String",
    createdAt: "Date",
    updatedAt: "Date"
  },
  grade: {
    id: "String",
    grade: "String", // A, B, C, etc.
    score: "Float",
    remarks: "String",
    dateGiven: "Date",
    studentId: "String",
    subjectId: "String",
    createdAt: "Date",
    updatedAt: "Date"
  },
  attendance: {
    id: "String",
    date: "Date",
    status: "String", // PRESENT, ABSENT, etc.
    remarks: "String",
    studentId: "String",
    createdAt: "Date",
    updatedAt: "Date"
  },
  parent: {
    id: "String",
    firstName: "String",
    lastName: "String",
    email: "String",
    phone: "String",
    address: "String",
    occupation: "String",
    createdAt: "Date",
    updatedAt: "Date"
  },
  user: {
    id: "String",
    email: "String",
    password: "String",
    role: "String",
    studentId: "String",
    teacherId: "String",
    parentId: "String",
    createdAt: "Date",
    updatedAt: "Date"
  }
};


const enums = {
  AttendanceStatus: ["PRESENT", "ABSENT", "LATE", "EXCUSED"],
  GradeLevel: ["A", "B", "C", "D", "F", "INCOMPLETE"],
  StaffRole: ["TEACHER", "ADMINISTRATOR", "COUNSELOR", "LIBRARIAN", "OTHER"]
};

module.exports = { modelSchemas, enums };














// const modelSchemas = {
//   // Main Models
//   Student: {
//     id: { type: "String", required: true },
//     studentCode: { type: "String", required: true, unique: true },
//     firstName: { type: "String", required: true },
//     lastName: { type: "String", required: true },
//     email: { type: "String", required: true, unique: true },
//     phone: { type: "String" },
//     status: { type: "String", enum: ["ACTIVE", "INACTIVE", "GRADUATED", "TRANSFERRED"], default: "ACTIVE" },
//     joinDate: { type: "Date", default: "now()" },
//     classId: { type: "String" },
//     createdAt: { type: "Date", default: "now()" },
//     updatedAt: { type: "Date", default: "now()" }
//   },

//   StudentDetail: {
//     id: { type: "String", required: true },
//     studentId: { type: "String", required: true, unique: true },
//     birthDate: { type: "Date" },
//     gender: { type: "String", enum: ["MALE", "FEMALE", "OTHER"] },
//     address: { type: "String" },
//     emergencyContact: { type: "String" },
//     medicalInfo: { type: "String" },
//     photoUrl: { type: "String" },
//     createdAt: { type: "Date", default: "now()" },
//     updatedAt: { type: "Date", default: "now()" }
//   },

//   Parent: {
//     id: { type: "String", required: true },
//     parentCode: { type: "String", required: true, unique: true },
//     firstName: { type: "String", required: true },
//     lastName: { type: "String", required: true },
//     email: { type: "String", required: true, unique: true },
//     phone: { type: "String", required: true },
//     occupation: { type: "String" },
//     address: { type: "String" },
//     createdAt: { type: "Date", default: "now()" },
//     updatedAt: { type: "Date", default: "now()" }
//   },

//   ParentStudent: {
//     id: { type: "String", required: true },
//     parentId: { type: "String", required: true },
//     studentId: { type: "String", required: true },
//     relationship: { type: "String", enum: ["MOTHER", "FATHER", "GUARDIAN", "OTHER"] },
//     isPrimary: { type: "Boolean", default: false },
//     createdAt: { type: "Date", default: "now()" }
//   },

//   Teacher: {
//     id: { type: "String", required: true },
//     teacherCode: { type: "String", required: true, unique: true },
//     firstName: { type: "String", required: true },
//     lastName: { type: "String", required: true },
//     email: { type: "String", required: true, unique: true },
//     phone: { type: "String", required: true },
//     specialization: { type: "String" },
//     hireDate: { type: "Date" },
//     status: { type: "String", enum: ["ACTIVE", "ON_LEAVE", "RESIGNED"], default: "ACTIVE" },
//     createdAt: { type: "Date", default: "now()" },
//     updatedAt: { type: "Date", default: "now()" }
//   },

//   Class: {
//     id: { type: "String", required: true },
//     className: { type: "String", required: true },
//     gradeLevel: { type: "String", required: true },
//     academicYear: { type: "String", required: true },
//     roomNumber: { type: "String" },
//     createdAt: { type: "Date", default: "now()" },
//     updatedAt: { type: "Date", default: "now()" }
//   },

//   Subject: {
//     id: { type: "String", required: true },
//     subjectName: { type: "String", required: true },
//     subjectCode: { type: "String", required: true, unique: true },
//     description: { type: "String" },
//     creditHours: { type: "Number" },
//     createdAt: { type: "Date", default: "now()" },
//     updatedAt: { type: "Date", default: "now()" }
//   },

//   ClassSubject: {
//     id: { type: "String", required: true },
//     classId: { type: "String", required: true },
//     subjectId: { type: "String", required: true },
//     teacherId: { type: "String", required: true },
//     schedule: { type: "String" },
//     room: { type: "String" },
//     createdAt: { type: "Date", default: "now()" }
//   },

//   Attendance: {
//     id: { type: "String", required: true },
//     studentId: { type: "String", required: true },
//     classId: { type: "String", required: true },
//     date: { type: "Date", required: true },
//     status: { type: "String", enum: ["PRESENT", "ABSENT", "LATE", "EXCUSED"], required: true },
//     recordedBy: { type: "String" },
//     notes: { type: "String" },
//     createdAt: { type: "Date", default: "now()" }
//   },

//   Grade: {
//     id: { type: "String", required: true },
//     studentId: { type: "String", required: true },
//     subjectId: { type: "String", required: true },
//     classId: { type: "String", required: true },
//     term: { type: "String", required: true },
//     gradeValue: { type: "String", enum: ["A", "B", "C", "D", "F", "INCOMPLETE"] },
//     score: { type: "Number" },
//     comments: { type: "String" },
//     recordedBy: { type: "String" },
//     recordedAt: { type: "Date", default: "now()" }
//   }
// };

// // Enum references
// const enums = {
//   StudentStatus: ["ACTIVE", "INACTIVE", "GRADUATED", "TRANSFERRED"],
//   Gender: ["MALE", "FEMALE", "OTHER"],
//   AttendanceStatus: ["PRESENT", "ABSENT", "LATE", "EXCUSED"],
//   GradeValue: ["A", "B", "C", "D", "F", "INCOMPLETE"],
//   RelationshipType: ["MOTHER", "FATHER", "GUARDIAN", "OTHER"],
//   TeacherStatus: ["ACTIVE", "ON_LEAVE", "RESIGNED"]
// };

// module.exports = { modelSchemas, enums };