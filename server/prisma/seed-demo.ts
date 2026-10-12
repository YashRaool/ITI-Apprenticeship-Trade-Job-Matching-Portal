import { PrismaClient, Role, JobType, VerifStatus, JobStatus } from "@prisma/client";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── 1. Baseline Trade Skills ─────────────────────────────────────────────────
const baselineTradeSkills = [
  { name: "Electrician", category: "Electrical" },
  { name: "Fitter", category: "Mechanical" },
  { name: "Welder", category: "Fabrication" },
  { name: "Mechanic", category: "Automotive & Mechanical" },
  { name: "Machinist", category: "Mechanical" },
  { name: "Turner", category: "Mechanical" },
  { name: "Electronics Mechanic", category: "Electronics" },
  { name: "COPA", category: "IT & Systems" },
  { name: "Technician", category: "General" },
  { name: "Plumber", category: "Civil" },
  { name: "Carpenter", category: "Civil" },
];

// ─── 2. Clearly Labelled Demo Employers ───────────────────────────────────────
// Uses unguessable randomized password hashes to prevent predictable default credentials
const demoEmployers = [
  {
    email: "demo.tatamotors@itiportal.demo",
    workshopName: "[Demo] Tata Motors Apprenticeship Center",
    industryType: "Automotive & Commercial Vehicle Manufacturing",
    location: "Pune, Maharashtra",
    contactPhone: "+91 98200 11223",
    description:
      "Official dual-training apprenticeship partner offering industry-recognized vocational training in vehicle assembly, chassis fabrication, and diagnostic electronics under NAPS.",
  },
  {
    email: "demo.bosch@itiportal.demo",
    workshopName: "[Demo] Bosch Precision Engineering Works",
    industryType: "Industrial Technology & Precision Automotive",
    location: "Bengaluru, Karnataka",
    contactPhone: "+91 98450 12345",
    description:
      "Precision engineering and calibration facility specializing in common-rail diesel injection systems, automated CNC tooling, and sensor diagnostics.",
  },
  {
    email: "demo.bhel@itiportal.demo",
    workshopName: "[Demo] BHEL Power & Ancillary Fabrication",
    industryType: "Heavy Electrical & Power Equipment",
    location: "Hyderabad, Telangana",
    contactPhone: "+91 94400 12345",
    description:
      "Heavy industrial manufacturing unit providing hands-on trade training in high-voltage switchgear, transformer windings, and heavy structural welding.",
  },
  {
    email: "demo.mahindra@itiportal.demo",
    workshopName: "[Demo] Mahindra Heavy Industries Apprentice Division",
    industryType: "Heavy Equipment & Farm Machinery",
    location: "Mumbai, Maharashtra",
    contactPhone: "+91 98190 12345",
    description:
      "Assembly and fabrication facility for farm machinery and utility vehicles featuring accredited NCVT dual-training and trade certification.",
  },
];

// ─── 3. Verified Demo Job Postings ───────────────────────────────────────────
const demoJobs = [
  {
    employerEmail: "demo.tatamotors@itiportal.demo",
    tradeSkillName: "Electrician",
    title: "[Demo] Industrial Electrician Apprentice (NAPS Certified)",
    location: "Pune, Maharashtra",
    jobType: JobType.apprenticeship,
    description:
      "Join the vehicle electrical assembly line. Learn industrial control wiring, harness installation, and PLC-guided automotive diagnostics with monthly NAPS stipend and certification.",
  },
  {
    employerEmail: "demo.tatamotors@itiportal.demo",
    tradeSkillName: "Mechanic",
    title: "[Demo] Heavy Vehicle Motor Mechanic Apprentice",
    location: "Pune, Maharashtra",
    jobType: JobType.apprenticeship,
    description:
      "Hands-on apprenticeship working with commercial powertrain assemblies, engine overhauls, pneumatic braking systems, and digital diagnostic scanners.",
  },
  {
    employerEmail: "demo.bosch@itiportal.demo",
    tradeSkillName: "Machinist",
    title: "[Demo] CNC Machinist & Tool Maker Trainee",
    location: "Bengaluru, Karnataka",
    jobType: JobType.apprenticeship,
    description:
      "Operate multi-axis CNC milling and turning centers. Learn G-code programming, precision tool offsets, and digital micrometer quality inspection standards.",
  },
  {
    employerEmail: "demo.bosch@itiportal.demo",
    tradeSkillName: "Electronics Mechanic",
    title: "[Demo] Electronics Diagnostic & Sensor Technician",
    location: "Bengaluru, Karnataka",
    jobType: JobType.full_time,
    description:
      "Full-time role in ECU calibration and sensor testing laboratory. Read electronic schematics, troubleshoot PCB solder joints, and operate diagnostic oscilloscopes.",
  },
  {
    employerEmail: "demo.bhel@itiportal.demo",
    tradeSkillName: "Welder",
    title: "[Demo] Certified SMAW / TIG Welder Apprentice",
    location: "Hyderabad, Telangana",
    jobType: JobType.apprenticeship,
    description:
      "Structural fabrication and pressure vessel welding apprenticeship using Shielded Metal Arc Welding (SMAW) and TIG processes conforming to ASME standards.",
  },
  {
    employerEmail: "demo.bhel@itiportal.demo",
    tradeSkillName: "Turner",
    title: "[Demo] Precision Lathe Turner Apprentice",
    location: "Hyderabad, Telangana",
    jobType: JobType.apprenticeship,
    description:
      "Precision cylindrical turning, taper turning, and internal threading on heavy industrial lathes for high-voltage turbine couplings.",
  },
  {
    employerEmail: "demo.mahindra@itiportal.demo",
    tradeSkillName: "Fitter",
    title: "[Demo] Mechanical Fitter & Assembly Specialist",
    location: "Mumbai, Maharashtra",
    jobType: JobType.apprenticeship,
    description:
      "Bench fitting, sub-assembly alignment, and hydraulic component installation for agricultural tractors and utility vehicles.",
  },
  {
    employerEmail: "demo.mahindra@itiportal.demo",
    tradeSkillName: "COPA",
    title: "[Demo] Computer Operator & Workshop Data Assistant",
    location: "Mumbai, Maharashtra",
    jobType: JobType.full_time,
    description:
      "Maintain digital inventory logs, job cards, and maintenance scheduling systems using standard database tools and ERP entry interfaces.",
  },
];

async function main() {
  console.log("=================================================");
  console.log("🚀 Starting Safe Production Demo Data Seed...");
  console.log("   (Non-destructive, idempotent, random credentials)");
  console.log("=================================================");

  // 1. Upsert Trade Skills
  console.log("\n📦 Ensuring baseline Trade Skills exist...");
  const skillMap = new Map<string, string>();
  for (const skill of baselineTradeSkills) {
    const record = await prisma.tradeSkill.upsert({
      where: { name: skill.name },
      update: { category: skill.category },
      create: skill,
    });
    skillMap.set(record.name, record.id);
  }
  console.log(`✅ ${skillMap.size} trade skills verified in database.`);

  // 2. Upsert Demo Employers (with randomized, unguessable credentials)
  console.log("\n🏢 Ensuring demo employers exist...");
  const employerProfileMap = new Map<string, string>();

  for (const emp of demoEmployers) {
    // Generate fresh random 32-byte secret hashed with bcrypt (never predictable)
    const randomSecret = crypto.randomBytes(32).toString("hex");
    const passwordHash = await bcrypt.hash(randomSecret, 12);

    const user = await prisma.user.upsert({
      where: { email: emp.email },
      update: {
        role: Role.employer,
        isActive: true,
      },
      create: {
        email: emp.email,
        passwordHash,
        role: Role.employer,
        isActive: true,
      },
    });

    const profile = await prisma.employerProfile.upsert({
      where: { userId: user.id },
      update: {
        workshopName: emp.workshopName,
        industryType: emp.industryType,
        location: emp.location,
        contactPhone: emp.contactPhone,
        description: emp.description,
        verified: true, // Must be verified to appear in public job listings
        verificationStatus: VerifStatus.verified,
      },
      create: {
        userId: user.id,
        workshopName: emp.workshopName,
        industryType: emp.industryType,
        location: emp.location,
        contactPhone: emp.contactPhone,
        description: emp.description,
        verified: true,
        verificationStatus: VerifStatus.verified,
      },
    });

    employerProfileMap.set(emp.email, profile.id);
    console.log(`   ✓ Employer verified: ${emp.workshopName} (${emp.email})`);
  }

  // 3. Upsert Demo Job Postings
  console.log("\n📋 Ensuring active demo job postings exist...");
  let createdCount = 0;
  let updatedCount = 0;

  for (const job of demoJobs) {
    const employerProfileId = employerProfileMap.get(job.employerEmail);
    const tradeSkillId = skillMap.get(job.tradeSkillName);

    if (!employerProfileId || !tradeSkillId) {
      console.warn(`   ⚠️ Skipping job '${job.title}': missing employer profile or skill.`);
      continue;
    }

    const existing = await prisma.jobPosting.findFirst({
      where: {
        employerId: employerProfileId,
        title: job.title,
      },
    });

    if (existing) {
      await prisma.jobPosting.update({
        where: { id: existing.id },
        data: {
          location: job.location,
          description: job.description,
          status: JobStatus.active,
          jobType: job.jobType,
          flaggedFraudulent: false,
          tradeSkillId,
        },
      });
      updatedCount++;
    } else {
      await prisma.jobPosting.create({
        data: {
          employerId: employerProfileId,
          tradeSkillId,
          title: job.title,
          location: job.location,
          description: job.description,
          status: JobStatus.active,
          jobType: job.jobType,
          flaggedFraudulent: false,
        },
      });
      createdCount++;
    }
  }

  console.log(`✅ Demo jobs ready: ${createdCount} created, ${updatedCount} verified active.`);
  console.log("\n✨ Demo data seed completed safely and successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Demo seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
