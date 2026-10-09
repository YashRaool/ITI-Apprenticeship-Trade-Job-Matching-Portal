import { Link } from "react-router-dom";
import LandingNavbar from "../components/LandingNavbar";
import { FileCheck, Info, ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#F8FBFF] text-[#172033] font-sans selection:bg-[#2563EB]/20 flex flex-col justify-between">
      <LandingNavbar />

      <main className="pt-28 pb-20 max-w-4xl mx-auto px-6 w-full flex-1">
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#667085] hover:text-[#2563EB] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-semibold mb-3">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Provisional Project Terms</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight mb-2">
            Terms of Service
          </h1>
          <p className="text-[#667085] text-sm font-medium">
            Effective &amp; Last Updated: {currentDate}
          </p>
        </div>

        {/* Provisional Project Callout Banner */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3.5 text-amber-900">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <p className="font-semibold mb-1 text-amber-950">Provisional Project Agreement Notice</p>
            <p className="text-amber-800">
              These terms of service govern your participation in the ITI Careers demonstration portal. They reflect the current prototype implementation developed for academic, educational, and testing purposes. These terms will be updated prior to production release and do not constitute formal legal counsel.
            </p>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E5EAF2] shadow-xs space-y-10">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h2 className="text-xl font-bold">Introduction</h2>
            </div>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              Welcome to ITI Careers. By creating an account, browsing listings, or using any feature of our portal, you agree to comply with and be bound by these provisional Terms of Service. If you do not agree with any part of these terms, please refrain from using the platform.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-t border-[#E5EAF2] pt-8">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h2 className="text-xl font-bold">Eligibility</h2>
            </div>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              The platform is designed specifically for:
            </p>
            <ul className="list-disc pl-14 space-y-1.5 text-sm sm:text-base text-[#667085]">
              <li><strong className="text-[#172033]">Students &amp; Trainees:</strong> Individuals pursuing or holding vocational trade qualifications (e.g., ITI, NCVT, SCVT) seeking apprenticeships or technical employment.</li>
              <li><strong className="text-[#172033]">Employers:</strong> Authorized representatives of registered industrial plants, manufacturing units, automotive workshops, or contracting enterprises seeking skilled technical personnel.</li>
              <li><strong className="text-[#172033]">Age Requirement:</strong> Users must be at least 18 years of age (or the legal age of apprenticeship eligibility under applicable labor regulations).</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-t border-[#E5EAF2] pt-8">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h2 className="text-xl font-bold">Account Responsibilities</h2>
            </div>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              You are responsible for maintaining the confidentiality of your credentials and token sessions. You agree to immediately notify the project administration if you suspect unauthorized access to your account. All activities conducted under your credentials remain your responsibility.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-t border-[#E5EAF2] pt-8">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h2 className="text-xl font-bold">Student &amp; Trainee Responsibilities</h2>
            </div>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              Students and trainees using the portal agree to:
            </p>
            <ul className="list-disc pl-14 space-y-1.5 text-sm sm:text-base text-[#667085]">
              <li>Provide truthful and accurate information regarding trade qualifications, certifications, grades, and experience.</li>
              <li>Upload only genuine, non-tampered certification documents and resumes.</li>
              <li>Attend confirmed interviews punctually or provide timely cancellation notices through the platform.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-t border-[#E5EAF2] pt-8">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                5
              </div>
              <h2 className="text-xl font-bold">Employer Responsibilities</h2>
            </div>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              Employers posting opportunities on the portal agree to:
            </p>
            <ul className="list-disc pl-14 space-y-1.5 text-sm sm:text-base text-[#667085]">
              <li>Post only bona fide, active apprenticeship and job openings with clear trade specifications and fair compensation details.</li>
              <li>Evaluate applicants without discrimination based on caste, gender, religion, or community.</li>
              <li>Use candidate contact details, resumes, and certification files strictly for the evaluation of employment opportunities.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 border-t border-[#E5EAF2] pt-8">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                6
              </div>
              <h2 className="text-xl font-bold">Job &amp; Application Information</h2>
            </div>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              Job descriptions, salary figures, and workshop profiles are submitted directly by users. While ITI Careers provides administrative moderation capabilities, we do not independently verify external physical facilities or guarantee the fulfillment of terms stated in job postings.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 border-t border-[#E5EAF2] pt-8">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                7
              </div>
              <h2 className="text-xl font-bold">Acceptable Use</h2>
            </div>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              Users must conduct all interactions with professionalism. Communication within the messaging features and interview scheduling system must remain directly relevant to vocational placement, technical interviews, and apprenticeship onboarding.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 border-t border-[#E5EAF2] pt-8">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                8
              </div>
              <h2 className="text-xl font-bold">Prohibited Activities</h2>
            </div>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              The following actions are strictly prohibited and will result in immediate account termination:
            </p>
            <ul className="list-disc pl-14 space-y-1.5 text-sm sm:text-base text-[#667085]">
              <li>Submitting fraudulent certifications, deceptive workshop listings, or impersonating another person or company.</li>
              <li>Posting jobs requiring illicit upfront fees, unverified financial deposits, or unlawful labor practices.</li>
              <li>Automated scraping, crawling, or vulnerability testing without express written permission.</li>
              <li>Harassment, abusive messaging, or distribution of malicious files through platform uploads.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section className="space-y-3 border-t border-[#E5EAF2] pt-8">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                9
              </div>
              <h2 className="text-xl font-bold">Platform &amp; Content Usage</h2>
            </div>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              The ITI Careers codebase, user interface designs, logo marks, and documentation are proprietary project assets. You retain ownership of your user-generated profile information and documents, granting ITI Careers a limited license to store, process, and display your submissions for recruitment workflows.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3 border-t border-[#E5EAF2] pt-8">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                10
              </div>
              <h2 className="text-xl font-bold">Account Suspension &amp; Termination</h2>
            </div>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              Project administrators reserve the right to temporarily suspend or permanently terminate any account that violates these terms, submits false credentials, or behaves inappropriately toward other platform members.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-3 border-t border-[#E5EAF2] pt-8">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                11
              </div>
              <h2 className="text-xl font-bold">Limitation of Liability &amp; Disclaimers</h2>
            </div>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              ITI Careers is provided on an &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; basis for academic and evaluation purposes. The platform makes no guarantees of job placement, candidate hiring, uninterrupted uptime, or employment longevity. The project team and affiliated developers shall not be liable for any indirect, incidental, or consequential damages resulting from portal use.
            </p>
          </section>

          {/* Section 12 */}
          <section className="space-y-3 border-t border-[#E5EAF2] pt-8">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                12
              </div>
              <h2 className="text-xl font-bold">Changes to Terms</h2>
            </div>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              We reserve the right to revise these provisional terms as project requirements and operational guidelines evolve. Continued use of the portal after any update represents acceptance of the amended terms.
            </p>
          </section>

          {/* Section 13 */}
          <section className="space-y-3 border-t border-[#E5EAF2] pt-8">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                13
              </div>
              <h2 className="text-xl font-bold">Contact Information</h2>
            </div>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              For any questions regarding these terms, feedback, or administrative support, please contact the project team:
            </p>
            <div className="ml-10 p-4 rounded-xl bg-[#F8FBFF] border border-[#E5EAF2] text-sm text-[#172033] space-y-1">
              <p><strong className="text-[#667085]">Project Lead:</strong> Yash Raool</p>
              <p><strong className="text-[#667085]">Email:</strong> yashhraool9@gmail.com</p>
              <p><strong className="text-[#667085]">Phone:</strong> +91 8010430122</p>
              <p><strong className="text-[#667085]">Location:</strong> Yavatmal, Maharashtra, India</p>
            </div>
          </section>

          {/* End Callout */}
          <div className="pt-6 border-t border-[#E5EAF2]">
            <p className="text-xs text-[#98A2B3] text-center">
              Provisional Project Terms — ITI Careers Prototype. Designed for demonstration and academic evaluation.
            </p>
          </div>
          
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5EAF2] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#667085]">
          <div className="font-extrabold text-[#172033]">
            ITI<span className="text-[#2563EB]">Careers</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 font-medium">
            <Link to="/" className="hover:text-[#172033] transition-colors">Home</Link>
            <Link to="/#about" className="hover:text-[#172033] transition-colors">About Us</Link>
            <Link to="/#contact" className="hover:text-[#172033] transition-colors">Contact Us</Link>
            <Link to="/privacy-policy" className="hover:text-[#172033] transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-[#2563EB] font-semibold">Terms of Service</Link>
          </div>
          <div>
            © {new Date().getFullYear()} ITI Careers. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
