import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LandRecord, UserRole, LanguageCode, BoundingBox, ValidationIssue, PreprocessingConfig } from '../types/landRecord';
import { AuditBlock } from '../types/audit';
import { CorrectedToken, ModelMetrics } from '../types/learning';
import { SAMPLE_LAND_RECORDS } from '../data/sampleRecords';
import { validateLandRecord } from '../utils/validationRules';
import { createAuditBlock, verifyAuditChain } from '../utils/cryptoAudit';
import { getTranslation, TranslationKey } from '../utils/translations';

export type ActiveTab = 
  | 'DASHBOARD' 
  | 'DIGITIZE_STUDIO' 
  | 'SPLIT_VERIFY' 
  | 'CADASTRAL_GIS' 
  | 'ACTIVE_LEARNING' 
  | 'LRMS_API_HUB' 
  | 'AUDIT_LEDGER' 
  | 'CITIZEN_PORTAL';

const STORAGE_PREFIX = 'bhoomi_setu_';
export const STORAGE_KEYS = {
  RECORDS: `${STORAGE_PREFIX}records_v2`,
  ACTIVE_RECORD_ID: `${STORAGE_PREFIX}active_record_id_v2`,
  ACTIVE_TAB: `${STORAGE_PREFIX}active_tab_v2`,
  USER_ROLE: `${STORAGE_PREFIX}user_role_v2`,
  UI_LANGUAGE: `${STORAGE_PREFIX}ui_lang_v2`,
  AUDIT_CHAIN: `${STORAGE_PREFIX}audit_chain_v2`,
  ACTIVE_LEARNING: `${STORAGE_PREFIX}learning_tokens_v2`,
  MODEL_METRICS: `${STORAGE_PREFIX}model_metrics_v2`
};

function loadFromLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed === null || parsed === undefined) return fallback;
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    return parsed;
  } catch (e) {
    console.warn(`[LocalStorage] Failed to load key: ${key}`, e);
    return fallback;
  }
}

function saveToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[LocalStorage] Failed to save key: ${key}`, e);
  }
}

const DEFAULT_LEARNING_TOKENS: CorrectedToken[] = [
  {
    id: 'ALT_001',
    fieldKey: 'khasraNumber',
    fieldLabel: 'Khasra No / खसरा संख्या',
    originalOcrText: '३४२/१ (Misrecognized digit ८ as ३)',
    correctedText: '३४२/१',
    language: 'Hindi (हिंदी)',
    script: 'Devanagari',
    confidenceBefore: 62.4,
    correctedBy: 'Patwari Rajesh Kumar',
    correctedAt: '2024-10-18T10:15:00Z',
    status: 'QUEUED_FOR_RETRAINING',
    documentType: 'KHATAUNI'
  },
  {
    id: 'ALT_002',
    fieldKey: 'plotAreaOriginal',
    fieldLabel: 'Area / क्षेत्र (गुंठे)',
    originalOcrText: '०.८२.०० (OCR merged digits)',
    correctedText: '०.८२.००',
    language: 'Marathi (मराठी)',
    script: 'Modi/Devanagari',
    confidenceBefore: 58.0,
    correctedBy: 'Talathi S. Deshmukh',
    correctedAt: '2024-10-18T11:00:00Z',
    status: 'INCLUDED_IN_EPOCH',
    documentType: 'SATBARA_7_12'
  }
];

const DEFAULT_MODEL_METRICS: ModelMetrics = {
  modelVersion: 'BhoomiVision-v3.4-Transformer',
  overallAccuracyPercent: 96.4,
  printedAccuracyPercent: 98.2,
  handwrittenAccuracyPercent: 86.8,
  characterErrorRatePercent: 1.8,
  wordErrorRatePercent: 3.4,
  totalTokensTrained: 1845000,
  feedbackBatchesProcessed: 42,
  accuracyTrend: [
    { epoch: 1, accuracy: 88.2, date: '2024-05-01' },
    { epoch: 10, accuracy: 91.5, date: '2024-06-15' },
    { epoch: 20, accuracy: 93.8, date: '2024-08-01' },
    { epoch: 30, accuracy: 95.1, date: '2024-09-15' },
    { epoch: 42, accuracy: 96.4, date: '2024-10-18' }
  ],
  confusionMatrixSample: [
    { expected: '४ (4)', predicted: '५ (5)', count: 24 },
    { expected: '८ (8)', predicted: '३ (3)', count: 18 },
    { expected: 'ण (N)', predicted: 'ग (G)', count: 12 },
    { expected: 'क (K)', predicted: 'फ (Ph)', count: 9 }
  ]
};

interface LandRecordContextType {
  records: LandRecord[];
  activeRecord: LandRecord | null;
  setActiveRecordId: (id: string) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  uiLanguage: LanguageCode;
  setUiLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey) => string;
  selectedBoundingBoxId: string | null;
  setSelectedBoundingBoxId: (id: string | null) => void;
  auditChain: AuditBlock[];
  activeLearningTokens: CorrectedToken[];
  modelMetrics: ModelMetrics;
  
  // Actions
  updateActiveRecord: (updates: Partial<LandRecord>) => void;
  updateRecordField: (fieldKey: string, newValue: any) => void;
  updateBoundingBox: (boxId: string, updates: Partial<BoundingBox>) => void;
  runOcrExtraction: (recordId: string) => Promise<void>;
  applyPreprocessing: (config: PreprocessingConfig) => void;
  approveByPatwari: (notes?: string) => Promise<void>;
  approveByTehsildar: () => Promise<void>;
  rejectRecord: (reason: string) => Promise<void>;
  addNewRecord: (newRec: LandRecord) => Promise<void>;
  queueActiveLearningCorrection: (originalText: string, correctedText: string, fieldKey: string, fieldLabel: string) => void;
  retrainModelBatch: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  resetToFactoryDefaults: () => void;
}

const LandRecordContext = createContext<LandRecordContextType | undefined>(undefined);

export const LandRecordProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistent State Initializers
  const [records, setRecords] = useState<LandRecord[]>(() =>
    loadFromLocalStorage(STORAGE_KEYS.RECORDS, SAMPLE_LAND_RECORDS)
  );

  const [activeRecordId, setActiveRecordIdState] = useState<string>(() =>
    loadFromLocalStorage(STORAGE_KEYS.ACTIVE_RECORD_ID, SAMPLE_LAND_RECORDS[0]?.id || '')
  );

  const [activeTab, setActiveTab] = useState<ActiveTab>(() =>
    loadFromLocalStorage(STORAGE_KEYS.ACTIVE_TAB, 'DASHBOARD')
  );

  const [userRole, setUserRole] = useState<UserRole>(() =>
    loadFromLocalStorage(STORAGE_KEYS.USER_ROLE, 'PATWARI')
  );

  const [uiLanguage, setUiLanguage] = useState<LanguageCode>(() =>
    loadFromLocalStorage(STORAGE_KEYS.UI_LANGUAGE, 'en')
  );

  const [selectedBoundingBoxId, setSelectedBoundingBoxId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [auditChain, setAuditChain] = useState<AuditBlock[]>(() =>
    loadFromLocalStorage(STORAGE_KEYS.AUDIT_CHAIN, [])
  );

  const [activeLearningTokens, setActiveLearningTokens] = useState<CorrectedToken[]>(() =>
    loadFromLocalStorage(STORAGE_KEYS.ACTIVE_LEARNING, DEFAULT_LEARNING_TOKENS)
  );

  const [modelMetrics, setModelMetrics] = useState<ModelMetrics>(() =>
    loadFromLocalStorage(STORAGE_KEYS.MODEL_METRICS, DEFAULT_MODEL_METRICS)
  );

  // Sync to LocalStorage whenever state changes
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.RECORDS, records);
  }, [records]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.ACTIVE_RECORD_ID, activeRecordId);
  }, [activeRecordId]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.ACTIVE_TAB, activeTab);
  }, [activeTab]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.USER_ROLE, userRole);
  }, [userRole]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.UI_LANGUAGE, uiLanguage);
  }, [uiLanguage]);

  useEffect(() => {
    if (auditChain && auditChain.length > 0) {
      saveToLocalStorage(STORAGE_KEYS.AUDIT_CHAIN, auditChain);
    }
  }, [auditChain]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.ACTIVE_LEARNING, activeLearningTokens);
  }, [activeLearningTokens]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.MODEL_METRICS, modelMetrics);
  }, [modelMetrics]);

  // Initialize genesis audit block on mount if ledger is empty
  useEffect(() => {
    async function initAudit() {
      if (!auditChain || auditChain.length === 0) {
        const genesis = await createAuditBlock(
          null,
          'GENESIS',
          'SYSTEM_GENESIS_ROOT',
          'DOCUMENT_INGESTED',
          'System Initialization Daemon',
          'SYSTEM',
          'Root Ledger Authority',
          'Initial DILRMP Blockchain Genesis Block Initialized.'
        );
        setAuditChain([genesis]);
        saveToLocalStorage(STORAGE_KEYS.AUDIT_CHAIN, [genesis]);
      }
    }
    initAudit();
  }, []);

  const activeRecord = records.find(r => r.id === activeRecordId) || records[0] || null;

  const setActiveRecordId = (id: string) => {
    setActiveRecordIdState(id);
    setSelectedBoundingBoxId(null);
  };

  const updateActiveRecord = (updates: Partial<LandRecord>) => {
    if (!activeRecord) return;
    setRecords(prev => prev.map(rec => {
      if (rec.id === activeRecord.id) {
        const updated = { ...rec, ...updates };
        updated.validationIssues = validateLandRecord(updated, prev);
        return updated;
      }
      return rec;
    }));
  };

  const updateRecordField = (fieldKey: string, newValue: any) => {
    if (!activeRecord) return;
    const updates: any = { [fieldKey]: newValue };
    updateActiveRecord(updates);
  };

  const updateBoundingBox = (boxId: string, updates: Partial<BoundingBox>) => {
    if (!activeRecord) return;
    const updatedBoxes = activeRecord.ocrBoundingBoxes.map(b => {
      if (b.id === boxId) {
        return { ...b, ...updates, isCorrected: true };
      }
      return b;
    });
    updateActiveRecord({ ocrBoundingBoxes: updatedBoxes });
  };

  const applyPreprocessing = (config: PreprocessingConfig) => {
    if (!activeRecord) return;
    updateActiveRecord({ preprocessingConfig: config });
  };

  const runOcrExtraction = async (recordId: string) => {
    const target = records.find(r => r.id === recordId);
    if (!target) return;

    // Simulate Deep Vision Transformer OCR Extraction
    const recheckedIssues = validateLandRecord(target, records);
    setRecords(prev => prev.map(r => {
      if (r.id === recordId) {
        return {
          ...r,
          status: 'EXTRACTED',
          processedAt: new Date().toISOString(),
          validationIssues: recheckedIssues,
          overallConfidence: 95.5
        };
      }
      return r;
    }));

    // Add Audit Log
    const lastBlock = auditChain[auditChain.length - 1] || null;
    const newBlock = await createAuditBlock(
      lastBlock,
      target.id,
      target.recordNumber,
      'OCR_EXTRACTION_COMPLETED',
      'AI Vision Engine (LayoutLMv3)',
      'AI_SERVICE',
      'Multilingual OCR Classifier',
      `Completed OCR and field classification with ${target.ocrBoundingBoxes.length} extracted bounding polygons.`
    );
    setAuditChain(prev => [...prev, newBlock]);
  };

  const approveByPatwari = async (notes?: string) => {
    if (!activeRecord) return;
    const updated: Partial<LandRecord> = {
      status: 'VERIFIED_PATWARI',
      verifiedByPatwari: {
        patwariName: 'Rajesh Kumar Verma',
        patwariId: 'REV-PAT-LKO-4401',
        verifiedAt: new Date().toISOString(),
        notes: notes || 'Verified with physical Jamabandi ledger and field boundary inspection.'
      }
    };
    updateActiveRecord(updated);

    const lastBlock = auditChain[auditChain.length - 1] || null;
    const newBlock = await createAuditBlock(
      lastBlock,
      activeRecord.id,
      activeRecord.recordNumber,
      'PATWARI_VERIFICATION_SAVED',
      'Rajesh Kumar Verma',
      'PATWARI',
      'Revenue Inspector / Patwari (Halka 14)',
      `Field verification completed and record forwarded to Sub-Divisional Magistrate / Tehsildar.`
    );
    setAuditChain(prev => [...prev, newBlock]);
  };

  const approveByTehsildar = async () => {
    if (!activeRecord) return;
    const sigHash = `SHA256:TEH:${activeRecord.id}:${Date.now()}:GOVT-UP-APPROVED`;
    const updated: Partial<LandRecord> = {
      status: 'APPROVED_TEHSILDAR',
      approvedByTehsildar: {
        tehsildarName: 'Anil Varma, PCS',
        tehsildarId: 'TEH-SDM-MHL-001',
        approvedAt: new Date().toISOString(),
        digitalSignatureHash: sigHash
      }
    };
    updateActiveRecord(updated);

    const lastBlock = auditChain[auditChain.length - 1] || null;
    const newBlock = await createAuditBlock(
      lastBlock,
      activeRecord.id,
      activeRecord.recordNumber,
      'TEHSILDAR_DIGITAL_SIGNATURE',
      'Anil Varma, PCS',
      'TEHSILDAR',
      'Sub-Divisional Magistrate / Tehsildar',
      `Record legally approved with NIC Digital Signature. Synchronized to Central DILRMP Database.`,
      sigHash
    );
    setAuditChain(prev => [...prev, newBlock]);
  };

  const rejectRecord = async (reason: string) => {
    if (!activeRecord) return;
    updateActiveRecord({ status: 'REJECTED' });

    const lastBlock = auditChain[auditChain.length - 1] || null;
    const newBlock = await createAuditBlock(
      lastBlock,
      activeRecord.id,
      activeRecord.recordNumber,
      'ANOMALY_FLAGGED',
      'Revenue Authority',
      userRole,
      'Reviewing Officer',
      `Record rejected due to: ${reason}`
    );
    setAuditChain(prev => [...prev, newBlock]);
  };

  const addNewRecord = async (newRec: LandRecord) => {
    newRec.validationIssues = validateLandRecord(newRec, records);
    setRecords(prev => [newRec, ...prev]);
    setActiveRecordIdState(newRec.id);
    setActiveTab('SPLIT_VERIFY');

    const lastBlock = auditChain[auditChain.length - 1] || null;
    const newBlock = await createAuditBlock(
      lastBlock,
      newRec.id,
      newRec.recordNumber,
      'DOCUMENT_INGESTED',
      'Data Entry Operator',
      'OPERATOR',
      'Digitization Center Operator',
      `Ingested new document ${newRec.originalFileName} for AI digitization.`
    );
    setAuditChain(prev => [...prev, newBlock]);
  };

  const queueActiveLearningCorrection = (originalText: string, correctedText: string, fieldKey: string, fieldLabel: string) => {
    const newTok: CorrectedToken = {
      id: `ALT_${Date.now()}`,
      fieldKey,
      fieldLabel,
      originalOcrText: originalText,
      correctedText,
      language: activeRecord?.documentLanguage === 'hi' ? 'Hindi' : 'Regional Language',
      script: 'Devanagari',
      confidenceBefore: 65,
      correctedBy: `${userRole} Operator`,
      correctedAt: new Date().toISOString(),
      status: 'QUEUED_FOR_RETRAINING',
      documentType: activeRecord?.documentType || 'KHATAUNI'
    };
    setActiveLearningTokens(prev => [newTok, ...prev]);
  };

  const retrainModelBatch = () => {
    setActiveLearningTokens(prev => prev.map(tok => ({ ...tok, status: 'DEPLOYED' })));
    setModelMetrics(prev => ({
      ...prev,
      overallAccuracyPercent: Math.min(99.4, Number((prev.overallAccuracyPercent + 0.35).toFixed(2))),
      feedbackBatchesProcessed: prev.feedbackBatchesProcessed + 1,
      totalTokensTrained: prev.totalTokensTrained + activeLearningTokens.length * 120,
      accuracyTrend: [
        ...prev.accuracyTrend,
        {
          epoch: prev.accuracyTrend.length + 1,
          accuracy: Math.min(99.4, Number((prev.overallAccuracyPercent + 0.35).toFixed(2))),
          date: new Date().toISOString().split('T')[0]
        }
      ]
    }));
  };

  const resetToFactoryDefaults = () => {
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach(k => {
        try {
          localStorage.removeItem(k);
        } catch (e) {}
      });
    }
    setRecords(SAMPLE_LAND_RECORDS);
    setActiveRecordIdState(SAMPLE_LAND_RECORDS[0].id);
    setActiveTab('DASHBOARD');
    setUserRole('PATWARI');
    setUiLanguage('en');
    setActiveLearningTokens(DEFAULT_LEARNING_TOKENS);
    setModelMetrics(DEFAULT_MODEL_METRICS);
    createAuditBlock(
      null,
      'GENESIS',
      'SYSTEM_GENESIS_ROOT',
      'DOCUMENT_INGESTED',
      'System Initialization Daemon',
      'SYSTEM',
      'Root Ledger Authority',
      'Initial DILRMP Blockchain Genesis Block Initialized.'
    ).then(genesis => {
      setAuditChain([genesis]);
      saveToLocalStorage(STORAGE_KEYS.AUDIT_CHAIN, [genesis]);
    });
  };

  const t = useCallback((key: TranslationKey) => {
    return getTranslation(uiLanguage, key);
  }, [uiLanguage]);

  return (
    <LandRecordContext.Provider
      value={{
        records,
        activeRecord,
        setActiveRecordId,
        activeTab,
        setActiveTab,
        userRole,
        setUserRole,
        uiLanguage,
        setUiLanguage,
        t,
        selectedBoundingBoxId,
        setSelectedBoundingBoxId,
        auditChain,
        activeLearningTokens,
        modelMetrics,
        updateActiveRecord,
        updateRecordField,
        updateBoundingBox,
        runOcrExtraction,
        applyPreprocessing,
        approveByPatwari,
        approveByTehsildar,
        rejectRecord,
        addNewRecord,
        queueActiveLearningCorrection,
        retrainModelBatch,
        searchQuery,
        setSearchQuery,
        resetToFactoryDefaults
      }}
    >
      {children}
    </LandRecordContext.Provider>
  );
};

export const useLandRecord = () => {
  const context = useContext(LandRecordContext);
  if (!context) {
    throw new Error('useLandRecord must be used within a LandRecordProvider');
  }
  return context;
};
