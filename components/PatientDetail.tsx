import React, { useState, useMemo } from 'react';
import { Patient, Doctor, Consultation, ClinicInfo } from '../types';
import { calculateAge } from '../utils/dateUtils';
import Modal from './Modal';
import PatientForm from './PatientForm';
import ConsultationForm from './ConsultationForm';
import NewWindow from './NewWindow';
import PrintablePrescription from './PrintablePrescription';
import PrintableUltrasoundReport from './PrintableUltrasoundReport';
import PrintablePatientHistory from './PrintablePatientHistory';
import EvolutionChart from './EvolutionChart';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { PencilIcon } from './icons/PencilIcon';
import { PlusIcon } from './icons/PlusIcon';
import { PrintIcon } from './icons/PrintIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { ClipboardDocumentListIcon } from './icons/ClipboardDocumentListIcon';
import { ChartBarSquareIcon } from './icons/ChartBarSquareIcon';
import { MinusIcon } from './icons/MinusIcon';
import { ChartPieIcon } from './icons/ChartPieIcon';

interface PatientDetailProps {
  patient: Patient;
  consultations: Consultation[];
  doctor: Doctor;
  clinicInfo?: ClinicInfo;
  medications: string[];
  onBack: () => void;
  onUpdatePatient: (patient: Patient) => void;
  onAddConsultation: (consultation: Omit<Consultation, 'id'>) => void;
  onUpdateConsultation: (consultation: Consultation) => void;
}

const PatientDetail: React.FC<PatientDetailProps> = ({
  patient,
  consultations,
  doctor,
  clinicInfo,
  medications,
  onBack,
  onUpdatePatient,
  onAddConsultation,
  onUpdateConsultation,
}) => {
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  
  const [isPrinting, setIsPrinting] = useState<null | 'prescription' | 'ultrasound' | 'history'>(null);
  const [consultationToPrint, setConsultationToPrint] = useState<Consultation | null>(null);
  const [isChartsModalOpen, setIsChartsModalOpen] = useState(false);
  
  const [expandedConsultationId, setExpandedConsultationId] = useState<string | null>(null);

  const sortedConsultations = useMemo(() => {
    return [...consultations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [consultations]);

  const patientAge = useMemo(() => calculateAge(patient.dob), [patient.dob]);

  const handleEditPatient = () => setIsPatientModalOpen(true);
  
  const handleSavePatient = (patientData: Omit<Patient, 'id' | 'doctorId' | 'patientCode'> | Patient) => {
    onUpdatePatient(patientData as Patient);
    setIsPatientModalOpen(false);
  };
  
  const handleNewConsultation = () => {
    setEditingConsultation(null);
    setIsConsultationModalOpen(true);
  };

  const handleEditConsultation = (consult: Consultation) => {
    setEditingConsultation(consult);
    setIsConsultationModalOpen(true);
  };
  
  const handleSaveConsultation = (consultationData: Omit<Consultation, 'id'> | Consultation) => {
    if ('id' in consultationData) {
      onUpdateConsultation(consultationData as Consultation);
    } else {
      onAddConsultation(consultationData);
    }
    setIsConsultationModalOpen(false);
    setEditingConsultation(null);
  };
  
  const handlePrintPrescription = (consult: Consultation) => {
    setConsultationToPrint(consult);
    setIsPrinting('prescription');
  };

  const handlePrintUltrasound = (consult: Consultation) => {
    setConsultationToPrint(consult);
    setIsPrinting('ultrasound');
  };

  const handlePrintHistory = () => {
    setIsPrinting('history');
  };
  
  const getVitalSignEvolution = (key: keyof import('../types').VitalSigns) => {
    return sortedConsultations
      .filter(c => c.vitalSigns && c.vitalSigns[key] != null)
      .map(c => ({
          label: new Date(c.date).toLocaleDateString('es-MX'),
          value: c.vitalSigns![key] as number,
      }))
      .reverse(); // Reverse to show oldest to newest
  };

  const getBloodPressureEvolution = () => {
     const data = sortedConsultations
      .filter(c => c.vitalSigns && c.vitalSigns.systolicBP != null && c.vitalSigns.diastolicBP != null)
      .map(c => ({
        label: new Date(c.date).toLocaleDateString('es-MX'),
        systolic: c.vitalSigns!.systolicBP as number,
        diastolic: c.vitalSigns!.diastolicBP as number
      }))
      .reverse();
    return {
        systolic: data.map(d => ({ label: d.label, value: d.systolic })),
        diastolic: data.map(d => ({ label: d.label, value: d.diastolic })),
    }
  };
  
  const toggleConsultationDetails = (id: string) => {
      setExpandedConsultationId(prevId => (prevId === id ? null : id));
  };

  const getBPStatus = (systolic?: number, diastolic?: number) => {
    if (systolic === undefined || diastolic === undefined) return { text: '', color: 'text-slate-500' };
    if (systolic < 90 || diastolic < 60) return { text: 'Hipotensión', color: 'text-blue-600' };
    if (systolic >= 140 || diastolic >= 90) return { text: 'Hipertensión', color: 'text-red-600' };
    if (systolic >= 130 || diastolic >= 80) return { text: 'Elevada', color: 'text-yellow-600' };
    return { text: 'Normal', color: 'text-green-600' };
  };

  const getBMIStatusColor = (interpretation?: string) => {
      if (!interpretation) return 'text-slate-500';
      if (interpretation === 'Bajo peso') return 'text-blue-500';
      if (interpretation === 'Normal') return 'text-green-600';
      if (interpretation === 'Sobrepeso') return 'text-yellow-600';
      if (interpretation === 'Obesidad') return 'text-red-600';
      return 'text-slate-500';
  };

  const prenatalConsultations = useMemo(() => {
    return sortedConsultations.filter(c => c.attentionType === 'ATENCION PRENATAL');
  }, [sortedConsultations]);

  const getPrenatalEvolution = (key: keyof Consultation | keyof import('../types').VitalSigns) => {
    return prenatalConsultations
      .filter(c => {
        if (['weight', 'map'].includes(key as string)) {
          return c.vitalSigns && c.vitalSigns[key as keyof import('../types').VitalSigns] != null;
        }
        return c[key as keyof Consultation] != null;
      })
      .map(c => {
         let value: number;
         if (['weight', 'map'].includes(key as string)) {
            value = c.vitalSigns![key as keyof import('../types').VitalSigns] as number;
         } else {
            value = c[key as keyof Consultation] as number;
         }
         return {
          label: new Date(c.date).toLocaleDateString('es-MX'),
          value: value,
         }
      })
      .reverse(); // from oldest to newest
  };

  const weightData = getPrenatalEvolution('weight');
  const afuData = getPrenatalEvolution('afu');
  const mapData = getPrenatalEvolution('map');


  const EvolutionCharts = () => (
    <div className="space-y-8">
        <h3 className="text-xl font-bold text-center">Gráficas de Evolución</h3>
        <EvolutionChart data={getVitalSignEvolution('weight')} title="Evolución del Peso" unit="kg" lineColorClassName="stroke-blue-500" pointColorClassName="fill-blue-500" />
        <EvolutionChart data={getVitalSignEvolution('temperature')} title="Evolución de Temperatura" unit="°C" lineColorClassName="stroke-red-500" pointColorClassName="fill-red-500" />
        <EvolutionChart data={getBloodPressureEvolution().systolic} title="Evolución T.A. Sistólica" unit="mmHg" lineColorClassName="stroke-purple-500" pointColorClassName="fill-purple-500" />
        <EvolutionChart data={getBloodPressureEvolution().diastolic} title="Evolución T.A. Diastólica" unit="mmHg" lineColorClassName="stroke-indigo-500" pointColorClassName="fill-indigo-500" />
    </div>
  );

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
      <header className="mb-6 pb-4 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-2">
              <ChevronLeftIcon className="w-4 h-4" />
              <span>Volver a la lista</span>
            </button>
            <h1 className="text-3xl font-bold text-slate-800">{patient.name}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
              {patient.patientCode && <span className="font-mono bg-slate-100 px-2 py-1 rounded">{patient.patientCode}</span>}
              <span>{patientAge}</span>
              <span>{patient.gender}</span>
              <span>{patient.contact}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleEditPatient} className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200">
              <PencilIcon className="w-4 h-4"/><span>Editar Paciente</span>
            </button>
            <button onClick={handlePrintHistory} className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200">
              <ClipboardDocumentListIcon className="w-4 h-4"/><span>Imprimir Historia</span>
            </button>
             <button onClick={() => setIsChartsModalOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200">
              <ChartBarSquareIcon className="w-4 h-4"/><span>Ver Gráficas</span>
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Info Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg border">
            <h3 className="font-bold text-slate-700 mb-2">Antecedentes Médicos</h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p><strong className="font-semibold">Alergias:</strong> {patient.allergies || 'No registradas'}</p>
              <p><strong className="font-semibold">Familiares:</strong> {patient.familyHistory || 'No registrados'}</p>
              <p><strong className="font-semibold">Patológicos:</strong> {patient.pathologicalHistory || 'No registrados'}</p>
              <p><strong className="font-semibold">No Patológicos:</strong> {patient.nonPathologicalHistory || 'No registrados'}</p>
              <p><strong className="font-semibold">Quirúrgicos:</strong> {patient.surgicalHistory || 'No registrados'}</p>
            </div>
          </div>
          {patient.gender === 'Femenino' && (
            <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
              <h3 className="font-bold text-pink-800 mb-2">Historial Ginecológico</h3>
              <div className="text-sm text-slate-600 space-y-2">
                  <p><strong className="font-semibold">Antecedentes:</strong> {patient.gynecologicalHistory || 'No registrados'}</p>
                  <p><strong className="font-semibold">Último Papanicolaou:</strong> {patient.lastPapanicolaou ? new Date(`${patient.lastPapanicolaou}T00:00:00`).toLocaleDateString('es-MX') : 'No registrado'}</p>
                  <p><strong className="font-semibold">Última Colposcopia:</strong> {patient.lastColposcopy ? new Date(`${patient.lastColposcopy}T00:00:00`).toLocaleDateString('es-MX') : 'No registrado'}</p>
              </div>
            </div>
          )}
           {prenatalConsultations.length >= 2 && (
            <div className="p-4 bg-slate-50 rounded-lg border">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <ChartPieIcon className="w-6 h-6 text-pink-600" />
                <span>Evolución Prenatal</span>
              </h3>
              <div className="space-y-4">
                {weightData.length >= 2 && (
                  <EvolutionChart 
                    data={weightData} 
                    title="Evolución del Peso" 
                    unit="kg" 
                    lineColorClassName="stroke-blue-500" 
                    pointColorClassName="fill-blue-500" 
                  />
                )}
                {afuData.length >= 2 && (
                  <EvolutionChart 
                    data={afuData} 
                    title="Evolución de Altura de Fondo Uterino" 
                    unit="cm" 
                    lineColorClassName="stroke-purple-500" 
                    pointColorClassName="fill-purple-500" 
                  />
                )}
                {mapData.length >= 2 && (
                  <EvolutionChart 
                    data={mapData} 
                    title="Evolución de Tensión Arterial Media (PAM)" 
                    unit="mmHg" 
                    lineColorClassName="stroke-green-500" 
                    pointColorClassName="fill-green-500" 
                  />
                )}
                {weightData.length < 2 && afuData.length < 2 && mapData.length < 2 && (
                  <p className="text-sm text-slate-500 text-center">No hay suficientes datos para generar gráficas de evolución prenatal.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Consultations Column */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-700">Historial de Consultas</h2>
            <button onClick={handleNewConsultation} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <PlusIcon className="w-5 h-5"/><span>Nueva Consulta</span>
            </button>
          </div>
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
            {sortedConsultations.length > 0 ? (
              sortedConsultations.map(consult => {
                  const isExpanded = expandedConsultationId === consult.id;
                  const bpStatus = getBPStatus(consult.vitalSigns?.systolicBP, consult.vitalSigns?.diastolicBP);
                  const bmiStatusColor = getBMIStatusColor(consult.vitalSigns?.bmiInterpretation);
                  return (
                  <div key={consult.id} className="border rounded-lg bg-white overflow-hidden">
                    <div 
                        className="p-4 cursor-pointer hover:bg-slate-50 flex justify-between items-center"
                        onClick={() => toggleConsultationDetails(consult.id)}
                    >
                      <div>
                        <p className="font-bold text-slate-800">{new Date(consult.date).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })}</p>
                        <p className="text-sm text-slate-600">{consult.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isExpanded ? <MinusIcon className="w-5 h-5 text-slate-500" /> : <PlusIcon className="w-5 h-5 text-slate-500" />}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="p-4 border-t bg-slate-50/50 text-sm">
                        <div className="space-y-4">
                            {consult.attentionType && <p><strong className="font-semibold">Tipo de Atención:</strong> {consult.attentionType}</p>}
                            {consult.vitalSigns && (
                                <div>
                                    <h4 className="font-bold text-slate-700 mb-1">Signos Vitales:</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs pl-4">
                                        {consult.vitalSigns.systolicBP && <p><strong>T.A.:</strong> {consult.vitalSigns.systolicBP}/{consult.vitalSigns.diastolicBP} <span className={`font-bold ${bpStatus.color}`}>({bpStatus.text})</span></p>}
                                        {consult.vitalSigns.heartRate && <p><strong>F.C.:</strong> {consult.vitalSigns.heartRate} lpm</p>}
                                        {consult.vitalSigns.temperature && <p><strong>Temp:</strong> {consult.vitalSigns.temperature} °C</p>}
                                        {consult.vitalSigns.weight && <p><strong>Peso:</strong> {consult.vitalSigns.weight} kg</p>}
                                        {consult.vitalSigns.bmi && <p><strong>IMC:</strong> {consult.vitalSigns.bmi} <span className={`font-bold ${bmiStatusColor}`}>({consult.vitalSigns.bmiInterpretation})</span></p>}
                                    </div>
                                </div>
                            )}
                            <p><strong className="font-semibold">Exploración Física:</strong> {consult.physicalExam || 'N/A'}</p>
                            <p><strong className="font-semibold">Diagnóstico:</strong> {consult.diagnosis}</p>
                            
                            {consult.prescription.medications.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-slate-700">Receta:</h4>
                                    <ul className="list-disc pl-8">
                                        {consult.prescription.medications.map((m, i) => <li key={i}>{m.name} - {m.indication}</li>)}
                                    </ul>
                                </div>
                            )}
                             {consult.ultrasoundReportType && (
                                <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                                    <h4 className="font-bold text-blue-800">Reporte de Ultrasonido:</h4>
                                    <p><strong>Tipo:</strong> {consult.ultrasoundReportType}</p>
                                    <p><strong>Hallazgos:</strong> {consult.ultrasoundReportFindings?.substring(0, 100)}...</p>
                                </div>
                            )}
                            <div className="flex justify-end items-center gap-2 pt-2 border-t">
                                <button onClick={() => handleEditConsultation(consult)} className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-700">
                                    <PencilIcon className="w-3 h-3"/><span>Editar</span>
                                </button>
                                <button onClick={() => handlePrintPrescription(consult)} className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-700">
                                    <PrintIcon className="w-3 h-3"/><span>Imprimir Receta</span>
                                </button>
                                {consult.ultrasoundReportType && (
                                    <button onClick={() => handlePrintUltrasound(consult)} className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-700">
                                        <DocumentTextIcon className="w-3 h-3"/><span>Imprimir USG</span>
                                    </button>
                                )}
                            </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="text-center py-10 border-dashed border-2 rounded-lg">
                <p className="text-slate-500">No hay consultas registradas para este paciente.</p>
                <p className="text-sm text-slate-400 mt-1">Haga clic en "Nueva Consulta" para comenzar.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isPatientModalOpen} onClose={() => setIsPatientModalOpen(false)} size="2xl">
        <PatientForm patient={patient} onSave={handleSavePatient} onCancel={() => setIsPatientModalOpen(false)} />
      </Modal>

      <Modal isOpen={isConsultationModalOpen} onClose={() => setIsConsultationModalOpen(false)} size="4xl">
        <ConsultationForm 
          patient={patient}
          doctor={doctor}
          consultation={editingConsultation || undefined}
          patientConsultations={consultations}
          medications={medications}
          onSave={handleSaveConsultation}
          onCancel={() => setIsConsultationModalOpen(false)}
        />
      </Modal>

      <Modal isOpen={isChartsModalOpen} onClose={() => setIsChartsModalOpen(false)} size="3xl">
          <div className="p-1 max-h-[85vh] overflow-y-auto">
            <EvolutionCharts />
             <div className="flex justify-end mt-4 pt-4 border-t">
                <button onClick={() => setIsChartsModalOpen(false)} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cerrar</button>
             </div>
          </div>
      </Modal>
      
      {isPrinting === 'prescription' && consultationToPrint && (
        <NewWindow onClose={() => setIsPrinting(null)} title="Receta Médica">
          <PrintablePrescription patient={patient} doctor={doctor} consultation={consultationToPrint} clinicInfo={clinicInfo} />
        </NewWindow>
      )}

      {isPrinting === 'ultrasound' && consultationToPrint && (
        <NewWindow onClose={() => setIsPrinting(null)} title="Reporte de Ultrasonido">
          <PrintableUltrasoundReport patient={patient} doctor={doctor} consultation={consultationToPrint} clinicInfo={clinicInfo} />
        </NewWindow>
      )}

      {isPrinting === 'history' && (
        <NewWindow onClose={() => setIsPrinting(null)} title="Historia Clínica">
          <PrintablePatientHistory patient={patient} doctor={doctor} consultations={consultations} clinicInfo={clinicInfo} />
        </NewWindow>
      )}
    </div>
  );
};

export default PatientDetail;