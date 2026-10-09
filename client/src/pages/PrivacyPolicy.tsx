import { Link } from "react-router-dom";
import LandingNavbar from "../components/LandingNavbar";
import { ShieldCheck, Info, ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
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
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Provisional Project Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight mb-2">
            Privacy Policy
          </h1>
          <p className="text-[#667085] text-sm font-medium">
            Effective &amp; Last Updated: {currentDate}
          </p>
        </div>

        {/* Provisional Project Callout Banner */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3.5 text-amber-900">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <p className="font-semibold mb-1 text-amber-950">Notice of Provisional Project Version</p>
            <p className="text-amber-800">
              This document serves as a provisional privacy policy for the ITI Careers demonstration platform. It accurately summarizes the operational data flows and security safeguards used in this prototype system. This policy may be updated prior to production release and does not constitute formal legal counsel.
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
              ITI Careers is an academic and vocational placement portal built to bridge the gap between skilled ITI (Industrial Training Institute) trainees and hiring technical employers. We are committed to handling your data transparently and safeguarding personal details submitted across student profiles, employer listings, and job applications.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-t border-[#E5EAF2] pt-8">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h2 className="text-xl font-bold">Information Collected</h2>
            </div>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              We collect information that you directly provide when registering and using the platform:
            </p>
            <ul className="list-disc pl-14 space-y-1.5 text-sm sm:text-base text-[#667085]">
              <li><strong className="text-[#172033]">Account Credentials:</strong> Full name, email address, password hash, and designated account role (Student, Employer, or Admin).</li>
              <li><strong className="text-[#172033]">Student &amp; Trainee Profiles:</strong> Contact number, geographical location, trade specializations (e.g., Electrician, Fitter, Welder), education details, and qualification years.</li>
              <li><strong className="text-[#172033]">Employer &amp; Workshop Information:</strong> Workshop/company name, industry designation, facility description, contact details, and location.</li>
              <li><strong className="text-[#172033]">Job &amp; Application Records:</strong> Apprenticeship postings created by employers, student applications, and status markers.</li>
              <li><strong className="text-[#172033]">Communication &amp; Interviews:</strong> Chat messages exchanged between candidates and employers, and scheduled interview records.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-t border-[#E5EAF2] pt-8">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h2 className="text-xl font-bold">How Information Is Used</h2>
            </div>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              The collected information is used solely to provide platform services:
            </p>
            <ul className="list-disc pl-14 space-y-1.5 text-sm sm:text-base text-[#667085]">
              <li>To authenticate your identity and safeguard role-based access across student, employer, and administrative dashboards.</li>
              <li>To match student trade skills with verified apprenticeship and job openings.</li>
              <li>To process, track, and update the status of submitted employment applications.</li>
              <li>To facilitate direct messaging and interview scheduling between trainees and hiring employers.</li>
              <li>To maintain system performance, diagnose errors, and monitor against abusive or fraudulent activity.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-t border-[#E5EAF2] pt-8">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h2 className="text-xl font-bold">Authentication &amp; Account Information</h2>
            </div>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              User accounts are secured with cryptographically salted password hashes (bcrypt) and signed JSON Web Tokens (JWT). When you opt to sign in with Google Sign-In, we receive only your verified email, display name, and unique Google identifier as permitted by OAuth 2.0 standards. We never receive or store your third-party account password.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-t border-[#E5EAF2] pt-8">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                5
              </div>
              <h2 className="text-xl font-bold">Profile, Job &amp; Application Information</h2>
            </div>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              When a trainee submits an application for an apprenticeship, relevant profile details (trade skills, certifications, location, and resume documents) become accessible to the specific employer hosting that opening. Employers agree to use candidate information exclusively for evaluating apprenticeship candidates.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 border-t border-[#E5EAF2] pt-8">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                6
              </div>
              <h2 className="text-xl font-bold">Uploaded Resumes &amp; Trade Certifications</h2>
            </div>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              Candidates can upload trade verification documents (such as NCVT / SCVT certificates) and PDF resumes. Files are stored with sanitized names in secure storage and are only accessible through authenticated endpoints to participating employers reviewing your applications.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 border-t border-[#E5EAF2] pt-8">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                7
              </div>
              <h2 className="text-xl font-bold">Cookies &amp; Local Storage</h2>
            </div>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              ITI Careers uses browser local storage exclusively for essential functional purposes:
            </p>
            <ul className="list-disc pl-14 space-y-1.5 text-sm sm:text-base text-[#667085]">
              <li>Maintaining authenticated session tokens to keep you logged in across page refreshes.</li>
              <li>Storing non-sensitive UI preferences (such as light or dark theme selections).</li>
            </ul>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              We do not utilize third-party tracking pixels, behavioural profiling tools, or marketing cookies.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 border-t border-[#E5EAF2] pt-8">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                8
              </div>
              <h2 className="text-xl font-bold">Data Security Overview</h2>
            </div>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              We employ strict industry-standard technical controls, including encrypted HTTPS transport, parameterized database queries, token validation middleware, and strict role-based access checks across all endpoints. While no platform can guarantee absolute immunity from digital threats, our architecture enforces best practices to protect your information.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3 border-t border-[#E5EAF2] pt-8">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                9
              </div>
              <h2 className="text-xl font-bold">User Rights &amp; Basic Controls</h2>
            </div>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              You maintain direct control over your submitted personal information:
            </p>
            <ul className="list-disc pl-14 space-y-1.5 text-sm sm:text-base text-[#667085]">
              <li><strong className="text-[#172033]">Edit &amp; Update:</strong> You may edit your profile details, contact information, and skills at any time from your dashboard.</li>
              <li><strong className="text-[#172033]">File Management:</strong> You may delete or replace uploaded certificates and resumes.</li>
              <li><strong className="text-[#172033]">Withdraw Applications:</strong> Candidates can withdraw active job applications before final hiring decisions.</li>
              <li><strong className="text-[#172033]">Account Inquiries:</strong> You can contact project administrators to request account updates or record reviews.</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section className="space-y-3 border-t border-[#E5EAF2] pt-8">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                10
              </div>
              <h2 className="text-xl font-bold">Contact Information</h2>
            </div>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              If you have questions, feedback, or concerns regarding your privacy or data handling on this platform, please reach out to the project coordinator:
            </p>
            <div className="ml-10 p-4 rounded-xl bg-[#F8FBFF] border border-[#E5EAF2] text-sm text-[#172033] space-y-1">
              <p><strong className="text-[#667085]">Project Lead:</strong> Yash Raool</p>
              <p><strong className="text-[#667085]">Email:</strong> yashhraool9@gmail.com</p>
              <p><strong className="text-[#667085]">Phone:</strong> +91 8010430122</p>
              <p><strong className="text-[#667085]">Location:</strong> Yavatmal, Maharashtra, India</p>
            </div>
          </section>

          {/* Section 11 */}
          <section className="space-y-3 border-t border-[#E5EAF2] pt-8">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                11
              </div>
              <h2 className="text-xl font-bold">Policy Updates &amp; Future Changes</h2>
            </div>
            <p className="text-[#667085] text-sm sm:text-base leading-relaxed pl-10">
              As ITI Careers progresses from demonstration and academic evaluation toward production deployment, this privacy policy will be reviewed, refined, and updated to reflect evolving platform operations and regulatory requirements. We encourage users to consult this page periodically.
            </p>
          </section>

          {/* End Callout */}
          <div className="pt-6 border-t border-[#E5EAF2]">
            <p className="text-xs text-[#98A2B3] text-center">
              Provisional Project Policy — ITI Careers Prototype. Designed for demonstration and academic evaluation.
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
            <Link to="/privacy-policy" className="text-[#2563EB] font-semibold">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-[#172033] transition-colors">Terms of Service</Link>
          </div>
          <div>
            © {new Date().getFullYear()} ITI Careers. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
