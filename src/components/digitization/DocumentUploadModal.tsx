import React, { useState } from 'react';
import { useLandRecord } from '../../context/LandRecordContext';
import { DocumentType, LanguageCode, LandRecord, LandClassification } from '../../types/landRecord';
import {
  UploadCloud,
  FileText,
  FileCheck,
  Sparkles,
  X,
  CheckCircle2,
  Layers,
  Globe,
  Sliders,
  AlertCircle
} from 'lucide-react';

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

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ isOpen, onClose }) => {
  const { addNewRecord, records } = useLandRecord();

  const [docType, setDocType] = useState<DocumentType>('KHATAUNI');
  const [docLanguage, setDocLanguage] = useState<LanguageCode>('hi');
  const [fileName, setFileName] = useState<string>('Scanned_Land_Record_2024.pdf');
  const [fileSize, setFileSize] = useState<number>(2450000);
  const [state, setState] = useState<string>('Uttar Pradesh');
  const [district, setDistrict] = useState<string>('Lucknow');
  const [tehsil, setTehsil] = useState<string>('Mohanlalganj');
  const [village, setVillage] = useState<string>('Bhaupur (भाऊपुर)');
  const [khasraNo, setKhasraNo] = useState<string>('412/1');
  const [khataNo, setKhataNo] = useState<string>('00219');
  const [ownerName, setOwnerName] = useState<string>('Vikram Singh Yadav');
  const [ownerVernacular, setOwnerVernacular] = useState<string>('विक्रम सिंह यादव');
  const [fatherName, setFatherName] = useState<string>('Harishchandra Yadav');
  const [plotArea, setPlotArea] = useState<number>(1.2500);
  const [landClass, setLandClass] = useState<LandClassification>('AGRICULTURAL_IRRIGATED');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDemoPreset, setSelectedDemoPreset] = useState<string>('CUSTOM');

  if (!isOpen) return null;

  // Handle Preset Sample selection
  const handlePresetSelect = (presetKey: string) => {
    setSelectedDemoPreset(presetKey);
    if (presetKey === 'UP_KHATAUNI') {
      setDocType('KHATAUNI');
      setDocLanguage('hi');
      setState('Uttar Pradesh');
      setDistrict('Varanasi');
      setTehsil('Pindra');
      setVillage('Phulpur (फूलपुर)');
      setKhasraNo('289/2');
      setKhataNo('00188');
      setOwnerName('Radheshyam Maurya');
      setOwnerVernacular('राधेश्याम मौर्य');
      setFatherName('Kashi Nath Maurya');
      setPlotArea(0.9500);
      setFileName('Varanasi_Khatauni_289.pdf');
    } else if (presetKey === 'MH_SATBARA') {
      setDocType('SATBARA_7_12');
      setDocLanguage('mr');
      setState('Maharashtra');
      setDistrict('Nashik');
      setTehsil('Niphad');
      setVillage('Pimpalgaon Baswant (पिंपळगाव बसवंत)');
      setKhasraNo('145/3');
      setKhataNo('92');
      setOwnerName('Santosh Bhaurao Gaikwad');
      setOwnerVernacular('संतोष भाऊराव गायकवाड');
      setFatherName('Bhaurao Gaikwad');
      setPlotArea(1.1200);
      setFileName('MahaBhumi_712_Dindori.pdf');
    } else if (presetKey === 'TN_PATTA') {
      setDocType('PATTA_CHITTA');
      setDocLanguage('ta');
      setState('Tamil Nadu');
      setDistrict('Madurai');
      setTehsil('Melur');
      setVillage('Kottampatti (கொட்டாம்பட்டி)');
      setKhasraNo('312/1A');
      setKhataNo('1890');
      setOwnerName('K. Ramasamy');
      setOwnerVernacular('கே. ராமசாமி');
      setFatherName('Karuppiah Thevar');
      setPlotArea(0.4047);
      setFileName('TN_Patta_Melur_312.pdf');
    } else if (presetKey === 'DISPUTED_DEMO') {
      setDocType('JAMABANDI');
      setDocLanguage('hi');
      setState('Uttar Pradesh');
      setDistrict('Rampur');
      setTehsil('Bilaspur');
      setVillage('Rampur Khas (रामपुर खास)');
      setKhasraNo('88/4');
      setKhataNo('00341');
      setOwnerName('Irfan Habib & Javed Habib');
      setOwnerVernacular('इरफ़ान हबीब व जावेद हबीब');
      setFatherName('Late Habibullah');
      setPlotArea(3.4000);
      setFileName('Faded_Legacy_Jamabandi_1982.pdf');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileSize(file.size);
      setSelectedDemoPreset('UPLOADED_FILE');
    }
  };

  const handleStartDigitization = async () => {
    setIsUploading(true);

    const newRecordId = `REC_${Date.now()}`;
    const newRecord: LandRecord = {
      id: newRecordId,
      recordNumber: `${state.slice(0, 2).toUpperCase()}-${district.slice(0, 3).toUpperCase()}-2024-${docType.slice(0, 3)}-${khataNo}`,
      documentType: docType,
      documentTitle: `${state} भू-अभिलेख (${docType.replace(/_/g, ' ')})`,
      documentLanguage: docLanguage,
      documentYear: '1431 फ़सली (2024)',
      imageUrl: 'SAMPLE_DOC_UPLOADED',
      originalFileName: fileName,
      fileSizeBytes: fileSize,
      uploadedAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      status: 'VERIFICATION_PENDING',

      state,
      district,
      tehsil: `${district} Sadar`,
      revenueVillage: village,
      gramPanchayat: `${village} Gram Panchayat`,

      khataNumber: khataNo,
      khasraNumber: khasraNo,
      subDivisionNo: '1',
      plotAreaOriginal: plotArea,
      plotAreaUnit: 'HECTARE',
      plotAreaHectares: plotArea,
      landClassification: landClass,
      landRevenueTaxPaise: 3800,

      ownershipType: 'INDIVIDUAL',
      owners: [
        {
          id: `OWNER_${Date.now()}_1`,
          name: ownerName,
          vernacularName: ownerVernacular,
          fatherOrSpouseName: fatherName,
          relationType: 'S/O',
          shareRatio: '1/1 (100%)',
          shareFraction: 1.0,
          aadhaarHash: 'XXXX-XXXX-7721',
          panHash: 'AYRPK****M',
          residence: `Village ${village}, ${district}`
        }
      ],
      mutations: [
        {
          mutationNo: `MUT-${Date.now().toString().slice(-6)}`,
          orderDate: '2023-11-10',
          transferType: 'INHERITANCE',
          sanctioningAuthority: `Tehsildar ${district}`,
          oldOwnerName: `${fatherName} (Deceased)`,
          newOwnerName: ownerName,
          status: 'SANCTIONED'
        }
      ],
      encumbrances: [],
      isLitigationPending: selectedDemoPreset === 'DISPUTED_DEMO',
      litigationCaseNo: selectedDemoPreset === 'DISPUTED_DEMO' ? 'SDM/CIVIL/2023/409' : undefined,

      guidelineMarketValueINR: plotArea * 3000000,
      stampDutyPaidINR: plotArea * 180000,

      overallConfidence: selectedDemoPreset === 'DISPUTED_DEMO' ? 68.5 : 96.2,
      characterAccuracy: selectedDemoPreset === 'DISPUTED_DEMO' ? 74.5 : 98.1,
      ocrBoundingBoxes: [
        { id: 'ub1', fieldKey: 'state', label: 'State', x: 25, y: 8, width: 50, height: 4, page: 1, confidence: 99, extractedValue: state },
        { id: 'ub2', fieldKey: 'district', label: 'District', x: 12, y: 16, width: 24, height: 3.5, page: 1, confidence: 97, extractedValue: district },
        { id: 'ub3', fieldKey: 'revenueVillage', label: 'Village', x: 70, y: 16, width: 24, height: 3.5, page: 1, confidence: 96, extractedValue: village },
        { id: 'ub4', fieldKey: 'khataNumber', label: 'Khata No', x: 10, y: 28, width: 18, height: 4.5, page: 1, confidence: 98, extractedValue: khataNo },
        { id: 'ub5', fieldKey: 'khasraNumber', label: 'Khasra No', x: 30, y: 28, width: 18, height: 4.5, page: 1, confidence: 97, extractedValue: khasraNo },
        { id: 'ub6', fieldKey: 'plotAreaOriginal', label: 'Area', x: 50, y: 28, width: 18, height: 4.5, page: 1, confidence: 95, extractedValue: `${plotArea}` },
        { id: 'ub7', fieldKey: 'owners', label: 'Owner Name', x: 70, y: 28, width: 26, height: 6, page: 1, confidence: 94, extractedValue: ownerVernacular || ownerName }
      ],
      validationIssues: [],
      preprocessingConfig: {
        deskewAngle: 0.5,
        binarizationThreshold: 145,
        denoisingLevel: 25,
        contrastBoost: 35,
        inkRecovery: true,
        stampSuppression: false,
        superResolution: true
      },
      gisCoordinates: {
        lat: 26.8467,
        lng: 80.9462,
        polygonBounds: [
          [26.8455, 80.9450],
          [26.8475, 80.9452],
          [26.8473, 80.9472],
          [26.8453, 80.9470]
        ]
      },
      bhuvanParcelId: `IN-BHU-${state.slice(0, 2).toUpperCase()}-${khasraNo.replace('/', '-')}`
    };

    setTimeout(async () => {
      await addNewRecord(newRecord);
      setIsUploading(false);
      onClose();
    }, 800);
  };

  const availableStates = getAvailableStates();
  const normState = normalizeStateName(state);
  const availableDistricts = getDistrictsForState(normState);
  const normDist = normalizeDistrictName(normState, district);
  const availableTehsils = getTehsilsForDistrict(normState, normDist);
  const normTeh = normalizeTehsilName(normState, normDist, tehsil);
  const availableVillages = getVillagesForTehsil(normState, normDist, normTeh);

  const handleStateChange = (newState: string) => {
    setState(newState);
    const dists = getDistrictsForState(newState);
    const newDist = dists[0]?.key || '';
    setDistrict(newDist);
    const tehs = getTehsilsForDistrict(newState, newDist);
    const newTeh = tehs[0]?.key || '';
    setTehsil(newTeh);
    const vills = getVillagesForTehsil(newState, newDist, newTeh);
    setVillage(vills[0] || '');
  };

  const handleDistrictChange = (newDist: string) => {
    setDistrict(newDist);
    const tehs = getTehsilsForDistrict(normState, newDist);
    const newTeh = tehs[0]?.key || '';
    setTehsil(newTeh);
    const vills = getVillagesForTehsil(normState, newDist, newTeh);
    setVillage(vills[0] || '');
  };

  const handleTehsilChange = (newTeh: string) => {
    setTehsil(newTeh);
    const vills = getVillagesForTehsil(normState, normDist, newTeh);
    setVillage(vills[0] || '');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Ingest & Digitize Land Record Document</h3>
              <p className="text-xs text-slate-400">DILRMP-compliant layout classification and OCR pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs text-slate-200">
          {/* Quick Demo Presets Shelf */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span>Instant SIH 1-Click Evaluation Presets:</span>
              <span className="text-[10px] text-emerald-400 font-mono">Verified Samples</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handlePresetSelect('UP_KHATAUNI')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedDemoPreset === 'UP_KHATAUNI'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-[10px] text-emerald-400 uppercase font-mono">Hindi (UP)</div>
                <div className="text-xs truncate">Khatauni Record</div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetSelect('MH_SATBARA')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedDemoPreset === 'MH_SATBARA'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-[10px] text-teal-400 uppercase font-mono">Marathi (MH)</div>
                <div className="text-xs truncate">7/12 Satbara Extract</div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetSelect('TN_PATTA')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedDemoPreset === 'TN_PATTA'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-[10px] text-cyan-400 uppercase font-mono">Tamil (TN)</div>
                <div className="text-xs truncate">Patta-Chitta Deed</div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetSelect('DISPUTED_DEMO')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedDemoPreset === 'DISPUTED_DEMO'
                    ? 'bg-rose-600/20 border-rose-500 text-rose-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-[10px] text-rose-400 uppercase font-mono">Dispute Sample</div>
                <div className="text-xs truncate">Faded Legacy Deed</div>
              </button>
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-5 bg-slate-950/60 text-center transition-colors relative cursor-pointer group">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.tiff"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
              <div className="p-3 rounded-full bg-slate-900 text-emerald-400 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="font-semibold text-white text-xs">
                Drag & drop your scanned land record PDF / Image
              </div>
              <p className="text-[11px] text-slate-400">
                Supports Multi-page PDF, TIFF, High-Res JPG/PNG (Up to 25MB)
              </p>
            </div>
          </div>

          {/* File Name Preview Pill */}
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2 truncate">
              <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-mono text-xs text-white truncate">{fileName}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{(fileSize / (1024 * 1024)).toFixed(2)} MB</span>
          </div>

          {/* Form Fields: Document Details with Cascading Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Document Format</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="KHATAUNI">Khatauni (RoR)</option>
                <option value="SATBARA_7_12">7/12 Satbara Extract</option>
                <option value="PATTA_CHITTA">Patta / Chitta</option>
                <option value="PAHANI_ADANGAL">Pahani / Adangal</option>
                <option value="JAMABANDI">Jamabandi Ledger</option>
                <option value="SALE_DEED">Sale Deed</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Regional Language</label>
              <select
                value={docLanguage}
                onChange={(e) => setDocLanguage(e.target.value as LanguageCode)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Territory / State Dropdown */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Territory / State</label>
              <select
                value={normState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {availableStates.map((s) => (
                  <option key={s.key} value={s.key} className="bg-slate-900 text-white">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* District Dropdown */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-semibold">District</label>
              <select
                value={availableDistricts.some(d => d.key === district) ? normDist : district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {!availableDistricts.some(d => d.key === normDist) && district && (
                  <option value={district} className="bg-slate-900 text-amber-300">
                    {district} (Custom)
                  </option>
                )}
                {availableDistricts.map((d) => (
                  <option key={d.key} value={d.key} className="bg-slate-900 text-white">
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tehsil / Taluk Dropdown */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Tehsil / Taluk</label>
              <select
                value={availableTehsils.some(t => t.key === tehsil) ? normTeh : tehsil}
                onChange={(e) => handleTehsilChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {!availableTehsils.some(t => t.key === normTeh) && tehsil && (
                  <option value={tehsil} className="bg-slate-900 text-amber-300">
                    {tehsil} (Custom)
                  </option>
                )}
                {availableTehsils.map((t) => (
                  <option key={t.key} value={t.key} className="bg-slate-900 text-white">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Revenue Village Dropdown */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Revenue Village</label>
              <select
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {!availableVillages.includes(village) && village && (
                  <option value={village} className="bg-slate-900 text-amber-300">
                    {village} (Custom)
                  </option>
                )}
                {availableVillages.map((v) => (
                  <option key={v} value={v} className="bg-slate-900 text-white">
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Khasra / Gat No.</label>
              <input
                type="text"
                value={khasraNo}
                onChange={(e) => setKhasraNo(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-mono font-bold focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Khata Number</label>
              <input
                type="text"
                value={khataNo}
                onChange={(e) => setKhataNo(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-semibold flex items-center justify-between">
                <span>Owner Name (English)</span>
                <span className="text-[9px] text-emerald-400 font-mono">✨ Auto-Transliterates</span>
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => {
                  const val = e.target.value;
                  setOwnerName(val);
                  const script = getScriptForStateOrLanguage(docLanguage, state);
                  setOwnerVernacular(transliterateEnglishToVernacular(val, script));
                }}
                placeholder="e.g. Vikram Singh Yadav"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Vernacular Name (क्षेत्रीय भाषा)</label>
              <input
                type="text"
                value={ownerVernacular}
                onChange={(e) => setOwnerVernacular(e.target.value)}
                placeholder="e.g. विक्रम सिंह यादव"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-teal-300 font-sans focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Father / Spouse Name</label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="e.g. Harishchandra Yadav"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            BhoomiVision LayoutLMv3 Ready
          </span>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStartDigitization}
              disabled={isUploading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-950/60 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing OCR & Layout...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Start AI Digitization
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
