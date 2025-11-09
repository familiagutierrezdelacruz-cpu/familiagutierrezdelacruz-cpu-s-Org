import React, { useState, useMemo } from 'react';
import { Patient, Consultation, Doctor, HealthUnit, VitalSigns } from '../types';
import Modal from './Modal';
import PatientForm from './PatientForm';
import ConsultationForm from './ConsultationForm';
import ConfirmationModal from './ConfirmationModal';
import PrintablePrescription from './PrintablePrescription';
import PrintableUltrasoundReport from './PrintableUltrasoundReport';
import PrintablePatientHistory from './PrintablePatientHistory';
import PrintableAINote from './PrintableAINote';
import PrintableIMSSNote from './PrintableIMSSNote';
import NewWindow from './NewWindow';
import { generateAIMedicalNote } from '../services/geminiService';
import { calculateAge, parseLocalDate } from '../utils/dateUtils';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { PrintIcon } from './icons/PrintIcon';
import { ClipboardDocumentListIcon } from './icons/ClipboardDocumentListIcon';
import { DocumentSparklesIcon } from './icons/DocumentSparklesIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { DocumentDuplicateIcon } from './icons/DocumentDuplicateIcon';


interface PatientDetailProps {
  patient: Patient;
  consultations: Consultation[];
  doctor: Doctor;
  healthUnit: HealthUnit;
  medications: string[];
  onBack: () => void;
  onUpdatePatient: (patient: Patient) => void;
  onDeletePatient: (patientId: string) => void;
  onAddConsultation: (consultation: Omit<Consultation, 'id'> | Consultation) => void;
  onUpdateConsultation: (consultation: Consultation) => void;
  onDeleteConsultation: (consultationId: string) => void;
}

const VitalSignsDisplay: React.FC<{ vitals: VitalSigns }> = ({ vitals }) => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs">
        {vitals.systolicBP && vitals.diastolicBP && <p><span className="font-semibold">T.A.:</span> {vitals.systolicBP}/{vitals.diastolicBP} mmHg</p>}
        {vitals.map && <p><span className="font-semibold">T.A.M.:</span> {vitals.map.toFixed(1)} mmHg</p>}
        {vitals.heartRate && <p><span className="font-semibold">F.C.:</span> {vitals.heartRate} lpm</p>}
        {vitals.respiratoryRate && <p><span className="font-semibold">F.R.:</span> {vitals.respiratoryRate} rpm</p>}
        {vitals.temperature && <p><span className="font-semibold">Temp:</span> {vitals.temperature} °C</p>}
        {vitals.oxygenSaturation && <p><span className="font-semibold">Sat O₂:</span> {vitals.oxygenSaturation} %</p>}
        {vitals.glucose && <p><span className="font-semibold">Glucosa:</span> {vitals.glucose} mg/dL</p>}
        {vitals.weight && <p><span className="font-semibold">Peso:</span> {vitals.weight} kg</p>}
        {vitals.height && <p><span className="font-semibold">Talla:</span> {vitals.height} m</p>}
        {vitals.bmi && <p className="col-span-1"><span className="font-semibold">IMC:</span> {vitals.bmi} <span className="text-xs">({vitals.bmiInterpretation})</span></p>}
    </div>
);

const PatientDetail: React.FC<PatientDetailProps> = ({
  patient,
  consultations,
  doctor,
  healthUnit,
  medications,
  onBack,
  onUpdatePatient,
  onDeletePatient,
  onAddConsultation,
  onUpdateConsultation,
  onDeleteConsultation,
}) => {
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | undefined>(undefined);
  const [consultationToDelete, setConsultationToDelete] = useState<Consultation | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  
  const [printingComponent, setPrintingComponent] = useState<React.ReactNode | null>(null);
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [viewingAINote, setViewingAINote] = useState<Consultation | null>(null);

  const sortedConsultations = useMemo(() => 
    [...consultations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
    [consultations]
  );
  
  const handleEditPatient = () => setIsPatientModalOpen(true);
  const handleAddNewConsultation = () => {
    setEditingConsultation(undefined);
    setIsConsultationModalOpen(true);
  };
  const handleEditConsultation = (consultation: Consultation) => {
    setEditingConsultation(consultation);
    setIsConsultationModalOpen(true);
  };
  
  const handleSaveConsultation = (consultationData: Omit<Consultation, 'id'> | Consultation) => {
    if ('id' in consultationData) {
      onUpdateConsultation(consultationData as Consultation);
    } else {
      onAddConsultation(consultationData);
    }
    setIsConsultationModalOpen(false);
  };
  
  const confirmDeletePatient = () => {
    if (patientToDelete) {
      onDeletePatient(patientToDelete.id);
      setPatientToDelete(null);
    }
  };
  
  const confirmDeleteConsultation = () => {
    if (consultationToDelete) {
      onDeleteConsultation(consultationToDelete.id);
      setConsultationToDelete(null);
    }
  };

  const handlePrint = (component: React.ReactNode) => {
    setPrintingComponent(component);
  };

  const handleGenerateOrViewNote = async (consultation: Consultation, regenerate = false) => {
    if (consultation.aiMedicalNote && !regenerate) {
        setViewingAINote(consultation);
        return;
    }
    setIsGeneratingNote(true);
    // If modal is not open, open it to show loading state
    if (!viewingAINote) {
        setViewingAINote(consultation);
    }

    const note = await generateAIMedicalNote(patient, consultation);
    const updatedConsultation = { ...consultation, aiMedicalNote: note };
    onUpdateConsultation(updatedConsultation);

    // Update the consultation being viewed with the new note
    setViewingAINote(updatedConsultation);
    setIsGeneratingNote(false);
  };

  const patientAge = calculateAge(patient.dob);
  
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
      <header className="mb-4 pb-4 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
          <div>
            <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-2">
              <ChevronLeftIcon className="w-5 h-5" />
              <span>Volver a la Lista</span>
            </button>
            <h1 className="text-3xl font-bold text-slate-800">{patient.name}</h1>
            <p className="text-slate-500">
                {patient.patientCode && <span className="font-mono bg-slate-100 px-2 py-1 rounded-md text-sm">{patient.patientCode}</span>}
                <span className="mx-2">|</span>
                {patientAge}
                <span className="mx-2">|</span>
                {patient.gender}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button onClick={handleEditPatient} className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200">
              <PencilIcon className="w-4 h-4" /><span>Editar Paciente</span>
            </button>
            <button onClick={() => setPatientToDelete(patient)} className="flex items-center gap-2 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200">
              <TrashIcon className="w-4 h-4" /><span>Eliminar Paciente</span>
            </button>
          </div>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4 text-sm">
          <div className="p-4 border rounded-md bg-slate-50">
            <h3 className="font-bold text-slate-700 mb-2 border-b pb-1">Información de Contacto</h3>
            <p><span className="font-semibold">Tel/Email:</span> {patient.contact}</p>
            {patient.curp && <p><span className="font-semibold">CURP:</span> {patient.curp}</p>}
          </div>
          <div className="p-4 border rounded-md bg-slate-50 max-h-96 overflow-y-auto">
            <h3 className="font-bold text-slate-700 mb-2 border-b pb-1">Antecedentes Médicos</h3>
             <p><span className="font-semibold">Alergias:</span> {patient.allergies || 'Ninguna'}</p>
             <p><span className="font-semibold">A. Familiares:</span> {patient.familyHistory || 'No registrados'}</p>
             <p><span className="font-semibold">A. Patológicos:</span> {patient.pathologicalHistory || 'No registrados'}</p>
             <p><span className="font-semibold">A. No Patológicos:</span> {patient.nonPathologicalHistory || 'No registrados'}</p>
             <p><span className="font-semibold">A. Quirúrgicos:</span> {patient.surgicalHistory || 'No registrados'}</p>
             {patient.gender === 'Femenino' && <p><span className="font-semibold">A. Ginecológicos:</span> {patient.gynecologicalHistory || 'No registrados'}</p>}
          </div>
          <button onClick={() => handlePrint(<PrintablePatientHistory patient={patient} doctor={doctor} consultations={consultations} healthUnit={healthUnit} />)} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300">
              <ClipboardDocumentListIcon className="w-4 h-4" />
              <span>Imprimir Historia Clínica</span>
            </button>
        </div>
        
        <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-700">Historial de Consultas</h2>
                <button onClick={handleAddNewConsultation} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <PlusIcon className="w-5 h-5" />
                    <span>Nueva Consulta</span>
                </button>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {sortedConsultations.map(c => (
                    <div key={c.id} className="p-4 border rounded-lg bg-white shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">{new Date(c.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                                <p className="text-sm text-slate-500">{c.attentionType || 'Consulta General'}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => handleEditConsultation(c)} className="p-2 text-slate-500 hover:text-blue-600"><PencilIcon className="w-4 h-4"/></button>
                                <button onClick={() => setConsultationToDelete(c)} className="p-2 text-slate-500 hover:text-red-600"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        </div>
                        <div className="mt-3 space-y-2 text-sm">
                            <p><span className="font-semibold">Motivo:</span> {c.reason}</p>
                            <p><span className="font-semibold">Diagnóstico:</span> {c.diagnosis}</p>
                            {c.vitalSigns && Object.keys(c.vitalSigns).length > 0 && <VitalSignsDisplay vitals={c.vitalSigns} />}
                        </div>
                        <div className="mt-4 pt-3 border-t flex flex-wrap gap-2">
                            <button onClick={() => handlePrint(<PrintablePrescription patient={patient} doctor={doctor} consultation={c} healthUnit={healthUnit} />)} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200">
                                <PrintIcon className="w-4 h-4"/> Receta
                            </button>
                             <button onClick={() => handlePrint(<PrintableIMSSNote patient={patient} doctor={doctor} consultation={c} healthUnit={healthUnit} />)} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200">
                                <DocumentDuplicateIcon className="w-4 h-4"/> Nota IMSS
                            </button>
                            {c.ultrasoundReportType && <button onClick={() => handlePrint(<PrintableUltrasoundReport patient={patient} doctor={doctor} consultation={c} healthUnit={healthUnit} />)} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200">
                               <DocumentTextIcon className="w-4 h-4"/> Reporte USG
                            </button>}
                            <button onClick={() => handleGenerateOrViewNote(c)} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100">
                                <DocumentSparklesIcon className="w-4 h-4"/>
                                {c.aiMedicalNote ? 'Ver Nota IA' : 'Generar Nota IA'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <Modal isOpen={isPatientModalOpen} onClose={() => setIsPatientModalOpen(false)} size="2xl">
        <PatientForm patient={patient} onSave={(p) => { onUpdatePatient(p as Patient); setIsPatientModalOpen(false); }} onCancel={() => setIsPatientModalOpen(false)} />
      </Modal>

      <Modal isOpen={isConsultationModalOpen} onClose={() => setIsConsultationModalOpen(false)} size="4xl">
        <ConsultationForm patient={patient} doctor={doctor} consultation={editingConsultation} patientConsultations={consultations} medications={medications} onSave={handleSaveConsultation} onCancel={() => setIsConsultationModalOpen(false)} />
      </Modal>

      {viewingAINote && (
          <Modal isOpen={!!viewingAINote} onClose={() => setViewingAINote(null)} size="3xl">
              <div className="p-2">
                  <h3 className="text-2xl font-bold text-slate-800">Nota Médica (IA)</h3>
                  <p className="text-sm text-slate-500 mb-4">Consulta del {new Date(viewingAINote.date).toLocaleDateString('es-MX', { dateStyle: 'long' })}</p>
                  
                  <div className="max-h-[60vh] overflow-y-auto p-4 bg-slate-50 border rounded-md">
                      {isGeneratingNote ? (
                          <div className="flex items-center justify-center h-48">
                              <RefreshIcon className="w-8 h-8 text-blue-600 animate-spin" />
                              <p className="ml-3 text-slate-600">Generando nota, por favor espere...</p>
                          </div>
                      ) : (
                          <pre className="text-sm whitespace-pre-wrap font-sans">{viewingAINote.aiMedicalNote || 'No se ha generado una nota aún.'}</pre>
                      )}
                  </div>

                  <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
                      <button onClick={() => handleGenerateOrViewNote(viewingAINote, true)} disabled={isGeneratingNote} className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 disabled:opacity-50">
                          <RefreshIcon className={`w-4 h-4 ${isGeneratingNote ? 'animate-spin' : ''}`} />
                          <span>{isGeneratingNote ? 'Regenerando...' : 'Regenerar'}</span>
                      </button>
                      <button onClick={() => handlePrint(<PrintableAINote patient={patient} doctor={doctor} consultation={viewingAINote} healthUnit={healthUnit} noteContent={viewingAINote.aiMedicalNote!} />)} disabled={!viewingAINote.aiMedicalNote} className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 disabled:opacity-50">
                          <PrintIcon className="w-4 h-4"/>
                          <span>Imprimir</span>
                      </button>
                      <button onClick={() => setViewingAINote(null)} className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700">
                        Cerrar
                      </button>
                  </div>
              </div>
          </Modal>
      )}

      <ConfirmationModal isOpen={!!patientToDelete} onClose={() => setPatientToDelete(null)} onConfirm={confirmDeletePatient} title="Eliminar Paciente" confirmButtonText="Sí, Eliminar Paciente">
        ¿Está seguro de que desea eliminar a <strong>{patientToDelete?.name}</strong>? Esta acción es irreversible y borrará todo su historial.
      </ConfirmationModal>

      <ConfirmationModal isOpen={!!consultationToDelete} onClose={() => setConsultationToDelete(null)} onConfirm={confirmDeleteConsultation} title="Eliminar Consulta" confirmButtonText="Sí, Eliminar">
        ¿Está seguro de que desea eliminar la consulta del <strong>{consultationToDelete && new Date(consultationToDelete.date).toLocaleDateString('es-MX')}</strong>?
      </ConfirmationModal>
      
      {printingComponent && <NewWindow onClose={() => setPrintingComponent(null)}>{printingComponent}</NewWindow>}
    </div>
  );
};

export default PatientDetail;