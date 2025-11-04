import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Patient, Doctor, Consultation, AppSettings, Nurse } from './types';
import { saveData, loadData } from './services/storageService';
import { fetchMedications } from './services/medicationService';
import DoctorSelection from './components/DoctorSelection';
import PatientList from './components/PatientList';
import PatientDetail from './components/PatientDetail';
import { generateNextPatientCode } from './utils/patientUtils';
import NursingStation from './components/NursingStation'; 

type AppView = 'login' | 'nursingStation' | 'doctorDashboard';

const App: React.FC = () => {
  // State management
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const savedDoctors = loadData<Doctor[]>('doctors');
    if (savedDoctors && savedDoctors.length > 0) {
        return savedDoctors;
    }
    // Default doctor profile if none exists
    return [{
        id: uuidv4(),
        name: 'WILBER GUTIERREZ LEON',
        professionalLicense: '6758618',
        university: 'UNACH',
        diplomados: 'COLPOSCOPIA, ULTRASONIDO MEDICO',
        hasSpecialty: false,
        password: '1234'
    }];
  });

  const [nurses, setNurses] = useState<Nurse[]>(() => {
    const savedNurses = loadData<Nurse[]>('nurses');
    if (savedNurses && savedNurses.length > 0) {
        return savedNurses;
    }
    // Default nurse profile if none exists
    return [{
        id: uuidv4(),
        name: 'ENFERMERA GENERAL',
        password: '1234'
    }];
  });

  const [patients, setPatients] = useState<Patient[]>(() => loadData<Patient[]>('patients') || []);
  const [consultations, setConsultations] = useState<Consultation[]>(() => loadData<Consultation[]>('consultations') || []);
  const [settings, setSettings] = useState<AppSettings>(() => {
      const savedSettings = loadData<AppSettings>('settings');
      if (savedSettings) return savedSettings;
      // Default clinic info
      return {
          medicationsUrl: '',
          clinicInfo: {
              name: 'ULTRAMED',
              address: 'AVENIDA 12 DE OCTUBRE SN, COL. VICENTE GUERRERO, OCOZOCOAUTLA',
              phone: '',
              slogan: 'ULTRASONIDO MEDICO DIAGNOSTICO'
          }
      }
  });
  const [medicationList, setMedicationList] = useState<string[]>([]);
  
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [currentNurse, setCurrentNurse] = useState<Nurse | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('login');

  // One-time migrations
  useEffect(() => {
    // Migration for existing patients without a doctorId
    const allPatients = loadData<Patient[]>("patients") || [];
    let patientsNeedUpdate = false;

    // Doctor ID migration
    if (allPatients.length > 0 && doctors.length > 0) {
        const needsDoctorIdMigration = allPatients.some(p => !p.doctorId);
        if (needsDoctorIdMigration) {
            console.log("Running migration: Assigning existing patients to the default doctor.");
            const defaultDoctorId = doctors[0].id;
            allPatients.forEach(p => {
                if (!p.doctorId) {
                    p.doctorId = defaultDoctorId;
                    patientsNeedUpdate = true;
                }
            });
        }
    }
    
    // Patient Code migration
    const needsPatientCodeMigration = allPatients.some(p => !p.patientCode);
    if (needsPatientCodeMigration) {
        console.log("Running migration: Assigning unique patient codes.");
        let maxId = 0;
        allPatients.forEach(p => {
            if (p.patientCode && p.patientCode.startsWith('P-')) {
                const num = parseInt(p.patientCode.substring(2), 10);
                if (!isNaN(num) && num > maxId) maxId = num;
            }
        });

        allPatients.forEach(p => {
            if (!p.patientCode) {
                maxId++;
                p.patientCode = `P-${maxId.toString().padStart(3, '0')}`;
                patientsNeedUpdate = true;
            }
        });
    }

    if (patientsNeedUpdate) {
        saveData('patients', allPatients);
        setPatients(allPatients);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on initial mount


  // Load data and fetch medications on initial render
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      if (settings.medicationsUrl) {
        const meds = await fetchMedications(settings.medicationsUrl);
        setMedicationList(meds);
      }
      setIsLoading(false);
    };
    loadInitialData();
  }, [settings.medicationsUrl]);
  
  // Data persistence effects
  useEffect(() => { saveData('doctors', doctors); }, [doctors]);
  useEffect(() => { saveData('nurses', nurses); }, [nurses]);
  useEffect(() => { saveData('patients', patients); }, [patients]);
  useEffect(() => { saveData('consultations', consultations); }, [consultations]);
  useEffect(() => { saveData('settings', settings); }, [settings]);
  
  // Doctor handlers
  const handleAddDoctor = (doctorData: Omit<Doctor, 'id'>) => {
    setDoctors(prev => [...prev, { ...doctorData, id: uuidv4() }]);
  };
  const handleUpdateDoctor = (updatedDoctor: Doctor) => {
    setDoctors(prev => prev.map(d => d.id === updatedDoctor.id ? updatedDoctor : d));
  };
  const handleSelectDoctor = (doctor: Doctor) => {
    setCurrentDoctor(doctor);
    setCurrentView('doctorDashboard');
  };
  
  // Nurse handlers
  const handleAddNurse = (nurseData: Omit<Nurse, 'id'>) => {
    setNurses(prev => [...prev, { ...nurseData, id: uuidv4() }]);
  };
  const handleUpdateNurse = (updatedNurse: Nurse) => {
    setNurses(prev => prev.map(n => n.id === updatedNurse.id ? updatedNurse : n));
  };
  const handleSelectNurse = (nurse: Nurse) => {
    setCurrentNurse(nurse);
    setCurrentView('nursingStation');
  };

  const handleLogout = () => {
    setCurrentDoctor(null);
    setCurrentNurse(null);
    setSelectedPatient(null);
    setCurrentView('login');
  };

  // Patient handlers
  const handleAddPatient = (patientData: Omit<Patient, 'id' | 'doctorId' | 'patientCode'>) => {
    // This function can now be called from Nursing or Doctor view.
    // If from doctor view, currentDoctor is set. If from nursing, we need a default doctor.
    const doctorId = currentDoctor?.id || doctors[0]?.id;
    if (!doctorId) {
      console.error("No doctor available to assign the patient to.");
      return;
    }
    const patientCode = generateNextPatientCode(patients);
    const newPatient: Patient = { 
        ...patientData, 
        id: uuidv4(), 
        doctorId: doctorId, 
        patientCode 
    };
    setPatients(prev => [...prev, newPatient]);
  };
  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    if (selectedPatient?.id === updatedPatient.id) {
        setSelectedPatient(updatedPatient);
    }
  };
  const handleSelectPatient = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
    }
  };
  const handleBackToList = () => {
    setSelectedPatient(null);
  };

  // Consultation handlers
  const handleAddConsultation = (consultationData: Omit<Consultation, 'id'>) => {
    const newConsultation = { ...consultationData, id: uuidv4(), status: consultationData.status || 'COMPLETED' };
    setConsultations(prev => [...prev, newConsultation as Consultation]);
  };
  const handleUpdateConsultation = (updatedConsultation: Consultation) => {
    setConsultations(prev => prev.map(c => c.id === updatedConsultation.id ? updatedConsultation : c));
  };
  
  // Settings handler
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  if (isLoading) {
      return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><p>Cargando aplicación...</p></div>;
  }
  
  const renderView = () => {
    switch (currentView) {
      case 'nursingStation':
        if (!currentNurse) {
          setCurrentView('login');
          return null;
        }
        return (
          <NursingStation
            patients={patients}
            doctors={doctors}
            nurse={currentNurse}
            onAddPatient={handleAddPatient}
            onAddTriage={handleAddConsultation}
            onExit={handleLogout}
          />
        );
      case 'doctorDashboard':
        if (!currentDoctor) {
            // Should not happen if logic is correct, but as a fallback
            setCurrentView('login');
            return null;
        }
        if (!selectedPatient) {
            const doctorPatients = patients.filter(p => p.doctorId === currentDoctor.id);
            // Pass all consultations, filtering will happen inside
            return (
              <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <div className="w-full max-w-5xl">
                  <PatientList
                    patients={doctorPatients}
                    doctor={currentDoctor}
                    settings={settings}
                    consultations={consultations} // Pass all consultations
                    onSelectPatient={handleSelectPatient}
                    onAddPatient={handleAddPatient}
                    onUpdatePatient={handleUpdatePatient}
                    onLogout={handleLogout}
                    onSaveSettings={handleSaveSettings}
                  />
                </div>
              </div>
            );
        }
        return (
          <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-7xl">
              <PatientDetail
                patient={selectedPatient}
                consultations={consultations.filter(c => c.patientId === selectedPatient.id)}
                doctor={currentDoctor}
                clinicInfo={settings.clinicInfo}
                medications={medicationList}
                onBack={handleBackToList}
                onUpdatePatient={handleUpdatePatient}
                onAddConsultation={handleAddConsultation}
                onUpdateConsultation={handleUpdateConsultation}
              />
            </div>
          </div>
        );

      case 'login':
      default:
        return (
          <DoctorSelection 
            doctors={doctors}
            nurses={nurses}
            onSelectDoctor={handleSelectDoctor}
            onAddDoctor={handleAddDoctor}
            onUpdateDoctor={handleUpdateDoctor}
            onSelectNurse={handleSelectNurse}
            onAddNurse={handleAddNurse}
            onUpdateNurse={handleUpdateNurse}
          />
        );
    }
  }

  return <>{renderView()}</>;
};

export default App;