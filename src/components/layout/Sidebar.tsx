import React from 'react';
import { useLandRecord, ActiveTab } from '../../context/LandRecordContext';
import {
  LayoutDashboard,
  ScanLine,
  SplitSquareVertical,
  MapPin,
  BrainCircuit,
  Server,
  FileCheck2,
  Users,
  ShieldAlert,
  HelpCircle,
  FileText
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, records, userRole, t } = useLandRecord();

  const pendingCount = records.filter(r => r.status === 'VERIFICATION_PENDING').length;
  const disputedCount = records.filter(r => r.status === 'DISPUTED' || (r.validationIssues && r.validationIssues.some(i => i.severity === 'CRITICAL'))).length;

  const navItems: {
    id: ActiveTab;
    label: string;
    subLabel: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'DASHBOARD',
      label: t('tabDashboard'),
      subLabel: t('tabDashboardSub'),
      icon: LayoutDashboard
    },
    {
      id: 'DIGITIZE_STUDIO',
      label: t('tabDigitize'),
      subLabel: t('tabDigitizeSub'),
      icon: ScanLine
    },
    {
      id: 'SPLIT_VERIFY',
      label: t('tabVerify'),
      subLabel: t('tabVerifySub'),
      icon: SplitSquareVertical,
      badge: pendingCount,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    },
    {
      id: 'CADASTRAL_GIS',
      label: t('tabGis'),
      subLabel: t('tabGisSub'),
      icon: MapPin
    },
    {
      id: 'ACTIVE_LEARNING',
      label: t('tabLearning'),
      subLabel: t('tabLearningSub'),
      icon: BrainCircuit
    },
    {
      id: 'LRMS_API_HUB',
      label: t('tabLrms'),
      subLabel: t('tabLrmsSub'),
      icon: Server
    },
    {
      id: 'AUDIT_LEDGER',
      label: t('tabAudit'),
      subLabel: t('tabAuditSub'),
      icon: FileCheck2
    },
    {
      id: 'CITIZEN_PORTAL',
      label: t('tabCitizen'),
      subLabel: t('tabCitizenSub'),
      icon: Users
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-[calc(100vh-85px)] select-none">
      {/* Navigation Links */}
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Core Workflows
        </div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs leading-snug">{item.label}</div>
                  <div className="text-[10px] text-slate-500 font-normal leading-tight">{item.subLabel}</div>
                </div>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {disputedCount > 0 && (
          <div className="pt-2">
            <div 
              onClick={() => setActiveTab('SPLIT_VERIFY')}
              className="cursor-pointer mx-1 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 flex items-start space-x-2.5 text-xs hover:bg-rose-950/60 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-[11px]">{t('discrepancyAlertTitle')} ({disputedCount})</span>
                <span className="text-[10px] text-rose-400/80 leading-tight block">
                  {t('discrepancyAlertSub')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Role Indicator & System Footnote */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
        <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <div className="text-[11px] font-semibold text-slate-200">{userRole} MODE</div>
              <div className="text-[9px] text-slate-400">{t('authGovt')}</div>
            </div>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
            Gov-Auth
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
          <span>DILRMP Ver: 3.4.2</span>
          <span className="flex items-center gap-1 text-emerald-400/90 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {t('aiOnline')}
          </span>
        </div>
      </div>
    </aside>
  );
};
