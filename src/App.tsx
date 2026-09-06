import React from 'react';
import { LandRecordProvider, useLandRecord } from './context/LandRecordContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { PreprocessingStudio } from './components/digitization/PreprocessingStudio';
import { SplitVerificationEditor } from './components/digitization/SplitVerificationEditor';
import { CadastralMapViewer } from './components/gis/CadastralMapViewer';
import { ActiveLearningDashboard } from './components/learning/ActiveLearningDashboard';
import { ApiExplorer } from './components/integration/ApiExplorer';
import { AuditTrailLedger } from './components/audit/AuditTrailLedger';
import { CitizenPortalView } from './components/citizen/CitizenPortalView';

const MainContent: React.FC = () => {
  const { activeTab } = useLandRecord();

  return (
    <main className="flex-1 overflow-hidden bg-slate-950">
      {activeTab === 'DASHBOARD' && <ExecutiveDashboard />}
      {activeTab === 'DIGITIZE_STUDIO' && <PreprocessingStudio />}
      {activeTab === 'SPLIT_VERIFY' && <SplitVerificationEditor />}
      {activeTab === 'CADASTRAL_GIS' && <CadastralMapViewer />}
      {activeTab === 'ACTIVE_LEARNING' && <ActiveLearningDashboard />}
      {activeTab === 'LRMS_API_HUB' && <ApiExplorer />}
      {activeTab === 'AUDIT_LEDGER' && <AuditTrailLedger />}
      {activeTab === 'CITIZEN_PORTAL' && <CitizenPortalView />}
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <LandRecordProvider>
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 antialiased font-sans selection:bg-emerald-500 selection:text-white">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <MainContent />
        </div>
        <Footer />
      </div>
    </LandRecordProvider>
  );
};

export default App;
