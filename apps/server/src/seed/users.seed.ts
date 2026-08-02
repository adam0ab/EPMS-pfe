import { Role } from "@epms/shared";
import { UserModel } from "../models/User.model";
import { DepartmentModel } from "../models/Department.model";
import { hashPassword } from "../utils/password";

const ADDITIONAL_EMPLOYEES = [
  { fullName: "Sami Ben Ali", email: "sami.benali@esprit.tn", department: "Academic Affairs" },
  { fullName: "Amal Trabelsi", email: "amal.trabelsi@esprit.tn", department: "Finance" },
  { fullName: "Karim Jaziri", email: "karim.jaziri@esprit.tn", department: "Human Resources" },
  { fullName: "Nour Haddad", email: "nour.haddad@esprit.tn", department: "Examination Department" },
  { fullName: "Yassine Gharbi", email: "yassine.gharbi@esprit.tn", department: "Logistics" },
  { fullName: "Salma Mejri", email: "salma.mejri@esprit.tn", department: "Quality Assurance", isActive: false },
];

const STUDENT = {
  fullName: "Student EPMS",
  email: "student@esprit.tn",
  department: "Academic Affairs",
};

const VALIDATOR = {
  fullName: "EPMS Validator",
  email: "validator@esprit.tn",
  department: "Quality Assurance",
};

export async function seedUsers() {
  const itDepartment = await DepartmentModel.findOne({ name: "IT Department" });

  const superAdminPassword = await hashPassword("Admin@12345");
  const employeePassword = await hashPassword("Employee@12345");

  const superAdmin = await UserModel.findOneAndUpdate(
    { email: "admin@esprit.tn" },
    {
      fullName: "EPMS Super Admin",
      email: "admin@esprit.tn",
      passwordHash: superAdminPassword,
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
    { upsert: true, new: true }
  );

  const employee = await UserModel.findOneAndUpdate(
    { email: "employee@esprit.tn" },
    {
      fullName: "Sample Employee",
      email: "employee@esprit.tn",
      passwordHash: employeePassword,
      role: Role.EMPLOYEE,
      department: itDepartment?._id,
      isActive: true,
    },
    { upsert: true, new: true }
  );

  for (const def of ADDITIONAL_EMPLOYEES) {
    const department = await DepartmentModel.findOne({ name: def.department });
    await UserModel.findOneAndUpdate(
      { email: def.email },
      {
        fullName: def.fullName,
        email: def.email,
        passwordHash: employeePassword,
        role: Role.EMPLOYEE,
        department: department?._id,
        isActive: def.isActive ?? true,
      },
      { upsert: true, new: true }
    );
  }

  const studentDepartment = await DepartmentModel.findOne({ name: STUDENT.department });
  await UserModel.findOneAndUpdate(
    { email: STUDENT.email },
    {
      fullName: STUDENT.fullName,
      email: STUDENT.email,
      passwordHash: employeePassword,
      role: Role.STUDENT,
      department: studentDepartment?._id,
      isActive: true,
    },
    { upsert: true, new: true }
  );

  const validatorDepartment = await DepartmentModel.findOne({ name: VALIDATOR.department });
  await UserModel.findOneAndUpdate(
    { email: VALIDATOR.email },
    {
      fullName: VALIDATOR.fullName,
      email: VALIDATOR.email,
      passwordHash: employeePassword,
      role: Role.VALIDATOR,
      department: validatorDepartment?._id,
      isActive: true,
    },
    { upsert: true, new: true }
  );

  console.log("[seed] super admin: admin@esprit.tn / Admin@12345");
  console.log("[seed] employee:    employee@esprit.tn / Employee@12345");
  console.log(`[seed] ${ADDITIONAL_EMPLOYEES.length} additional sample employees ready (password: Employee@12345)`);
  console.log("[seed] student: student@esprit.tn / Employee@12345");
  console.log("[seed] validator: validator@esprit.tn / Employee@12345");

  return { superAdmin, employee };
}
