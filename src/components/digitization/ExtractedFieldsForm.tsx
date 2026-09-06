import React, { useState, useMemo } from 'react';
import { useLandRecord } from '../../context/LandRecordContext';
import { LandClassification, LandOwner, AreaUnit } from '../../types/landRecord';
import { convertArea, parseShareFraction, UNIT_LABELS } from '../../utils/areaConverter';
import {
  getAvailableStates,
  getDistrictsForState,
  getTehsilsForDistrict,
  getVillagesForTehsil,
  normalizeStateName,
  normalizeDistrictName,
  normalizeTehsilName
} from '../../data/administrativeHierarchy';
import {
  transliterateEnglishToVernacular,
  getScriptForStateOrLanguage
} from '../../utils/transliteration';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Plus,
  Trash2,
  BrainCircuit,
  Lock,
  FileCheck,
  Building,
  Scale,
  Calendar,
  Layers,
  ArrowRight,
  MapPin,
  ListFilter,
  Edit3
} from 'lucide-react';

export const ExtractedFieldsForm: React.FC = () => {
  const {
    activeRecord,
    updateActiveRecord,
    updateRecordField,
    userRole,
    approveByPatwari,
    approveByTehsildar,
    rejectRecord,
    queueActiveLearningCorrection,
    selectedBoundingBoxId,
    setSelectedBoundingBoxId,
    t
  } = useLandRecord();

  const [activeUnit, setActiveUnit] = useState<AreaUnit>(activeRecord?.plotAreaUnit || 'HECTARE');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [patwariNotes, setPatwariNotes] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);
  const [isManualLocationInput, setIsManualLocationInput] = useState(false);

  if (!activeRecord) {
    return <div className="p-8 text-center text-slate-500">No record selected.</div>;
  }

  // Calculate live co-owner share sum
  const totalShareSum = activeRecord.owners.reduce((acc, o) => {
    return acc + (o.shareFraction || parseShareFraction(o.shareRatio));
  }, 0);
  const isShareValid = Math.abs(totalShareSum - 1.0) < 0.005;

  // Handle unit change and re-conversion
  const handleUnitChange = (newUnit: AreaUnit) => {
    setActiveUnit(newUnit);
    const converted = convertArea(activeRecord.plotAreaHectares, 'HECTARE', newUnit);
    updateActiveRecord({
      plotAreaOriginal: converted,
      plotAreaUnit: newUnit
    });
  };

  // Handle owner field updates with real-time Indic transliteration
  const handleOwnerChange = (index: number, field: keyof LandOwner, value: any) => {
    const updatedOwners = [...activeRecord.owners];
    const currentOwner = updatedOwners[index];

    let newVernacular = currentOwner.vernacularName;
    if (field === 'name') {
      const targetScript = getScriptForStateOrLanguage(activeRecord.documentLanguage, activeRecord.state);
      newVernacular = transliterateEnglishToVernacular(value, targetScript);
    }

    updatedOwners[index] = {
      ...currentOwner,
      [field]: value,
      ...(field === 'name' ? { vernacularName: newVernacular } : {})
    };

    if (field === 'shareRatio') {
      updatedOwners[index].shareFraction = parseShareFraction(value);
    }

    updateActiveRecord({ owners: updatedOwners });
  };

  // Add new co-owner
  const handleAddOwner = () => {
    const newOwner: LandOwner = {
      id: `OWNER_NEW_${Date.now()}`,
      name: 'New Co-Owner',
      vernacularName: 'नया खातेदार',
      fatherOrSpouseName: 'Father Name',
      relationType: 'S/O',
      shareRatio: '0.00',
      shareFraction: 0,
      residence: activeRecord.revenueVillage
    };
    updateActiveRecord({ owners: [...activeRecord.owners, newOwner] });
  };

  // Remove owner
  const handleRemoveOwner = (index: number) => {
    const updated = activeRecord.owners.filter((_, idx) => idx !== index);
    updateActiveRecord({ owners: updated });
  };

  // Auto-Fix Share Ratio discrepancy
  const handleAutoFixShares = () => {
    if (activeRecord.owners.length === 0) return;
    const equalShare = Number((1 / activeRecord.owners.length).toFixed(4));
    const equalShareStr = `${equalShare * 100}% (1/${activeRecord.owners.length})`;

    const fixedOwners = activeRecord.owners.map(o => ({
      ...o,
      shareRatio: equalShareStr,
      shareFraction: equalShare
    }));

    updateActiveRecord({ owners: fixedOwners });
    setShowSuccessToast('Co-owner shares re-normalized proportionally to 100.00%');
    setTimeout(() => setShowSuccessToast(null), 3000);
  };

  // Administrative Hierarchy Cascading Computations
  const availableStates = useMemo(() => getAvailableStates(), []);

  const normState = useMemo(() => normalizeStateName(activeRecord.state), [activeRecord.state]);
  const availableDistricts = useMemo(() => getDistrictsForState(normState), [normState]);

  const normDistrict = useMemo(
    () => normalizeDistrictName(normState, activeRecord.district),
    [normState, activeRecord.district]
  );
  const availableTehsils = useMemo(
    () => getTehsilsForDistrict(normState, normDistrict),
    [normState, normDistrict]
  );

  const normTehsil = useMemo(
    () => normalizeTehsilName(normState, normDistrict, activeRecord.tehsil),
    [normState, normDistrict, activeRecord.tehsil]
  );
  const availableVillages = useMemo(
    () => getVillagesForTehsil(normState, normDistrict, normTehsil),
    [normState, normDistrict, normTehsil]
  );

  // Administrative Hierarchy Selection Handlers
  const handleStateSelect = (newState: string) => {
    const districts = getDistrictsForState(newState);
    const newDistrict = districts[0]?.key || '';
    const tehsils = getTehsilsForDistrict(newState, newDistrict);
    const newTehsil = tehsils[0]?.key || '';
    const villages = getVillagesForTehsil(newState, newDistrict, newTehsil);
    const newVillage = villages[0] || '';

    updateActiveRecord({
      state: newState,
      district: newDistrict,
      tehsil: newTehsil,
      revenueVillage: newVillage
    });
  };

  const handleDistrictSelect = (newDistrict: string) => {
    const tehsils = getTehsilsForDistrict(normState, newDistrict);
    const newTehsil = tehsils[0]?.key || '';
    const villages = getVillagesForTehsil(normState, newDistrict, newTehsil);
    const newVillage = villages[0] || '';

    updateActiveRecord({
      district: newDistrict,
      tehsil: newTehsil,
      revenueVillage: newVillage
    });
  };

  const handleTehsilSelect = (newTehsil: string) => {
    const villages = getVillagesForTehsil(normState, normDistrict, newTehsil);
    const newVillage = villages[0] || '';

    updateActiveRecord({
      tehsil: newTehsil,
      revenueVillage: newVillage
    });
  };

  const handleVillageSelect = (newVillage: string) => {
    updateActiveRecord({
      revenueVillage: newVillage
    });
  };

  // Workflow Handlers
  const handlePatwariVerify = async () => {
    await approveByPatwari(patwariNotes);
    setShowSuccessToast('Record verified by Revenue Inspector and escalated to Tehsildar.');
    setTimeout(() => setShowSuccessToast(null), 3500);
  };

  const handleTehsildarApprove = async () => {
    await approveByTehsildar();
    setShowSuccessToast('Record legally approved with NIC Digital Signature and synchronized to Central DILRMP Database!');
    setTimeout(() => setShowSuccessToast(null), 4000);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason) return;
    await rejectRecord(rejectReason);
    setRejectModalOpen(false);
    setRejectReason('');
    setShowSuccessToast('Record marked as disputed/rejected in audit ledger.');
    setTimeout(() => setShowSuccessToast(null), 3500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-slate-200">
      {/* Toast Alert */}
      {showSuccessToast && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between animate-fadeIn z-50">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {showSuccessToast}
          </span>
          <button onClick={() => setShowSuccessToast(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Form Header */}
      <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">{activeRecord.documentTitle}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeRecord.status === 'APPROVED_TEHSILDAR' || activeRecord.status === 'SYNCED_LRMS'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : activeRecord.status === 'DISPUTED'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {activeRecord.status.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Record ID: {activeRecord.recordNumber} | Confidence: {activeRecord.overallConfidence}%
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <div className="text-[11px]">
            <span className="text-slate-400">Mean OCR CRR: </span>
            <span className="font-mono text-emerald-400 font-bold">{activeRecord.characterAccuracy}%</span>
          </div>
        </div>
      </div>

      {/* Form Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        {/* Validation Issues / Anomaly Alerts Panel */}
        {activeRecord.validationIssues && activeRecord.validationIssues.length > 0 && (
          <div className="space-y-2.5">
            {activeRecord.validationIssues.map((issue) => (
              <div
                key={issue.id}
                className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                  issue.severity === 'CRITICAL'
                    ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                    : issue.severity === 'WARNING'
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                    : 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <div className="font-bold text-xs flex items-center gap-2">
                      <span>{issue.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-black/40 rounded border border-white/10">
                        {issue.ruleCode}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{issue.message}</p>
                    {issue.suggestedFix && (
                      <div className="text-[10px] text-amber-300/90 mt-1 font-medium">
                        💡 Suggested Action: {issue.suggestedFix}
                      </div>
                    )}
                  </div>
                </div>

                {issue.ruleCode === 'BR_REV_001_SHARE_MISMATCH' && (
                  <button
                    onClick={handleAutoFixShares}
                    className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow transition-colors"
                  >
                    {t('autoNormalize')}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Section 1: Administrative Hierarchy & Location Dropdowns */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              {t('adminHierarchy')}
            </div>

            {/* Toggle between Cascading Dropdowns and Manual Freeform Edit */}
            <button
              type="button"
              onClick={() => setIsManualLocationInput(!isManualLocationInput)}
              className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Toggle between dropdown directory and custom text entry"
            >
              {isManualLocationInput ? (
                <>
                  <ListFilter className="w-3 h-3 text-emerald-400" />
                  <span>Use Dropdown Directory</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3 h-3 text-amber-400" />
                  <span>Manual Text Input</span>
                </>
              )}
            </button>
          </div>

          {isManualLocationInput ? (
            /* Freeform Text Inputs */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">{t('stateLabel')}</label>
                <input
                  type="text"
                  value={activeRecord.state}
                  onChange={(e) => updateRecordField('state', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">{t('districtLabel')}</label>
                <input
                  type="text"
                  value={activeRecord.district}
                  onChange={(e) => updateRecordField('district', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">{t('tehsilLabel')}</label>
                <input
                  type="text"
                  value={activeRecord.tehsil}
                  onChange={(e) => updateRecordField('tehsil', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">{t('villageLabel')}</label>
                <input
                  type="text"
                  value={activeRecord.revenueVillage}
                  onChange={(e) => updateRecordField('revenueVillage', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          ) : (
            /* Cascading Interactive Dropdowns */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. State Dropdown */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 flex items-center justify-between">
                  <span>{t('stateLabel')}</span>
                  <span className="text-[9px] text-emerald-400 font-mono">DILRMP</span>
                </label>
                <select
                  value={normState}
                  onChange={(e) => handleStateSelect(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
                >
                  {availableStates.map((s) => (
                    <option key={s.key} value={s.key} className="bg-slate-900 text-white">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. District Dropdown */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 flex items-center justify-between">
                  <span>{t('districtLabel')}</span>
                  <span className="text-[9px] text-teal-400/80 font-mono">({availableDistricts.length} Districts)</span>
                </label>
                <select
                  value={
                    availableDistricts.some(d => d.key === activeRecord.district || d.label.includes(activeRecord.district))
                      ? normDistrict
                      : (activeRecord.district || normDistrict)
                  }
                  onChange={(e) => handleDistrictSelect(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
                >
                  {!availableDistricts.some(d => d.key === normDistrict) && activeRecord.district && (
                    <option value={activeRecord.district} className="bg-slate-900 text-amber-300 font-bold">
                      {activeRecord.district} (Extracted)
                    </option>
                  )}
                  {availableDistricts.map((d) => (
                    <option key={d.key} value={d.key} className="bg-slate-900 text-white">
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Tehsil / Taluk Dropdown */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 flex items-center justify-between">
                  <span>{t('tehsilLabel')}</span>
                  <span className="text-[9px] text-cyan-400/80 font-mono">({availableTehsils.length} Tehsils)</span>
                </label>
                <select
                  value={
                    availableTehsils.some(t => t.key === activeRecord.tehsil || t.label.includes(activeRecord.tehsil))
                      ? normTehsil
                      : (activeRecord.tehsil || normTehsil)
                  }
                  onChange={(e) => handleTehsilSelect(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
                >
                  {!availableTehsils.some(t => t.key === normTehsil) && activeRecord.tehsil && (
                    <option value={activeRecord.tehsil} className="bg-slate-900 text-amber-300 font-bold">
                      {activeRecord.tehsil} (Extracted)
                    </option>
                  )}
                  {availableTehsils.map((t) => (
                    <option key={t.key} value={t.key} className="bg-slate-900 text-white">
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Revenue Village Dropdown */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 flex items-center justify-between">
                  <span>{t('villageLabel')}</span>
                  <span className="text-[9px] text-emerald-400/80 font-mono">({availableVillages.length} Villages)</span>
                </label>
                <select
                  value={activeRecord.revenueVillage}
                  onChange={(e) => handleVillageSelect(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
                >
                  {!availableVillages.includes(activeRecord.revenueVillage) && activeRecord.revenueVillage && (
                    <option value={activeRecord.revenueVillage} className="bg-slate-900 text-amber-300 font-bold">
                      {activeRecord.revenueVillage} (Extracted)
                    </option>
                  )}
                  {availableVillages.map((v) => (
                    <option key={v} value={v} className="bg-slate-900 text-white">
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Land Identifiers & Universal Area Converter */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              {t('landIdentifiers')}
            </div>

            {/* Area Unit Selector */}
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Unit:</span>
              <select
                value={activeUnit}
                onChange={(e) => handleUnitChange(e.target.value as AreaUnit)}
                className="bg-transparent text-emerald-400 font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="HECTARE" className="bg-slate-900">Hectares (ha)</option>
                <option value="ACRE" className="bg-slate-900">Acres (ac)</option>
                <option value="BIGHA" className="bg-slate-900">Bigha (UP/MP Pucca)</option>
                <option value="GUNTHA" className="bg-slate-900">Guntha (MH/KA)</option>
                <option value="SQ_METER" className="bg-slate-900">Sq. Meters</option>
                <option value="SQ_FEET" className="bg-slate-900">Sq. Feet</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">{t('khataNoLabel')}</label>
              <input
                type="text"
                value={activeRecord.khataNumber}
                onChange={(e) => updateRecordField('khataNumber', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">{t('khasraNoLabel')}</label>
              <input
                type="text"
                value={activeRecord.khasraNumber}
                onChange={(e) => updateRecordField('khasraNumber', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">
                {t('plotAreaLabel')} ({UNIT_LABELS[activeUnit as keyof typeof UNIT_LABELS]?.symbol || 'ha'})
              </label>
              <input
                type="number"
                step="0.0001"
                value={activeRecord.plotAreaOriginal}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  const inHectares = convertArea(val, activeUnit, 'HECTARE');
                  updateActiveRecord({
                    plotAreaOriginal: val,
                    plotAreaHectares: inHectares
                  });
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-mono font-bold focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">{t('landClassLabel')}</label>
              <select
                value={activeRecord.landClassification}
                onChange={(e) => updateRecordField('landClassification', e.target.value as LandClassification)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-emerald-500"
              >
                <option value="AGRICULTURAL_IRRIGATED">Agricultural (Irrigated)</option>
                <option value="AGRICULTURAL_UNIRRIGATED">Agricultural (Unirrigated)</option>
                <option value="NON_AGRICULTURAL_RESIDENTIAL">Non-Agri (Residential)</option>
                <option value="COMMERCIAL_INDUSTRIAL">Commercial / Industrial</option>
                <option value="GOVERNMENT_GRAM_SABHA">Govt / Gram Sabha</option>
                <option value="FOREST_PROTECTED">Forest (Protected)</option>
                <option value="WATERBODY_WETLAND">Waterbody / Wetland</option>
                <option value="WAKF_RELIGIOUS_TRUST">Wakf / Religious Trust</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Registered Landowners & Live Share Sum Checker */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              {t('landownersTitle')}
            </div>

            {/* Live Share Math Validator Badge */}
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1 ${
                  isShareValid
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                }`}
              >
                {isShareValid ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                Total Share: {(totalShareSum * 100).toFixed(1)}% {isShareValid ? '(Balanced 100%)' : '(Discrepancy)'}
              </span>

              <button
                onClick={handleAddOwner}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium px-2 py-1 rounded-lg border border-slate-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> {t('addCoOwner')}
              </button>
            </div>
          </div>

          {/* Owners Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2">
                    <span className="flex items-center gap-1.5">
                      <span>Owner Name (English / Vernacular)</span>
                      <span className="text-[9px] text-emerald-400 font-mono font-normal normal-case">✨ Live Transliteration</span>
                    </span>
                  </th>
                  <th className="px-3 py-2">Father / Spouse Name</th>
                  <th className="px-3 py-2">Share Ratio</th>
                  <th className="px-3 py-2">Aadhaar Hash</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {activeRecord.owners.map((owner, idx) => (
                  <tr key={owner.id || idx} className="hover:bg-slate-900/40">
                    <td className="px-3 py-2 min-w-[240px]">
                      {/* Primary English Name Input */}
                      <input
                        type="text"
                        value={owner.name}
                        onChange={(e) => handleOwnerChange(idx, 'name', e.target.value)}
                        placeholder="Owner Name in English (e.g. Suryansh Mittal)"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-medium focus:ring-1 focus:ring-emerald-500"
                      />
                      {/* Secondary Vernacular Name Input */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-teal-400/80 font-mono shrink-0 flex items-center gap-0.5">
                          <span>Vernacular:</span>
                        </span>
                        <input
                          type="text"
                          value={owner.vernacularName || ''}
                          onChange={(e) => handleOwnerChange(idx, 'vernacularName', e.target.value)}
                          placeholder="क्षेत्रीय भाषा (e.g. सूर्यांश मित्तल)"
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-[11px] text-teal-300 font-sans focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2 min-w-[180px]">
                      <input
                        type="text"
                        value={owner.fatherOrSpouseName}
                        onChange={(e) => handleOwnerChange(idx, 'fatherOrSpouseName', e.target.value)}
                        placeholder="Father / Spouse Name"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-3 py-2 w-32">
                      <input
                        type="text"
                        value={owner.shareRatio}
                        onChange={(e) => handleOwnerChange(idx, 'shareRatio', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-emerald-400 font-mono font-bold"
                        placeholder="e.g. 1/2, 50%"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={owner.aadhaarHash || ''}
                        onChange={(e) => handleOwnerChange(idx, 'aadhaarHash', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 font-mono"
                        placeholder="XXXX-XXXX-1234"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      {activeRecord.owners.length > 1 && (
                        <button
                          onClick={() => handleRemoveOwner(idx)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                          title="Remove Owner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Mutation Records & Encumbrances */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mutation */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-2">
            <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              {t('mutationTitle')}
            </div>
            {activeRecord.mutations && activeRecord.mutations.length > 0 ? (
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Order No:</span>
                  <span className="font-mono text-white font-bold">{activeRecord.mutations[0].mutationNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date & Type:</span>
                  <span className="text-slate-200">{activeRecord.mutations[0].orderDate} ({activeRecord.mutations[0].transferType})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Authority:</span>
                  <span className="text-slate-300">{activeRecord.mutations[0].sanctioningAuthority}</span>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 py-2">No pending or prior mutations recorded.</div>
            )}
          </div>

          {/* Encumbrance */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-2">
            <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              {t('encumbranceTitle')}
            </div>
            {activeRecord.encumbrances && activeRecord.encumbrances.length > 0 ? (
              <div className="bg-rose-950/20 p-3 rounded-lg border border-rose-500/30 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-rose-300 font-bold">ACTIVE BANK LIEN:</span>
                  <span className="font-mono text-white font-bold">₹{activeRecord.encumbrances[0].loanAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-slate-300">{activeRecord.encumbrances[0].bankOrCreditorName}</div>
                <div className="text-slate-400 text-[10px]">Ref: {activeRecord.encumbrances[0].referenceNo}</div>
              </div>
            ) : (
              <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-500/30 text-[11px] text-emerald-300 font-medium">
                ✓ Non-Encumbered (भारमुक्त) - Clear title with zero active bank mortgages.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role-Based Action Footer */}
      <div className="bg-slate-950 p-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              queueActiveLearningCorrection(
                activeRecord.ocrBoundingBoxes[0]?.extractedValue || '',
                activeRecord.khasraNumber,
                'khasraNumber',
                'Khasra No'
              );
              setShowSuccessToast('Submitted token pair to Active Learning Retraining Queue!');
              setTimeout(() => setShowSuccessToast(null), 3000);
            }}
            className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />
            {t('sendAiFeedback')}
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setRejectModalOpen(true)}
            className="bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700/50 px-3.5 py-2 rounded-xl font-semibold transition-colors"
          >
            {t('flagDispute')}
          </button>

          {userRole === 'PATWARI' && (
            <button
              onClick={handlePatwariVerify}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-950/60 flex items-center gap-1.5 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              {t('verifyPatwari')}
            </button>
          )}

          {(userRole === 'TEHSILDAR' || userRole === 'ADMIN') && (
            <button
              onClick={handleTehsildarApprove}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-5 py-2 rounded-xl shadow-lg shadow-emerald-950/60 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Lock className="w-4 h-4" />
              {t('approveTehsildar')}
            </button>
          )}
        </div>
      </div>

      {/* Dispute / Reject Reason Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Flag Record for Revenue Officer Dispute
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Enter grounds of objection (e.g. area mismatch, pending civil litigation stay, duplicate survey allocation, fraudulent patta claim).
            </p>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="State clear legal/survey grounds for rejection..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:ring-1 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-xs rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectReason}
                className="px-4 py-2 text-xs rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold disabled:opacity-50"
              >
                Confirm Objection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
