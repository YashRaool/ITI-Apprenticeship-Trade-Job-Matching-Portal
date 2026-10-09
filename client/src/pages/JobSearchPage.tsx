import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { JobPostingDto, TradeSkillDto } from '@iti-portal/shared';
import { api } from '../lib/api';
import { motion } from 'framer-motion';
import { AppNavbar } from '../components/ui/AppNavbar';
import { LoadingState, EmptyState } from '../components/ui/StateMessages';
import { Search, MapPin, Briefcase, ChevronRight, Filter, Building2, Sparkles, X } from 'lucide-react';

export const JobSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobPostingDto[]>([]);
  const [tradeSkills, setTradeSkills] = useState<TradeSkillDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchParams] = useSearchParams();
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('keyword') || '');
  const [searchLocation, setSearchLocation] = useState(searchParams.get('location') || '');
  const [searchJobType, setSearchJobType] = useState(searchParams.get('jobType') || '');
  const [searchStream, setSearchStream] = useState('');

  useEffect(() => {
    setSearchKeyword(searchParams.get('keyword') || '');
    setSearchLocation(searchParams.get('location') || '');
    setSearchJobType(searchParams.get('jobType') || '');
  }, [searchParams]);

  useEffect(() => {
    fetchTradeSkills();
    fetchJobs();
  }, []);

  const fetchTradeSkills = async () => {
    try {
      const res = await api.get('/trade-skills');
      if (res.data.success) {
        const raw = res.data.data;
        if (Array.isArray(raw)) {
          setTradeSkills(raw);
        } else if (raw && typeof raw === 'object') {
          const flattened = Object.values(raw).flat() as TradeSkillDto[];
          setTradeSkills(flattened);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs');
      if (res.data.success) setJobs(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load apprenticeship openings');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const kw = searchKeyword.trim();
    const loc = searchLocation.trim();
    if (kw) params.set('keyword', kw);
    if (loc) params.set('location', loc);
    if (searchJobType) params.set('jobType', searchJobType);
    navigate({ search: params.toString() }, { replace: true });
  };

  const handleClear = () => {
    setSearchKeyword(''); 
    setSearchLocation(''); 
    setSearchJobType('');
    setSearchStream('');
    navigate('/jobs', { replace: true });
  };

  const handleJobTypeSelect = (type: string) => {
    setSearchJobType(type);
    const params = new URLSearchParams(searchParams);
    if (type) {
      params.set('jobType', type);
    } else {
      params.delete('jobType');
    }
    navigate({ search: params.toString() }, { replace: true });
  };

  const hasFilter = Boolean(searchKeyword || searchLocation || searchStream || searchJobType);

  const filteredApprenticeships = jobs.filter(job => {
    const titleMatch = (job.title || '').toLowerCase().includes(searchKeyword.toLowerCase());
    const companyMatch = (((job as any).employer?.workshopName) || '').toLowerCase().includes(searchKeyword.toLowerCase());
    const keywordMatch = searchKeyword === '' || titleMatch || companyMatch;
    
    const locationMatch = searchLocation === '' || (job.location || '').toLowerCase().includes(searchLocation.toLowerCase());
    const streamMatch = searchStream === '' || String(job.tradeSkillId) === String(searchStream);
    const jobTypeMatch = searchJobType === '' || (job.jobType || 'apprenticeship') === searchJobType;

    return keywordMatch && locationMatch && streamMatch && jobTypeMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-20">
      <AppNavbar />

      <main className="content-wrap pt-8">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-blue-50 text-blue-700 border border-blue-200"
          >
            <Sparkles size={13} className="text-blue-500" />
            Verified Trade Apprenticeships
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Find an Apprenticeship
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 max-w-2xl">
            Explore active openings posted by registered manufacturing plants, auto service centers, and engineering workshops.
          </p>
        </motion.div>

        {/* Filter Toolbar */}
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.22 }}
          onSubmit={handleSearch}
          className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Keyword / Role Title</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Electrician, Fitter"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all pl-9 py-2.5 text-xs sm:text-sm text-gray-900"
                />
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Location / City</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Pune, Delhi"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all pl-9 py-2.5 text-xs sm:text-sm text-gray-900"
                />
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Trade Skill Stream</label>
              <div className="relative">
                <select
                  value={searchStream}
                  onChange={(e) => setSearchStream(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all pl-3 py-2.5 appearance-none pr-8 text-xs sm:text-sm cursor-pointer text-gray-900"
                >
                  <option value="">All Trade Specializations</option>
                  {tradeSkills.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <Filter size={13} />
                </div>
              </div>
            </div>

            <div className="flex gap-2 h-[42px]">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 flex-1 h-full text-xs sm:text-sm transition-colors">
                <Search size={14} /><span>Search</span>
              </button>
              {hasFilter && (
                <button type="button" onClick={handleClear} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg px-3 h-full flex items-center justify-center transition-colors" title="Clear filters">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </motion.form>

        {/* Job Type Selector Pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { id: '', label: 'All Opportunities' },
            { id: 'apprenticeship', label: 'Apprenticeship' },
            { id: 'full_time', label: 'Full-Time Trade Job' },
          ].map((typeTab) => {
            const isSelected = searchJobType === typeTab.id;
            return (
              <button
                key={typeTab.id}
                type="button"
                onClick={() => handleJobTypeSelect(typeTab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {typeTab.label}
              </button>
            );
          })}
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs sm:text-sm font-semibold text-gray-600">
            Showing <span className="font-bold text-blue-600">{filteredApprenticeships.length}</span> active opening{filteredApprenticeships.length === 1 ? '' : 's'}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl text-sm mb-6 bg-red-50 border border-red-200 text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingState message="Fetching available trade apprenticeships..." />
        ) : filteredApprenticeships.length === 0 ? (
          <EmptyState
            message="No matching opportunities found"
            description="Try broadening your search keywords, clearing location filters, or switching job types."
            icon={<Briefcase size={26} />}
            action={hasFilter ? (
              <button type="button" onClick={handleClear} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs sm:text-sm py-2 px-4 transition-colors">Clear Search Filters</button>
            ) : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredApprenticeships.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.25), duration: 0.2 }}
                whileHover={{ y: -2 }}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700"
                    >
                      <Briefcase size={11} />{job.tradeSkill?.name || 'Trade Requirement'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      job.jobType === 'full_time'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {job.jobType === 'full_time' ? 'Full-Time' : 'Apprenticeship'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight line-clamp-1">
                    {job.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1.5">
                    <Building2 size={12} className="text-gray-400 shrink-0" />
                    <span className="font-medium truncate">{(job as any).employer?.workshopName || 'Certified Workshop'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                    <MapPin size={12} className="shrink-0" /><span>{job.location}</span>
                  </div>

                  <p className="text-xs text-gray-600 mt-3 line-clamp-3 leading-relaxed">{job.description}</p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-800">
                  <span>View Details &amp; Apply</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
