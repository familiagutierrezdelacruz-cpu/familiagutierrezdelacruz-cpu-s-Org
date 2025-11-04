// types.ts

export type AttentionType = 'CONSULTA GENERAL' | 'CONTROL DE CRONICOS' | 'ATENCION PRENATAL' | 'NIÑO SANO';

// NEW: SuperAdmin for top-level management
export interface SuperAdmin {
  id: string;
  name: string;
  password?: string;
}

// NEW: HealthUnit represents a clinic or hospital
export interface HealthUnit {
  id: string;
  name: string;
  address: string;
  phone: string;
  slogan?: string;
  logo?: string; // base64 string
}

// NEW: HealthUnitAdmin manages a specific HealthUnit
export interface HealthUnitAdmin {
  id: string;
  healthUnitId: string;
  name:string;
  password?: string;
}

// MODIFIED: Doctor is now tied to a HealthUnit
export interface Doctor {
  id: string;
  healthUnitId: string;
  name: string;
  professionalLicense: string;
  university: string;
  diplomados?: string;
  hasSpecialty: boolean;
  specialtyName?: string;
  specialtyLicense?: string;
  password?: string;
}

// MODIFIED: Nurse is now tied to a HealthUnit
export interface Nurse {
  id: string;
  healthUnitId: string;
  name: string;
  password?: string;
}

// MODIFIED: Patient is now tied to a HealthUnit
export interface Patient {
  id: string;
  doctorId: string;
  healthUnitId: string;
  patientCode?: string; // Código único del paciente (ej: P-001)
  name: string;
  dob: string; // YYYY-MM-DD
  gender: 'Masculino' | 'Femenino' | 'Otro';
  contact: string;
  allergies?: string;
  familyHistory?: string;
  pathologicalHistory?: string;
  nonPathologicalHistory?: string;
  surgicalHistory?: string;
  // Gynecological fields
  gynecologicalHistory?: string;
  lastPapanicolaou?: string; // YYYY-MM-DD
  lastColposcopy?: string; // YYYY-MM-DD
}

export interface VitalSigns {
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  glucose?: number;
  weight?: number;
  height?: number;
  bmi?: string;
  bmiInterpretation?: string;
  map?: number; // Tensión Arterial Media
}

export interface Medication {
  name: string;
  indication: string;
  route: 'ORAL' | 'INTRAMUSCULAR' | 'INTRAVENOSA' | 'TÓPICA' | 'SUBLINGUAL' | 'OFTÁLMICA' | 'ÓTICA' | 'NASAL' | 'VAGINAL' | 'RECTAL';
}

export interface Prescription {
  medications: Medication[];
  instructions?: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // ISO string
  reason: string;
  attentionType?: AttentionType;
  visitType?: 'PRIMERA VEZ' | 'SUBSECUENTE';
  status?: 'TRIAGE' | 'COMPLETED'; // For nursing workflow
  triageBy?: string; // e.g., 'ENFERMERIA'
  vitalSigns?: VitalSigns;
  physicalExam?: string;
  diagnosis: string;
  prescription: Prescription;
  labStudies?: string;
  nextAppointment?: string; // YYYY-MM-DD
  cost?: number;
  ultrasoundReportType?: string;
  ultrasoundReportFindings?: string;
  ultrasoundReportImpression?: string;
  ultrasoundImages?: string[]; // Array of base64 strings
  // Prenatal fields
  gestas?: number;
  partos?: number;
  abortos?: number;
  cesareas?: number;
  fur?: string; // Fecha de Última Regla (YYYY-MM-DD)
  fpp?: string; // Fecha Probable de Parto (YYYY-MM-DD) calculated by FUR
  sdg?: string; // Semanas de Gestación (calculated by FUR)
  fcf?: number; // Frecuencia Cardiaca Fetal
  afu?: number; // Altura de Fondo Uterino (cm)
  usgDate?: string; // Fecha del ultrasonido para cálculo
  usgWeeks?: number; // Semanas reportadas en el USG
  usgDays?: number; // Días reportados en el USG
  sdgByUsg?: string; // SDG actual calculado por USG
  fppByUsg?: string; // FPP calculado por USG
}

// MODIFIED: AppSettings is simplified as ClinicInfo is now in HealthUnit
export interface AppSettings {
  medicationsUrl: string;
}
