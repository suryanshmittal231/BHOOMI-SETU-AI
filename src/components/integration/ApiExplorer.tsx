import React, { useState } from 'react';
import { useLandRecord } from '../../context/LandRecordContext';
import {
  Server,
  Code,
  Play,
  Copy,
  Check,
  Download,
  FileJson,
  FileCode,
  ShieldCheck,
  Send,
  Sparkles,
  QrCode
} from 'lucide-react';

export const ApiExplorer: React.FC = () => {
  const { activeRecord, records } = useLandRecord();

  const [selectedEndpoint, setSelectedEndpoint] = useState<'EXTRACT' | 'VALIDATE' | 'CADASTRE' | 'SYNC'>('EXTRACT');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sampleRecord = activeRecord || records[0];

  const handleCopy = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const handleExecuteApi = () => {
    setIsLoading(true);
    setApiResponse(null);

    setTimeout(() => {
      if (selectedEndpoint === 'EXTRACT') {
        setApiResponse(JSON.stringify({
          status: 'SUCCESS',
          code: 200,
          timestamp: new Date().toISOString(),
          processingTimeMs: 278,
          modelVersion: 'BhoomiVision-v3.4-LayoutLMv3',
          data: {
            recordNumber: sampleRecord.recordNumber,
            documentType: sampleRecord.documentType,
            khasraNumber: sampleRecord.khasraNumber,
            khataNumber: sampleRecord.khataNumber,
            plotAreaHectares: sampleRecord.plotAreaHectares,
            owners: sampleRecord.owners,
            boundingBoxesCount: sampleRecord.ocrBoundingBoxes.length,
            meanConfidence: sampleRecord.overallConfidence
          }
        }, null, 2));
      } else if (selectedEndpoint === 'VALIDATE') {
        setApiResponse(JSON.stringify({
          status: 'VALIDATION_COMPLETED',
          code: 200,
          timestamp: new Date().toISOString(),
          mathAreaBalance: sampleRecord.validationIssues.some(i => i.ruleCode === 'BR_REV_001_SHARE_MISMATCH') ? 'FAIL' : 'PASS',
          duplicateDetection: 'CLEAR_NO_DUPLICATE',
          litigationCheck: sampleRecord.isLitigationPending ? 'ACTIVE_STAY_FOUND' : 'CLEAR',
          encroachmentFlag: 'CLEARED_NOT_GOVT_LAND',
          totalDiscrepanciesFound: sampleRecord.validationIssues.length,
          issues: sampleRecord.validationIssues
        }, null, 2));
      } else if (selectedEndpoint === 'CADASTRE') {
        setApiResponse(JSON.stringify({
          status: 'SUCCESS',
          khasraNo: sampleRecord.khasraNumber,
          bhuvanParcelId: sampleRecord.bhuvanParcelId || 'UP-BHU-09-342-01',
          coordinates: sampleRecord.gisCoordinates,
          soilType: 'Alluvial Loam (Domat)',
          landUse: 'Double-Cropped Agricultural',
          spatialVectorFormat: 'GeoJSON-EPSG:4326'
        }, null, 2));
      } else {
        setApiResponse(JSON.stringify({
          status: 'SYNCED_TO_DILRMP_CENTRAL',
          code: 201,
          syncId: `DILRMP-SYNC-${Date.now()}`,
          blockchainTxHash: `0x${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`,
          statePortal: 'Bhulekh UP / MahaBhumi Gateway',
          message: 'Record successfully registered into National Land Information System (NLIS).'
        }, null, 2));
      }
      setIsLoading(false);
    }, 600);
  };

  // Generate DILRMP XML payload
  const dilrmpXml = `<?xml version="1.0" encoding="UTF-8"?>
<DILRMPLandRecord xmlns="http://dilrmp.nic.in/schema/v3">
  <Header>
    <RecordId>${sampleRecord.recordNumber}</RecordId>
    <StateCode>${sampleRecord.state.slice(0, 2).toUpperCase()}</StateCode>
    <GeneratedTimestamp>${new Date().toISOString()}</GeneratedTimestamp>
    <AuthAuthority>Sub-Divisional Magistrate</AuthAuthority>
  </Header>
  <AdministrativeHierarchy>
    <State>${sampleRecord.state}</State>
    <District>${sampleRecord.district}</District>
    <Tehsil>${sampleRecord.tehsil}</Tehsil>
    <Village>${sampleRecord.revenueVillage}</Village>
  </AdministrativeHierarchy>
  <LandIdentifiers>
    <KhataNumber>${sampleRecord.khataNumber}</KhataNumber>
    <KhasraNumber>${sampleRecord.khasraNumber}</KhasraNumber>
    <AreaHectares>${sampleRecord.plotAreaHectares}</AreaHectares>
    <Classification>${sampleRecord.landClassification}</Classification>
  </LandIdentifiers>
  <TenureHolders>
    ${sampleRecord.owners.map(o => `
    <Owner>
      <Name>${o.name}</Name>
      <FatherSpouse>${o.fatherOrSpouseName}</FatherSpouse>
      <ShareRatio>${o.shareRatio}</ShareRatio>
      <AadhaarMasked>${o.aadhaarHash || 'XXXX-XXXX-8921'}</AadhaarMasked>
    </Owner>`).join('')}
  </TenureHolders>
  <VerificationSeal>
    <DigitalSignature>${sampleRecord.approvedByTehsildar?.digitalSignatureHash || 'PENDING_FINAL_SIGN'}</DigitalSignature>
    <IntegrityHash>SHA256-DILRMP-COMPLIANT</IntegrityHash>
  </VerificationSeal>
</DILRMPLandRecord>`;

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-85px)] bg-slate-950 text-slate-100">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <Server className="w-4 h-4" />
            DILRMP & National Land Information System (NLIS) Integration Hub
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            RESTful Revenue APIs & DigiLocker / Bhulekh Export Gateway
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Interoperable JSON-LD, DILRMP standard XML, and webhook triggers for DigiLocker, PM-KISAN, Agristack, and State LRMS databases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCopy(dilrmpXml, 'XML')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            {copiedFormat === 'XML' ? <Check className="w-4 h-4 text-emerald-400" /> : <FileCode className="w-4 h-4 text-amber-400" />}
            Copy DILRMP XML
          </button>
          <button
            onClick={() => handleCopy(JSON.stringify(sampleRecord, null, 2), 'JSON')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            {copiedFormat === 'JSON' ? <Check className="w-4 h-4 text-emerald-400" /> : <FileJson className="w-4 h-4 text-emerald-400" />}
            Copy JSON-LD
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout: API Console (Left) + Schema Exporter (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Interactive API Endpoint Runner */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              Interactive REST API Sandbox
            </h3>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
              API v1.0.4 Active
            </span>
          </div>

          {/* Endpoint Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setSelectedEndpoint('EXTRACT')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedEndpoint === 'EXTRACT'
                  ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-[9px] font-bold text-emerald-400 block font-mono">POST</span>
              <span className="text-xs font-bold block truncate">/ocr/extract</span>
            </button>

            <button
              onClick={() => setSelectedEndpoint('VALIDATE')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedEndpoint === 'VALIDATE'
                  ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-[9px] font-bold text-teal-400 block font-mono">POST</span>
              <span className="text-xs font-bold block truncate">/records/validate</span>
            </button>

            <button
              onClick={() => setSelectedEndpoint('CADASTRE')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedEndpoint === 'CADASTRE'
                  ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-[9px] font-bold text-cyan-400 block font-mono">GET</span>
              <span className="text-xs font-bold block truncate">/cadastral/khasra</span>
            </button>

            <button
              onClick={() => setSelectedEndpoint('SYNC')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedEndpoint === 'SYNC'
                  ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-[9px] font-bold text-amber-400 block font-mono">POST</span>
              <span className="text-xs font-bold block truncate">/lrms/sync</span>
            </button>
          </div>

          {/* Request Header Bar & Execute Button */}
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="flex items-center space-x-2 text-slate-300 truncate">
              <span className="text-emerald-400 font-bold">
                {selectedEndpoint === 'CADASTRE' ? 'GET' : 'POST'}
              </span>
              <span className="text-slate-400">
                https://api.bhoomi.gov.in/v1/{selectedEndpoint.toLowerCase()}
              </span>
            </div>

            <button
              onClick={handleExecuteApi}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition-colors shrink-0 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isLoading ? 'Executing...' : 'Test Endpoint'}
            </button>
          </div>

          {/* Response Output Box */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>HTTP 200 Live Response Payload:</span>
              <span className="text-emerald-400 font-mono">Content-Type: application/json</span>
            </div>
            <pre className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-[11px] text-emerald-400/90 overflow-x-auto max-h-[300px] leading-relaxed select-all">
              {apiResponse || '// Click "Test Endpoint" to simulate live JSON response...'}
            </pre>
          </div>
        </div>

        {/* Right 5 Cols: DILRMP National Standard XML Export Preview */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                DILRMP National XML Schema
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">NIC-DILRMP-v3.0</span>
            </div>

            <pre className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 font-mono text-[10px] text-amber-300/90 overflow-x-auto max-h-[360px] leading-tight select-all">
              {dilrmpXml}
            </pre>
          </div>

          {/* DigiLocker Bridge Status */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> DigiLocker RoR Verification Bridge
              </span>
              <span className="text-emerald-400 font-mono text-[10px]">CONNECTED</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Citizens can fetch this digitally certified Record of Rights (RoR) directly using their 12-digit Aadhaar UIDAI token.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
