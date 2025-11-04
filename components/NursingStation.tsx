import React, { useState, useMemo } from 'react';
import { Patient, Doctor, Consultation, Nurse } from '../types';
import Modal from './Modal';
import PatientForm from './PatientForm';
import TriageForm from './TriageForm';
import { PlusIcon } from './icons/PlusIcon';
import { ClipboardCheckIcon } from './icons/ClipboardCheckIcon';
import { ArrowLeftOnRectangleIcon } from './icons/ArrowLeftOnRectangleIcon';

interface NursingStationProps {
  patients: Patient[];
  doctors: Doctor[];
  nurse: Nurse;
  onAddPatient: (patient: Omit<Patient, 'id' | 'doctorId' | 'patientCode'>) => void;
  onAddTriage: (consultation: Omit<Consultation, 'id'>) => void;
  onExit: () => void;
}

const NursingStation: React.FC<NursingStationProps> = ({
  patients,
  doctors,
  nurse,
  onAddPatient,
  onAddTriage,
  onExit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isTriageModalOpen, setIsTriageModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filteredPatients = useMemo(() => {
    const sortedPatients = [...patients].sort((a, b) => a.name.localeCompare(b.name));
    if (!searchQuery) return sortedPatients;
    return sortedPatients.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patientCode?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [patients, searchQuery]);

  const handleSavePatient = (patientData: Omit<Patient, 'id' | 'doctorId' | 'patientCode'> | Patient) => {
    if (!('id' in patientData)) {
      onAddPatient(patientData);
    }
    // No update logic needed here for now as nurses mainly add.
    setIsPatientModalOpen(false);
  };
  
  const handleSelectPatientForTriage = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsTriageModalOpen(true);
  };
  
  const handleSaveTriage = (triageData: Omit<Consultation, 'id'>) => {
    onAddTriage(triageData);
    setIsTriageModalOpen(false);
    setSelectedPatient(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white p-4 sm:p-6 rounded-lg shadow-lg">
        <header className="mb-6 pb-4 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <ClipboardCheckIcon className="w-10 h-10 text-teal-600" />
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Estación de Enfermería</h1>
                <p className="text-slate-500 font-semibold">{nurse.name}</p>
              </div>
            </div>
            <button onClick={onExit} className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors">
              <ArrowLeftOnRectangleIcon className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </header>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <input 
            type="text"
            placeholder="Buscar paciente por nombre o código..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full sm:w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button onClick={() => setIsPatientModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <PlusIcon className="w-5 h-5" />
            <span>Añadir Paciente</span>
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {filteredPatients.length > 0 ? (
            filteredPatients.map(patient => (
              <div 
                key={patient.id} 
                onClick={() => handleSelectPatientForTriage(patient)}
                className="p-4 border rounded-lg hover:bg-teal-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  {patient.patientCode && <span className="font-mono text-sm bg-slate-200 text-slate-600 px-2 py-1 rounded-md">{patient.patientCode}</span>}
                  <h3 className="font-semibold text-lg text-slate-800">{patient.name}</h3>
                </div>
                <p className="text-sm text-slate-500 mt-1 ml-1">Fecha de Nac.: {new Date(`${patient.dob}T00:00:00`).toLocaleDateString('es-MX')} - Contacto: {patient.contact}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-10 border-dashed border-2 rounded-lg">
              <p className="text-slate-500">No se encontraron pacientes.</p>
            </div>
          )}
        </div>
        
        <Modal isOpen={isPatientModalOpen} onClose={() => setIsPatientModalOpen(false)} size="2xl">
          <PatientForm onSave={handleSavePatient} onCancel={() => setIsPatientModalOpen(false)} />
        </Modal>

        <Modal isOpen={isTriageModalOpen} onClose={() => setIsTriageModalOpen(false)} size="2xl">
          {selectedPatient && (
            <TriageForm 
              patient={selectedPatient}
              doctors={doctors}
              nurse={nurse}
              onSave={handleSaveTriage}
              onCancel={() => {
                setIsTriageModalOpen(false);
                setSelectedPatient(null);
              }}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default NursingStation;