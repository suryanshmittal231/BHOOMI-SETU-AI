import React, { useState } from 'react';
import { useLandRecord } from '../../context/LandRecordContext';
import { UserRole, LanguageCode } from '../../types/landRecord';
import { DocumentUploadModal } from '../digitization/DocumentUploadModal';
import { 
  ShieldCheck, 
  Search, 
  Bell, 
  Globe, 
  UserCheck, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Sparkles,
  UploadCloud
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    userRole, 
    setUserRole, 
    uiLanguage, 
    setUiLanguage, 
    t,
    searchQuery, 
    setSearchQuery,
    records,
    setActiveRecordId,
    setActiveTab
  } = useLandRecord();

  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const totalDisputes = records.filter(r => r.status === 'DISPUTED' || (r.validationIssues && r.validationIssues.length > 0)).length;
  const pendingReviews = records.filter(r => r.status === 'VERIFICATION_PENDING').length;

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserRole(e.target.value as UserRole);
  };

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUiLanguage(e.target.value as LanguageCode);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const matched = records.find(r => 
      r.recordNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.khasraNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.khataNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.revenueVillage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.owners.some(o => o.name.toLowerCase().includes(searchQuery.toLowerCase()) || (o.vernacularName && o.vernacularName.includes(searchQuery)))
    );

    if (matched) {
      setActiveRecordId(matched.id);
      setActiveTab('SPLIT_VERIFY');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-xl">
      {/* Top National Emblem & DILRMP Info Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950/80 px-4 py-1 text-xs border-b border-emerald-500/20 flex flex-wrap items-center justify-between text-slate-300">
        <div className="flex items-center space-x-3">
          <span className="flex items-center font-semibold text-emerald-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
            {t('dilrmpBadge')}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 hidden sm:inline">{t('ministryTitle')}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-amber-400/90 flex items-center gap-1 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            {t('immutableAudit')}
          </span>
          <span className="text-slate-500 hidden md:inline">SIH-2024 Working Prototype</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('DASHBOARD')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white font-sans flex items-center">
                BHOOMI<span className="text-emerald-400">-SETU</span>
                <span className="ml-1.5 text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium">AI v3.4</span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-devanagari tracking-wide hidden sm:block">
              {t('brandSubtitle')}
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950/80 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button 
                type="submit" 
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] px-2 py-0.5 rounded font-medium transition-colors"
              >
                {t('findBtn')}
              </button>
            )}
          </div>
        </form>

        {/* Role Switcher, Language & Alert Actions */}
        <div className="flex items-center space-x-2.5">
          {/* Quick Stats Pill */}
          <div className="hidden xl:flex items-center space-x-2 bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
            <div className="flex items-center gap-1 text-emerald-400" title="Auto-Validated">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{records.filter(r => r.status === 'APPROVED_TEHSILDAR' || r.status === 'SYNCED_LRMS').length} {t('validatedCount')}</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1 text-amber-400" title="Pending Verification">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{pendingReviews} {t('pendingCount')}</span>
            </div>
          </div>

          {/* Multilingual Selector */}
          <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg px-2 py-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <select
              value={uiLanguage}
              onChange={handleLangChange}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer font-medium"
            >
              <option value="en" className="bg-slate-900 text-white">English (EN)</option>
              <option value="hi" className="bg-slate-900 text-white">हिन्दी (Hindi)</option>
              <option value="mr" className="bg-slate-900 text-white">मराठी (Marathi)</option>
              <option value="ta" className="bg-slate-900 text-white">தமிழ் (Tamil)</option>
              <option value="te" className="bg-slate-900 text-white">తెలుగు (Telugu)</option>
            </select>
          </div>

          {/* Role Switcher (RBAC Showcase) */}
          <div className="flex items-center bg-slate-800/90 border border-emerald-500/40 rounded-lg px-2.5 py-1 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
            <div className="flex flex-col">
              <span className="text-[9px] text-emerald-400 font-semibold uppercase leading-tight">{t('activeRole')}</span>
              <select
                value={userRole}
                onChange={handleRoleChange}
                className="bg-transparent text-slate-100 font-medium text-xs focus:outline-none cursor-pointer"
              >
                <option value="OPERATOR" className="bg-slate-900 text-white">{t('roleOperator')}</option>
                <option value="PATWARI" className="bg-slate-900 text-white">{t('rolePatwari')}</option>
                <option value="TEHSILDAR" className="bg-slate-900 text-white">{t('roleTehsildar')}</option>
                <option value="ADMIN" className="bg-slate-900 text-white">{t('roleAdmin')}</option>
                <option value="CITIZEN" className="bg-slate-900 text-white">{t('roleCitizen')}</option>
              </select>
            </div>
          </div>

          {/* Ingest Document Quick Button */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-md transition-all transform hover:-translate-y-0.5"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{t('uploadRecordBtn')}</span>
          </button>

          {/* Quick Notifications Trigger */}
          <button 
            onClick={() => setActiveTab('SPLIT_VERIFY')}
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Validation Notifications"
          >
            <Bell className="w-4 h-4" />
            {totalDisputes > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {totalDisputes}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Upload Document Modal */}
      <DocumentUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </header>
  );
};
