import { prisma } from "../src/index";

async function main() {
  const company = await prisma.company.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Acme Manufacturing",
      legalName: "Acme Manufacturing Pvt Ltd",
      gstin: "27AAAPL1234C1ZV",
      baseCurrency: "INR",
      createdBy: "system",
    },
  });

  const department = await prisma.department.upsert({
    where: { id: "00000000-0000-0000-0000-000000000010" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000010",
      companyId: company.id,
      name: "Operations",
      costCenter: "OPS-01",
      createdBy: "system",
    },
  });

  await prisma.employee.upsert({
    where: { email: "priya@acme.example" },
    update: {},
    create: {
      departmentId: department.id,
      fullName: "Priya Nair",
      email: "priya@acme.example",
      role: "Finance Manager",
      isApprover: true,
      approvalTier: 1,
      createdBy: "system",
    },
  });

  await prisma.budget.upsert({
    where: { departmentId_fiscalPeriod: { departmentId: department.id, fiscalPeriod: "2026-Q3" } },
    update: {},
    create: {
      companyId: company.id,
      departmentId: department.id,
      fiscalPeriod: "2026-Q3",
      allocated: 5_000_000,
      spent: 1_250_000,
      createdBy: "system",
    },
  });

  console.log("Seeded Company Intelligence sample graph for", company.name);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
