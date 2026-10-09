import { PrismaClient, Role, JobType, VerifStatus, AppStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const tradeSkills = [
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

async function main() {
  console.log("🌱 Starting realistic demo seed...");

  // ─── 1. Trade Skills ──────────────────────────────────────────────────────
  console.log("🌱 Seeding trade skills...");
  const skillMap = new Map<string, string>();
  for (const skill of tradeSkills) {
    const record = await prisma.tradeSkill.upsert({
      where: { name: skill.name },
      update: { category: skill.category },
      create: skill,
    });
    skillMap.set(skill.name, record.id);
  }
  console.log(`✅ Seeded ${tradeSkills.length} trade skills.`);

  // ─── 2. Admin Account ─────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || "admin@itiportal.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@Portal2026!";
  console.log(`🌱 Seeding admin account (${adminEmail})...`);
  const adminHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminHash,
      role: Role.admin,
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      role: Role.admin,
      isActive: true,
    },
  });
  console.log(`✅ Admin account ready: ${adminEmail}`);

  // ─── 3. Demo Employers ────────────────────────────────────────────────────
  console.log("🌱 Seeding realistic demo employers...");
  const demoPassword = "Demo@Password123";
  const demoPasswordHash = await bcrypt.hash(demoPassword, 10);

  const employersData = [
    {
      email: "tata.motors.demo@example.com",
      workshopName: "Tata Motors Training/Workshop Demo",
      industryType: "Automotive & Commercial Vehicle Manufacturing",
      location: "Pune, Maharashtra",
      contactPhone: "9820011223",
      description:
        "Pioneering commercial and passenger vehicle manufacturer offering hands-on technical apprenticeships in powertrain assembly, chassis fabrication, and diagnostic electronics under NAPS.",
    },
    {
      email: "bosch.service.demo@example.com",
      workshopName: "Bosch Service Demo",
      industryType: "Industrial Technology & Precision Automotive",
      location: "Bengaluru, Karnataka",
      contactPhone: "9845012345",
      description:
        "Leading precision engineering and automotive workshop specializing in common-rail diesel injection systems, ECU calibration, automated CNC tooling, and sensor diagnostics.",
    },
    {
      email: "bhel.ancillary.demo@example.com",
      workshopName: "BHEL Ancillary Demo",
      industryType: "Heavy Electrical & Power Equipment",
      location: "Hyderabad, Telangana",
      contactPhone: "9440012345",
      description:
        "Ancillary manufacturing and maintenance unit for high-voltage transformers, switchgear systems, busbar panels, and industrial turbine rotor alignment.",
    },
    {
      email: "mahindra.industrial.demo@example.com",
      workshopName: "Mahindra Industrial Demo",
      industryType: "Heavy Equipment & Farm Machinery",
      location: "Mumbai, Maharashtra",
      contactPhone: "9819012345",
      description:
        "Assembly and structural fabrication plant for agricultural tractors and utility vehicles with accredited NCVT dual-training and skill certification programs.",
    },
    {
      email: "delhi.workshop.demo@example.com",
      workshopName: "Local Manufacturing Workshop Demo",
      industryType: "Precision Machining & Tool Fabrication",
      location: "Delhi NCR",
      contactPhone: "9811012345",
      description:
        "Modern precision machining hub equipped with CNC turning centers, milling machines, and TIG welding bays serving aerospace, defense, and industrial component supply chains.",
    },
  ];

  const employerMap = new Map<string, string>(); // email -> employerProfile.id

  for (const emp of employersData) {
    const user = await prisma.user.upsert({
      where: { email: emp.email },
      update: {
        passwordHash: demoPasswordHash,
        role: Role.employer,
        isActive: true,
      },
      create: {
        email: emp.email,
        passwordHash: demoPasswordHash,
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
        verified: true,
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

    employerMap.set(emp.email, profile.id);
  }
  console.log(`✅ Seeded ${employersData.length} demo employers.`);

  // ─── 4. Demo Students ─────────────────────────────────────────────────────
  console.log("🌱 Seeding realistic demo students...");
  const studentsData = [
    {
      email: "rahul.sharma.demo@example.com",
      name: "Rahul Sharma",
      itiInstitute: "Government ITI Pusa, New Delhi",
      location: "Delhi NCR",
      phone: "9810123456",
      tradeSkillNames: ["Electrician", "Electronics Mechanic"],
      resumeUrl: "https://res.cloudinary.com/demo/image/upload/v1/sample_resume_rahul_electrician.pdf",
      certTitle: "NCVT National Trade Certificate - Electrician (Grade A)",
    },
    {
      email: "amit.patil.demo@example.com",
      name: "Amit Patil",
      itiInstitute: "Government ITI Aundh, Pune",
      location: "Pune, Maharashtra",
      phone: "9822334455",
      tradeSkillNames: ["Fitter", "Machinist"],
      resumeUrl: "https://res.cloudinary.com/demo/image/upload/v1/sample_resume_amit_fitter.pdf",
      certTitle: "NCVT All India Trade Test (AITT) - Fitter",
    },
    {
      email: "sunil.kumar.demo@example.com",
      name: "Sunil Kumar",
      itiInstitute: "Industrial Training Institute Bengaluru East",
      location: "Bengaluru, Karnataka",
      phone: "9844556677",
      tradeSkillNames: ["Welder", "Turner"],
      resumeUrl: "https://res.cloudinary.com/demo/image/upload/v1/sample_resume_sunil_welder.pdf",
      certTitle: "Welding Excellence Certificate (ASME IX Standards)",
    },
    {
      email: "priya.verma.demo@example.com",
      name: "Priya Verma",
      itiInstitute: "Government ITI Women Hyderabad",
      location: "Hyderabad, Telangana",
      phone: "9849011223",
      tradeSkillNames: ["COPA", "Electronics Mechanic"],
      resumeUrl: "https://res.cloudinary.com/demo/image/upload/v1/sample_resume_priya_copa.pdf",
      certTitle: "National Apprenticeship Certificate (NAC) - COPA",
    },
  ];

  const studentMap = new Map<string, string>(); // email -> studentProfile.id

  for (const stu of studentsData) {
    const user = await prisma.user.upsert({
      where: { email: stu.email },
      update: {
        passwordHash: demoPasswordHash,
        role: Role.student,
        isActive: true,
      },
      create: {
        email: stu.email,
        passwordHash: demoPasswordHash,
        role: Role.student,
        isActive: true,
      },
    });

    const tradeSkillIds = stu.tradeSkillNames
      .map((name) => skillMap.get(name))
      .filter((id): id is string => Boolean(id));

    const profile = await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {
        name: stu.name,
        itiInstitute: stu.itiInstitute,
        location: stu.location,
        phone: stu.phone,
        tradeSkills: tradeSkillIds,
        resumeUrl: stu.resumeUrl,
      },
      create: {
        userId: user.id,
        name: stu.name,
        itiInstitute: stu.itiInstitute,
        location: stu.location,
        phone: stu.phone,
        tradeSkills: tradeSkillIds,
        resumeUrl: stu.resumeUrl,
      },
    });

    studentMap.set(stu.email, profile.id);

    // Seed certification if not already present
    const existingCert = await prisma.certification.findFirst({
      where: { studentId: profile.id, title: stu.certTitle },
    });
    if (!existingCert) {
      await prisma.certification.create({
        data: {
          studentId: profile.id,
          title: stu.certTitle,
          proofUrl: "https://res.cloudinary.com/demo/image/upload/v1/sample_trade_certificate.pdf",
          verificationStatus: VerifStatus.verified,
        },
      });
    }
  }
  console.log(`✅ Seeded ${studentsData.length} demo students with resumes & certifications.`);

  // ─── 5. Demo Job Postings ─────────────────────────────────────────────────
  console.log("🌱 Seeding realistic demo job postings (Apprenticeship & Full-Time)...");

  const jobsData = [
    {
      employerEmail: "tata.motors.demo@example.com",
      title: "Automotive Assembly Apprentice",
      tradeSkillName: "Fitter",
      location: "Pune, Maharashtra",
      jobType: JobType.apprenticeship,
      description:
        "1-year stipendiary apprenticeship under National Apprenticeship Promotion Scheme (NAPS). Selected candidates will undergo structured on-the-job training in passenger vehicle chassis assembly, pneumatic tool handling, precision torque wrench calibration, and line quality inspection under senior master technicians.",
    },
    {
      employerEmail: "tata.motors.demo@example.com",
      title: "Senior CNC Machinist & Tool Setter",
      tradeSkillName: "Machinist",
      location: "Pune, Maharashtra",
      jobType: JobType.full_time,
      description:
        "Full-time permanent position for certified ITI Machinists with 1+ years experience. Responsible for setting up 3-axis and 5-axis CNC vertical machining centers (VMC), tool offset calibration, interpreting GD&T blueprints, and maintaining tight tolerance standards (±0.01mm) on automotive engine blocks.",
    },
    {
      employerEmail: "tata.motors.demo@example.com",
      title: "IT & Office Systems Assistant (COPA)",
      tradeSkillName: "COPA",
      location: "Pune, Maharashtra",
      jobType: JobType.apprenticeship,
      description:
        "1-year apprenticeship for Computer Operator and Programming Assistant (COPA) graduates. Candidates will support the shop-floor production management system, digital inventory logs, barcode scanning systems, and technical maintenance documentation.",
    },
    {
      employerEmail: "bosch.service.demo@example.com",
      title: "Precision Automotive Technician",
      tradeSkillName: "Mechanic",
      location: "Bengaluru, Karnataka",
      jobType: JobType.full_time,
      description:
        "Full-time role in Bosch authorized service facility. Responsibilities include diagnosing common-rail diesel injection systems, ECU fault reading via Bosch KTS scanners, servicing turbochargers, and comprehensive drivetrain electrical diagnostics.",
    },
    {
      employerEmail: "bosch.service.demo@example.com",
      title: "Electronic Hardware & Diagnostic Technician",
      tradeSkillName: "Electronics Mechanic",
      location: "Bengaluru, Karnataka",
      jobType: JobType.full_time,
      description:
        "Permanent bench technician role. Work with surface-mount components (SMD), oscilloscope signal tracing, soldering/desoldering under microscope, and quality verification of electronic control units in an ESD-protected testing lab.",
    },
    {
      employerEmail: "bhel.ancillary.demo@example.com",
      title: "Industrial Electrician - Power & Switchgear",
      tradeSkillName: "Electrician",
      location: "Hyderabad, Telangana",
      jobType: JobType.full_time,
      description:
        "Full-time industrial electrician role. Responsibilities include routine maintenance of 415V/11kV power distribution boards, busbar joints, motor control centers (MCC), variable frequency drives (VFD), and emergency generator synchronization.",
    },
    {
      employerEmail: "bhel.ancillary.demo@example.com",
      title: "Transformer Coil Winding Apprentice",
      tradeSkillName: "Electrician",
      location: "Hyderabad, Telangana",
      jobType: JobType.apprenticeship,
      description:
        "12-month technical apprenticeship for ITI Electrician/Wireman holders. Hands-on learning in automated and manual copper foil winding, paper insulation wrapping, core assembly, and dielectric withstand testing of distribution transformers.",
    },
    {
      employerEmail: "mahindra.industrial.demo@example.com",
      title: "TIG / MIG Fabrication Apprentice",
      tradeSkillName: "Welder",
      location: "Mumbai, Maharashtra",
      jobType: JobType.apprenticeship,
      description:
        "Stipendiary apprenticeship focused on industrial structural welding. Trainees receive extensive coaching on argon gas tungsten arc welding (TIG) and gas metal arc welding (MIG) on heavy tractor chassis and hydraulic tank fixtures. Personal safety gear provided.",
    },
    {
      employerEmail: "mahindra.industrial.demo@example.com",
      title: "Heavy Vehicle Assembly Fitter",
      tradeSkillName: "Fitter",
      location: "Mumbai, Maharashtra",
      jobType: JobType.full_time,
      description:
        "Full-time trade opportunity for skilled Fitters. Work on sub-assembly of agricultural tractor rear axles, planetary reduction gears, hydraulic lift arms, and final brake adjustment. Attractive salary, PF, and medical benefits provided.",
    },
    {
      employerEmail: "mahindra.industrial.demo@example.com",
      title: "Plant Maintenance Electrician",
      tradeSkillName: "Electrician",
      location: "Chennai, Tamil Nadu",
      jobType: JobType.full_time,
      description:
        "Join our modern automotive press shop. Responsible for shift maintenance of 1200-ton hydraulic stamping presses, automated material transfer conveyors, robotic spot welding cells, and industrial air compressors.",
    },
    {
      employerEmail: "delhi.workshop.demo@example.com",
      title: "Precision Lathe & Turning Specialist",
      tradeSkillName: "Turner",
      location: "Delhi NCR",
      jobType: JobType.full_time,
      description:
        "Permanent skilled trades role. Requires proficiency in manual precision lathe operations including metric threading, internal boring, taper turning, and shaft knurling for aerospace components. Must be able to read engineering drawings and micrometers accurately.",
    },
    {
      employerEmail: "delhi.workshop.demo@example.com",
      title: "CNC Turning & Milling Apprentice",
      tradeSkillName: "Turner",
      location: "Delhi NCR",
      jobType: JobType.apprenticeship,
      description:
        "1-year hands-on apprenticeship on 2-axis Fanuc CNC lathes and 3-axis CNC vertical machining centers. Learn G-code program inspection, carbide tool insert replacement, coordinate datum zeroing, and surface finish measurement.",
    },
  ];

  const jobMap = new Map<string, string>(); // title -> jobPosting.id

  for (const job of jobsData) {
    const employerId = employerMap.get(job.employerEmail);
    const tradeSkillId = skillMap.get(job.tradeSkillName);

    if (!employerId || !tradeSkillId) {
      console.warn(`Skipping job "${job.title}" - missing employer or skill.`);
      continue;
    }

    const existing = await prisma.jobPosting.findFirst({
      where: {
        employerId,
        title: job.title,
      },
    });

    if (existing) {
      const updated = await prisma.jobPosting.update({
        where: { id: existing.id },
        data: {
          tradeSkillId,
          location: job.location,
          description: job.description,
          jobType: job.jobType,
          flaggedFraudulent: false,
        },
      });
      jobMap.set(job.title, updated.id);
    } else {
      const created = await prisma.jobPosting.create({
        data: {
          employerId,
          title: job.title,
          tradeSkillId,
          location: job.location,
          description: job.description,
          jobType: job.jobType,
          flaggedFraudulent: false,
        },
      });
      jobMap.set(job.title, created.id);
    }
  }
  console.log(`✅ Seeded ${jobsData.length} demo job postings across Pune, Bengaluru, Hyderabad, Mumbai, Chennai, and Delhi NCR.`);

  // ─── 6. Demo Applications ─────────────────────────────────────────────────
  console.log("🌱 Seeding realistic demo applications and candidate statuses...");

  const applicationsData = [
    {
      studentEmail: "rahul.sharma.demo@example.com",
      jobTitle: "Industrial Electrician - Power & Switchgear",
      status: AppStatus.shortlisted,
    },
    {
      studentEmail: "rahul.sharma.demo@example.com",
      jobTitle: "Automotive Assembly Apprentice",
      status: AppStatus.applied,
    },
    {
      studentEmail: "amit.patil.demo@example.com",
      jobTitle: "Automotive Assembly Apprentice",
      status: AppStatus.viewed,
    },
    {
      studentEmail: "amit.patil.demo@example.com",
      jobTitle: "Heavy Vehicle Assembly Fitter",
      status: AppStatus.shortlisted,
    },
    {
      studentEmail: "sunil.kumar.demo@example.com",
      jobTitle: "TIG / MIG Fabrication Apprentice",
      status: AppStatus.shortlisted,
    },
    {
      studentEmail: "priya.verma.demo@example.com",
      jobTitle: "IT & Office Systems Assistant (COPA)",
      status: AppStatus.applied,
    },
  ];

  for (const app of applicationsData) {
    const studentId = studentMap.get(app.studentEmail);
    const jobId = jobMap.get(app.jobTitle);

    if (!studentId || !jobId) {
      console.warn(`Skipping application for "${app.jobTitle}" - missing student or job.`);
      continue;
    }

    await prisma.application.upsert({
      where: {
        jobId_studentId: {
          jobId,
          studentId,
        },
      },
      update: {
        status: app.status,
      },
      create: {
        jobId,
        studentId,
        status: app.status,
      },
    });
  }
  console.log(`✅ Seeded ${applicationsData.length} demo applications with realistic statuses.`);

  console.log("\n==================================================");
  console.log("DEMO ACCOUNTS READY FOR EVALUATION:");
  console.log("==================================================");
  console.log(`Admin:`);
  console.log(`  Email: ${adminEmail}`);
  console.log(`  Password: ${adminPassword}`);
  console.log(`\nDemo Employers (Password: ${demoPassword}):`);
  for (const emp of employersData) {
    console.log(`  - ${emp.email} (${emp.workshopName})`);
  }
  console.log(`\nDemo Students (Password: ${demoPassword}):`);
  for (const stu of studentsData) {
    console.log(`  - ${stu.email} (${stu.name} - ${stu.itiInstitute})`);
  }
  console.log("==================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
