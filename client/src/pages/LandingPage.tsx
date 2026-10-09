import { useRef, useState, useEffect } from "react";
import LandingNavbar from "../components/LandingNavbar";
import Hero3DBackground from "../components/Hero3DBackground";
import { useNavigate, Link } from "react-router-dom";
import { Wrench, Zap, Factory, Cog, CheckCircle, Search, FileText, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { motion, useScroll, useTransform, useReducedMotion, type Variants } from "framer-motion";

const OFFICE_LOCATION = "Yavatmal, Maharashtra, India";
const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/gdiQapoTckLoNYu88";
const GOOGLE_MAPS_EMBED_URL = "https://maps.google.com/maps?q=20.4082308,78.1355702+(Yavatmal)&hl=en&z=14&output=embed";

export default function LandingPage() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const [aboutStickyTop, setAboutStickyTop] = useState(0);

  useEffect(() => {
    const updateSticky = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        setAboutStickyTop(0);
      } else if (aboutRef.current) {
        const vh = window.innerHeight;
        const ah = aboutRef.current.offsetHeight;
        setAboutStickyTop(Math.min(0, vh - ah));
      }
    };
    updateSticky();
    window.addEventListener("resize", updateSticky);
    return () => window.removeEventListener("resize", updateSticky);
  }, []);

  useEffect(() => {
    if (!isDesktop && aboutRef.current) {
      const observer = new ResizeObserver(() => {
        if (aboutRef.current) {
          const vh = window.innerHeight;
          const ah = aboutRef.current.offsetHeight;
          setAboutStickyTop(Math.min(0, vh - ah));
        }
      });
      observer.observe(aboutRef.current);
      return () => observer.disconnect();
    }
  }, [isDesktop]);

  const aboutRef = useRef<HTMLElement>(null);
  const opportunitiesRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);

  // Native scroll tracking
  const { scrollY } = useScroll();

  // Hero scene receding transforms (responsive scroll ranges for desktop & mobile)
  const heroScaleRange = isDesktop ? 700 : 380;
  const heroOpacityRange = isDesktop ? 600 : 300;
  const heroScale = useTransform(scrollY, [0, heroScaleRange], [1, shouldReduceMotion ? 1 : 0.94]);
  const heroOpacity = useTransform(scrollY, [0, heroOpacityRange], [1, shouldReduceMotion ? 1 : 0.4]);

  // Scene 2 exit receding transform (mobile layered depth as Scene 3 approaches)
  const { scrollYProgress: oppProgress } = useScroll({
    target: opportunitiesRef,
    offset: ["end end", "end start"],
  });
  const oppScale = useTransform(oppProgress, [0, 0.75], [1, shouldReduceMotion || isDesktop ? 1 : 0.97]);
  const oppOpacity = useTransform(oppProgress, [0, 0.55], [1, shouldReduceMotion || isDesktop ? 1 : 0.8]);

  // Scene 3 exit receding transform (mobile layered depth as Scene 4 approaches)
  const { scrollYProgress: howItWorksProgress } = useScroll({
    target: howItWorksRef,
    offset: ["end end", "end start"],
  });
  const howItWorksScale = useTransform(howItWorksProgress, [0, 0.75], [1, shouldReduceMotion || isDesktop ? 1 : 0.97]);
  const howItWorksOpacity = useTransform(howItWorksProgress, [0, 0.55], [1, shouldReduceMotion || isDesktop ? 1 : 0.8]);

  // About Us scene receding transforms
  const { scrollYProgress: aboutProgress } = useScroll({
    target: aboutRef,
    offset: isDesktop ? ["start start", "end start"] : ["end end", "end start"],
  });
  const aboutScale = useTransform(aboutProgress, [0, 0.7], [1, shouldReduceMotion ? 1 : 0.94]);
  const aboutOpacity = useTransform(aboutProgress, [0, 0.5], [1, shouldReduceMotion ? 1 : 0.45]);

  // Subtle staggered entrance variants for Hero
  const heroContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const heroItemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.45,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  // Section scroll reveal configuration
  const sectionFadeVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.4,
        ease: "easeOut",
      },
    },
  };

  const sceneStaggerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const sceneChildVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.45,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <div className="relative min-h-screen bg-[#F8FBFF] text-[#172033] font-sans selection:bg-[#2563EB]/20">
      <LandingNavbar />

      {/* ── Scene 1: Home / Hero (Sticky Scene) ────────────────── */}
      <main className="sticky top-0 h-[100dvh] min-h-[100dvh] lg:h-screen w-full flex items-center pt-20 z-10 bg-[#F8FBFF] bg-[radial-gradient(ellipse_at_72%_48%,rgba(0,180,255,0.16),rgba(0,80,255,0.04)_45%,transparent_70%)] overflow-hidden relative">
        <motion.div 
          style={{ 
            scale: !shouldReduceMotion ? heroScale : 1, 
            opacity: !shouldReduceMotion ? heroOpacity : 1 
          }}
          className="w-full h-full origin-center relative flex items-center"
        >
          {/* Hero-Level 3D WebGL Canvas Layer: Covers the Hero naturally without a box constraint */}
          <Hero3DBackground />

          <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 pointer-events-none">

            {/* Left Column: Text & Buttons */}
            <motion.div 
              variants={heroContainerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col space-y-6 pointer-events-auto"
            >
              <motion.div 
                variants={heroItemVariants}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5EAF2] text-[#2563EB] w-fit text-sm font-semibold shadow-sm"
              >
                ITI Careers
              </motion.div>

              <motion.h1 
                variants={heroItemVariants}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-[#172033]"
              >
                Build your skilled career with confidence.
              </motion.h1>

              <motion.p 
                variants={heroItemVariants}
                className="text-lg text-[#667085] leading-relaxed max-w-lg"
              >
                Discover verified apprenticeship opportunities, showcase your trade skills, and take the next step with employers who are hiring.
              </motion.p>

              <motion.div 
                variants={heroItemVariants}
                className="flex flex-col sm:flex-row items-center gap-4 pt-4"
              >
                <motion.button
                  onClick={() => navigate('/jobs')}
                  whileHover={shouldReduceMotion ? {} : { y: -2, scale: 1.015 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.98, y: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#2563EB] text-white font-semibold rounded-xl hover:bg-[#1D4ED8] transition-colors shadow-sm hover:shadow-md cursor-pointer"
                >
                  Find Apprenticeships
                </motion.button>
                <motion.button
                  onClick={() => navigate('/?auth=register&role=employer')}
                  whileHover={shouldReduceMotion ? {} : { y: -2, scale: 1.015 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.98, y: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#172033] font-semibold rounded-xl border border-[#E5EAF2] hover:bg-slate-50 transition-colors shadow-sm hover:shadow-md cursor-pointer"
                >
                  For Employers
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Right Column: Spatial layout anchor for Hero 2-column grid */}
            <div id="hero-cube-anchor" className="hidden lg:block h-[600px] w-full pointer-events-none" />
          </div>
        </motion.div>
      </main>

      {/* Scene 1 Dwell Spacer: allows Hero to remain pinned momentarily before Scene 2 rises and overlaps */}
      <div className="h-[25vh] sm:h-[30vh] lg:h-[35vh] pointer-events-none" />

      {/* ── Scene 2: Discovery & Opportunities Layer ─────────────── */}
      <div 
        ref={opportunitiesRef}
        className="relative z-20 bg-white rounded-t-[32px] sm:rounded-t-[48px] shadow-[0_-25px_60px_rgba(15,23,42,0.18)] border-t border-[#E5EAF2]"
      >
        <motion.div
          style={{
            scale: !isDesktop && !shouldReduceMotion ? oppScale : 1,
            opacity: !isDesktop && !shouldReduceMotion ? oppOpacity : 1,
          }}
          className="w-full origin-bottom"
        >
          {/* Features / Search Section */}
          <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
          {/* Search Bar */}
          <motion.div 
            variants={sectionFadeVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="max-w-4xl mx-auto mb-16"
          >
            <div className="bg-white p-2 rounded-2xl shadow-md border border-[#E5EAF2] flex flex-col md:flex-row gap-2 transition-shadow hover:shadow-lg">
              <div className="flex-1 flex items-center px-4 bg-gray-50 rounded-xl border border-transparent focus-within:bg-white focus-within:border-[#2563EB]/40 focus-within:ring-2 focus-within:ring-[#2563EB]/10 transition-all">
                <Search className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter skills / designations"
                  className="w-full bg-transparent border-none focus:outline-none py-3 text-[#172033]"
                />
              </div>
              <div className="flex-1 flex items-center px-4 bg-gray-50 rounded-xl border border-transparent focus-within:bg-white focus-within:border-[#2563EB]/40 focus-within:ring-2 focus-within:ring-[#2563EB]/10 transition-all">
                <svg className="w-5 h-5 text-gray-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <input
                  type="text"
                  placeholder="Enter location"
                  className="w-full bg-transparent border-none focus:outline-none py-3 text-[#172033]"
                />
              </div>
              <motion.button 
                whileHover={shouldReduceMotion ? {} : { y: -1, scale: 1.015 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-sm hover:shadow-md whitespace-nowrap cursor-pointer"
              >
                Search
              </motion.button>
            </div>
          </motion.div>

          {/* Featured Opportunities */}
          <motion.div
            variants={sectionFadeVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            <h2 className="text-2xl font-bold text-[#172033] mb-8 text-center">Discover active opportunities</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                { title: 'Backend Developer', company: 'Tech Innovators', location: 'Remote' },
                { title: 'Electrical Fitter', company: 'Apex Industries', location: 'Mumbai' },
                { title: 'CNC Machinist', company: 'Precision Eng', location: 'Pune' },
                { title: 'Service Technician', company: 'Global Solutions', location: 'Delhi' }
              ].map((job, i) => (
                <motion.div 
                  key={i} 
                  whileHover={shouldReduceMotion ? {} : { y: -3 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="bg-white border border-[#E5EAF2] hover:border-[#2563EB]/40 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col group cursor-pointer" 
                  onClick={() => navigate('/jobs')}
                >
                  <h3 className="font-bold text-[#172033] text-lg mb-1 group-hover:text-[#2563EB] transition-colors">{job.title}</h3>
                  <p className="text-[#667085] text-sm mb-4">{job.company} • {job.location}</p>
                  <div className="mt-auto pt-4 border-t border-[#E5EAF2]">
                    <span className="text-[#2563EB] font-semibold text-sm flex items-center justify-between">
                      View Details
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Explore opportunities by trade */}
      <section className="py-20 bg-white border-y border-[#E5EAF2]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            variants={sectionFadeVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4"
          >
            <div>
              <h2 className="text-3xl font-bold text-[#172033] mb-3">Explore opportunities by trade</h2>
              <p className="text-[#667085] max-w-2xl">Find your next role in specialized technical fields with top industry employers.</p>
            </div>
            <button onClick={() => navigate('/jobs')} className="text-[#2563EB] font-semibold hover:text-[#1D4ED8] flex items-center gap-2 group cursor-pointer">
              View all opportunities
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </motion.div>

          <motion.div 
            variants={sectionFadeVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
          >
            {[
              { title: "Electrician", icon: <Zap className="w-6 h-6 text-[#2563EB]" /> },
              { title: "Fitter", icon: <Wrench className="w-6 h-6 text-[#2563EB]" /> },
              { title: "Welder", icon: <Factory className="w-6 h-6 text-[#2563EB]" /> },
              { title: "Machinist", icon: <Cog className="w-6 h-6 text-[#2563EB]" /> },
              { title: "Technician", icon: <CheckCircle className="w-6 h-6 text-[#2563EB]" /> }
            ].map((trade, i) => (
              <motion.div 
                key={i} 
                whileHover={shouldReduceMotion ? {} : { y: -3 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={() => navigate('/jobs')} 
                className="bg-white border border-[#E5EAF2] hover:border-[#2563EB]/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-[#F8FBFF] rounded-xl flex items-center justify-center">
                  {trade.icon}
                </div>
                <span className="font-semibold text-[#172033]">{trade.title}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
        </motion.div>
      </div>

      {/* ── Scene 3: How ITI Careers Works Layered Scene ─────────── */}
      <section 
        ref={howItWorksRef}
        className="relative z-[25] lg:z-20 bg-[#F8FBFF] rounded-t-[32px] sm:rounded-t-[48px] lg:rounded-t-none shadow-[0_-25px_60px_rgba(15,23,42,0.16)] lg:shadow-none border-t border-[#E5EAF2] py-16 sm:py-20 lg:py-20 -mt-6 lg:mt-0"
      >
        <motion.div
          style={{
            scale: !isDesktop && !shouldReduceMotion ? howItWorksScale : 1,
            opacity: !isDesktop && !shouldReduceMotion ? howItWorksOpacity : 1,
          }}
          className="w-full origin-bottom"
        >
          <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            variants={sectionFadeVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-[#172033] mb-4">How ITI Careers works</h2>
            <p className="text-[#667085] max-w-2xl mx-auto">A seamless experience connecting skilled talent with the right opportunities.</p>
          </motion.div>

          <motion.div 
            variants={sectionFadeVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="relative"
          >
            {/* Desktop Animated Connector Path */}
            <div className="hidden md:block absolute top-12 left-[16.6%] right-[16.6%] h-1 bg-[#E2E8F0] rounded-full z-0 overflow-hidden pointer-events-none">
              <motion.div
                className="h-full bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#2563EB] rounded-full"
                initial={false}
                animate={{
                  width: activeStep === 1 ? "25%" : activeStep === 2 ? "65%" : "100%",
                }}
                transition={{
                  duration: shouldReduceMotion ? 0.01 : 0.45,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              />
            </div>

            {/* Desktop Grid Layout */}
            <div className="hidden md:grid md:grid-cols-3 gap-8 relative z-10">
              {[
                {
                  id: 1,
                  title: "Create your profile",
                  desc: "Sign up and showcase your certifications, skills, and past experience.",
                  icon: FileText,
                },
                {
                  id: 2,
                  title: "Find relevant opportunities",
                  desc: "Browse verified apprenticeships and jobs matched to your trade.",
                  icon: Search,
                },
                {
                  id: 3,
                  title: "Apply and track progress",
                  desc: "Submit applications directly and keep track of your employer responses.",
                  icon: CheckCircle,
                },
              ].map((step) => {
                const IconComponent = step.icon;
                const isActive = activeStep === step.id;
                const isPassed = activeStep > step.id;
                return (
                  <motion.div
                    key={step.id}
                    onMouseEnter={() => setActiveStep(step.id)}
                    onFocus={() => setActiveStep(step.id)}
                    onClick={() => setActiveStep(step.id)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Step ${step.id}: ${step.title}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveStep(step.id);
                      }
                    }}
                    whileHover={shouldReduceMotion ? {} : { y: -3 }}
                    transition={{ duration: 0.2 }}
                    className={`flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-200 cursor-pointer outline-none ${
                      isActive
                        ? "bg-white border border-[#2563EB]/40 shadow-md ring-2 ring-[#2563EB]/10"
                        : "bg-white/60 hover:bg-white border border-[#E5EAF2] hover:border-[#2563EB]/25 shadow-xs"
                    }`}
                  >
                    <div className="w-16 h-16 bg-white border border-[#E5EAF2] rounded-2xl flex items-center justify-center shadow-sm mb-6 relative">
                      <IconComponent className={`w-8 h-8 transition-colors ${isActive ? "text-[#2563EB]" : "text-[#475569]"}`} />
                      <span
                        className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-[#F8FBFF] transition-all duration-300 ${
                          isActive || isPassed
                            ? "bg-[#2563EB] text-white shadow-sm shadow-[#2563EB]/30 scale-105"
                            : "bg-[#172033] text-white"
                        }`}
                      >
                        {step.id}
                      </span>
                    </div>
                    <h3 className={`text-xl font-bold mb-2 transition-colors ${isActive ? "text-[#172033]" : "text-[#334155]"}`}>
                      {step.title}
                    </h3>
                    <p className="text-[#667085] text-sm leading-relaxed">{step.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Mobile Vertical Progression Layout */}
            <div className="md:hidden flex flex-col space-y-3">
              {[
                {
                  id: 1,
                  title: "Create your profile",
                  desc: "Sign up and showcase your certifications, skills, and past experience.",
                  icon: FileText,
                },
                {
                  id: 2,
                  title: "Find relevant opportunities",
                  desc: "Browse verified apprenticeships and jobs matched to your trade.",
                  icon: Search,
                },
                {
                  id: 3,
                  title: "Apply and track progress",
                  desc: "Submit applications directly and keep track of your employer responses.",
                  icon: CheckCircle,
                },
              ].map((step, idx) => {
                const IconComponent = step.icon;
                const isActive = activeStep === step.id;
                const isPassed = activeStep > step.id;
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <motion.div
                      onClick={() => setActiveStep(step.id)}
                      onFocus={() => setActiveStep(step.id)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Step ${step.id}: ${step.title}`}
                      className={`w-full flex items-start gap-4 p-5 rounded-2xl transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-white border border-[#2563EB]/40 shadow-md ring-2 ring-[#2563EB]/10"
                          : "bg-white/70 border border-[#E5EAF2] shadow-xs"
                      }`}
                    >
                      <div className="w-12 h-12 bg-white border border-[#E5EAF2] rounded-xl flex items-center justify-center shrink-0 shadow-xs relative mt-0.5">
                        <IconComponent className={`w-6 h-6 ${isActive ? "text-[#2563EB]" : "text-[#475569]"}`} />
                        <span
                          className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border-2 border-white ${
                            isActive || isPassed ? "bg-[#2563EB] text-white" : "bg-[#172033] text-white"
                          }`}
                        >
                          {step.id}
                        </span>
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <h3 className={`text-base font-bold mb-1 ${isActive ? "text-[#172033]" : "text-[#334155]"}`}>
                          {step.title}
                        </h3>
                        <p className="text-xs text-[#667085] leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>

                    {/* Vertical Connector Line between steps on mobile */}
                    {idx < 2 && (
                      <div className="py-1 flex justify-center items-center">
                        <div className="w-0.5 h-6 bg-[#E2E8F0] rounded-full overflow-hidden relative">
                          <motion.div
                            className="w-full bg-[#2563EB] rounded-full"
                            initial={false}
                            animate={{
                              height: activeStep > step.id ? "100%" : activeStep === step.id ? "40%" : "0%",
                            }}
                            transition={{ duration: shouldReduceMotion ? 0.01 : 0.35, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
        </motion.div>
      </section>

      {/* ── Scene 4: About Us Layered Scene ──────────────────────── */}
      <div id="about" className="relative -top-20 pointer-events-none" />
      <section 
        ref={aboutRef}
        style={{ top: isDesktop ? undefined : `${aboutStickyTop}px` }}
        className="sticky top-0 lg:top-0 min-h-[90vh] lg:min-h-screen lg:h-screen flex items-center bg-[#F8FBFF] rounded-t-[32px] sm:rounded-t-[48px] shadow-[0_-30px_70px_rgba(15,23,42,0.18)] border-t border-[#E5EAF2] scroll-mt-20 py-16 sm:py-20 lg:py-0 overflow-hidden z-30 -mt-6 lg:mt-0"
      >
        <motion.div
          style={{ 
            scale: !shouldReduceMotion ? aboutScale : 1, 
            opacity: !shouldReduceMotion ? aboutOpacity : 1 
          }}
          className="w-full origin-center"
        >
          <motion.div 
            variants={sceneStaggerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <motion.h2 variants={sceneChildVariants} className="text-3xl md:text-4xl font-bold text-[#172033] leading-tight mb-6">
                Built for skilled careers.
              </motion.h2>
              <motion.p variants={sceneChildVariants} className="text-[#667085] text-lg mb-8 leading-relaxed">
                ITI Careers helps ITI trainees discover relevant apprenticeship opportunities and helps employers connect with candidates who have practical trade skills.
              </motion.p>
              <motion.div variants={sceneChildVariants} className="space-y-5">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 shrink-0 bg-white shadow-sm border border-[#E5EAF2] rounded-lg flex items-center justify-center text-[#2563EB]">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#172033]">Trade-focused opportunities</h4>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 shrink-0 bg-white shadow-sm border border-[#E5EAF2] rounded-lg flex items-center justify-center text-[#2563EB]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#172033]">Simple application tracking</h4>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 shrink-0 bg-white shadow-sm border border-[#E5EAF2] rounded-lg flex items-center justify-center text-[#2563EB]">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#172033]">Employer and trainee access</h4>
                  </div>
                </div>
              </motion.div>
            </div>
            <motion.div 
              variants={sceneChildVariants}
              className="bg-white border border-[#E5EAF2] rounded-3xl p-8 lg:p-12 text-center shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-2xl font-bold text-[#172033] mb-4">Ready to take the next step?</h3>
              <p className="text-[#667085] mb-8">Join the ITI Careers community today and connect with employers looking for your exact skills.</p>
              <motion.button
                onClick={() => navigate('/?auth=register')}
                whileHover={shouldReduceMotion ? {} : { y: -2, scale: 1.015 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98, y: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="px-8 py-3.5 bg-[#2563EB] text-white font-semibold rounded-xl hover:bg-[#1D4ED8] transition-colors w-full sm:w-auto shadow-sm hover:shadow-md cursor-pointer"
              >
                Create your account
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Scene 4 Dwell Spacer: allows About Us to remain stationary before Contact Us rises */}
      <div className="h-[25vh] sm:h-[30vh] lg:h-[35vh] pointer-events-none" />

      {/* ── Scene 5: Contact Us Layered Scene ────────────────────── */}
      <div id="contact" className="relative -top-20 pointer-events-none" />
      <section 
        className="relative z-40 bg-white rounded-t-[32px] sm:rounded-t-[48px] shadow-[0_-30px_70px_rgba(15,23,42,0.22)] border-t border-[#E5EAF2] min-h-[90vh] lg:min-h-screen flex items-center scroll-mt-20 py-16 sm:py-20 lg:py-24 overflow-hidden -mt-6 lg:mt-0"
      >
        <motion.div 
          variants={sceneStaggerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="max-w-7xl mx-auto px-6 w-full"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left Column: Contact Info */}
            <motion.div 
              variants={sceneChildVariants}
              className="flex flex-col justify-center lg:pt-4"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#172033] mb-4">Get in touch with us</h2>
              <p className="text-[#667085] text-lg mb-8 leading-relaxed max-w-md">
                Whether you have a question about opportunities, employer access, or anything else, our team is ready to answer all your questions.
              </p>

              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 shrink-0 bg-[#F8FBFF] border border-[#E5EAF2] shadow-sm rounded-xl flex items-center justify-center text-[#2563EB]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="pt-1">
                    <h4 className="font-bold text-[#172033] mb-0.5">Email</h4>
                    <p className="text-[#667085]">yashhraool9@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 shrink-0 bg-[#F8FBFF] border border-[#E5EAF2] shadow-sm rounded-xl flex items-center justify-center text-[#2563EB]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="pt-1">
                    <h4 className="font-bold text-[#172033] mb-0.5">Phone</h4>
                    <p className="text-[#667085]">+91 8010430122</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 shrink-0 bg-[#F8FBFF] border border-[#E5EAF2] shadow-sm rounded-xl flex items-center justify-center text-[#2563EB]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="pt-1">
                    <h4 className="font-bold text-[#172033] mb-0.5">Office</h4>
                    <p className="text-[#667085]">{OFFICE_LOCATION}</p>
                  </div>
                </div>
              </div>

              {/* Google Maps Interactive Card */}
              <a 
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block w-full max-w-md h-64 rounded-2xl overflow-hidden border border-[#E5EAF2] bg-[#F8FBFF] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                aria-label={`Open workplace location in ${OFFICE_LOCATION} in Google Maps`}
              >
                {/* Subtle Location Status Badge */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-lg border border-[#E5EAF2] shadow-sm pointer-events-none transition-transform group-hover:scale-[1.02]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-semibold text-[#172033] tracking-tight">Workplace • Yavatmal</span>
                </div>

                <iframe
                  title="ITI Workplace Location Map"
                  src={GOOGLE_MAPS_EMBED_URL}
                  className="w-full h-full border-0 pointer-events-none"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  aria-label={`Interactive map of ${OFFICE_LOCATION}`}
                />

                {/* Simplified Compact Overlay Action Bar */}
                <div className="absolute bottom-3 right-3 z-10">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#2563EB] group-hover:bg-[#1D4ED8] rounded-lg transition-colors shadow-sm shadow-[#2563EB]/25"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </a>
            </motion.div>

            {/* Right Column: Contact Form */}
            <motion.div 
              variants={sceneChildVariants}
              className="bg-[#F8FBFF] border border-[#E5EAF2] rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-md transition-shadow"
            >
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-[#172033] mb-2">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="John Doe"
                    className="w-full px-4 py-3.5 rounded-xl border border-[#E5EAF2] bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-[#172033] mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="john@example.com"
                    className="w-full px-4 py-3.5 rounded-xl border border-[#E5EAF2] bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-semibold text-[#172033] mb-2">I am a...</label>
                  <div className="relative">
                    <select
                      id="role"
                      className="w-full px-4 py-3.5 rounded-xl border border-[#E5EAF2] bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all appearance-none cursor-pointer"
                    >
                      <option value="trainee">Trainee</option>
                      <option value="employer">Employer</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-[#172033] mb-2">Your Message</label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="How can we help you?"
                    className="w-full px-4 py-3.5 rounded-xl border border-[#E5EAF2] bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all resize-none"
                  ></textarea>
                </div>
                <motion.button
                  type="submit"
                  whileHover={shouldReduceMotion ? {} : { y: -2, scale: 1.01 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.98, y: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="w-full py-4 mt-2 bg-[#2563EB] text-white font-semibold rounded-xl hover:bg-[#1D4ED8] transition-colors shadow-sm hover:shadow-md text-lg cursor-pointer"
                >
                  Send Message
                </motion.button>
              </form>
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="relative z-50 bg-white border-t border-[#E5EAF2] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-extrabold text-[#172033] flex items-center gap-2">
            ITI<span className="text-[#2563EB]">Careers</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-[#667085] font-medium">
            <a href="#" className="hover:text-[#172033] transition-colors">Home</a>
            <a href="#about" className="hover:text-[#172033] transition-colors">About Us</a>
            <a href="#contact" className="hover:text-[#172033] transition-colors">Contact Us</a>
            <Link to="/privacy-policy" className="hover:text-[#172033] transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-[#172033] transition-colors">Terms of Service</Link>
          </div>

          <div className="text-sm text-[#667085]">
            © {new Date().getFullYear()} ITI Careers. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
