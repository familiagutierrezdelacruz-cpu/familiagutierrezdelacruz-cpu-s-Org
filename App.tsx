
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Patient, Doctor, Consultation, AppSettings, Nurse, SuperAdmin, HealthUnit, HealthUnitAdmin } from './types';
import { saveData, loadData } from './services/storageService';
import { fetchMedications } from './services/medicationService';
import PatientList from './components/PatientList';
import PatientDetail from './components/PatientDetail';
import { generateNextPatientCode } from './utils/patientUtils';
import NursingStation from './components/NursingStation'; 
import Login from './components/Login';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import HealthUnitAdminDashboard from './components/HealthUnitAdminDashboard';

type UserRole = 'SUPER_ADMIN' | 'HEALTH_UNIT_ADMIN' | 'DOCTOR' | 'NURSE';

const App: React.FC = () => {
  // State management for all data types
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>(() => loadData<SuperAdmin[]>('superAdmins') || []);
  const [healthUnits, setHealthUnits] = useState<HealthUnit[]>(() => loadData<HealthUnit[]>('healthUnits') || []);
  const [healthUnitAdmins, setHealthUnitAdmins] = useState<HealthUnitAdmin[]>(() => loadData<HealthUnitAdmin[]>('healthUnitAdmins') || []);
  const [doctors, setDoctors] = useState<Doctor[]>(() => loadData<Doctor[]>('doctors') || []);
  const [nurses, setNurses] = useState<Nurse[]>(() => loadData<Nurse[]>('nurses') || []);
  const [patients, setPatients] = useState<Patient[]>(() => loadData<Patient[]>('patients') || []);
  const [consultations, setConsultations] = useState<Consultation[]>(() => loadData<Consultation[]>('consultations') || []);
  const [settings, setSettings] = useState<AppSettings>(() => loadData<AppSettings>('settings') || { medicationsUrl: '' });
  const [medicationList, setMedicationList] = useState<string[]>([]);
  
  // State for current user and view
  const [currentUser, setCurrentUser] = useState<SuperAdmin | HealthUnitAdmin | Doctor | Nurse | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // One-time data migration to the new hierarchical structure
  useEffect(() => {
    const migrationV2Completed = loadData<boolean>('migrationV2Completed');
    if (!migrationV2Completed) {
        console.log("Running V2 data migration for role-based access control...");

        const oldSettings = loadData<any>('settings');
        
        // 1. Create default Health Unit from old settings
        const defaultUnit: HealthUnit = {
            id: uuidv4(),
            name: oldSettings?.clinicInfo?.name || 'ULTRAMED',
            address: oldSettings?.clinicInfo?.address || 'AVENIDA 12 DE OCTUBRE SN, COL. VICENTE GUERRERO, OCOZOCOAUTLA',
            phone: oldSettings?.clinicInfo?.phone || '',
            slogan: oldSettings?.clinicInfo?.slogan || 'ULTRASONIDO MEDICO DIAGNOSTICO',
            logo: oldSettings?.clinicInfo?.logo,
        };

        // FIX: Added missing 'healthUnitId' to the default doctor object to match the 'Doctor' type.
        const oldDoctors = loadData<Doctor[]>('doctors') || [{
            id: uuidv4(), name: 'WILBER GUTIERREZ LEON', professionalLicense: '6758618', university: 'UNACH',
            diplomados: 'COLPOSCOPIA, ULTRASONIDO MEDICO', hasSpecialty: false, password: '1234', healthUnitId: defaultUnit.id
        }];
        // FIX: Added missing 'healthUnitId' to the default nurse object to match the 'Nurse' type.
        const oldNurses = loadData<Nurse[]>('nurses') || [{ id: uuidv4(), name: 'ENFERMERA GENERAL', password: '1234', healthUnitId: defaultUnit.id }];
        const oldPatients = loadData<Patient[]>('patients') || [];

        saveData('healthUnits', [defaultUnit]);
        setHealthUnits([defaultUnit]);

        // 2. Create default Super Admin
        const superAdmin: SuperAdmin = { id: uuidv4(), name: 'SUPERADMIN', password: 'admin' };
        saveData('superAdmins', [superAdmin]);
        setSuperAdmins([superAdmin]);
        
        // 3. Create default Health Unit Admin
        const unitAdmin: HealthUnitAdmin = { id: uuidv4(), name: 'ADMIN', password: 'admin', healthUnitId: defaultUnit.id };
        saveData('healthUnitAdmins', [unitAdmin]);
        setHealthUnitAdmins([unitAdmin]);

        // 4. Update existing Doctors, Nurses, Patients with healthUnitId
        oldDoctors.forEach(d => d.healthUnitId = defaultUnit.id);
        saveData('doctors', oldDoctors);
        setDoctors(oldDoctors);

        oldNurses.forEach(n => n.healthUnitId = defaultUnit.id);
        saveData('nurses', oldNurses);
        setNurses(oldNurses);

        oldPatients.forEach(p => p.healthUnitId = defaultUnit.id);
        // Migrate patient doctorId if it doesn't exist
        const needsDoctorIdMigration = oldPatients.some(p => !p.doctorId);
        if (needsDoctorIdMigration && oldDoctors.length > 0) {
            oldPatients.forEach(p => { if (!p.doctorId) p.doctorId = oldDoctors[0].id; });
        }
        saveData('patients', oldPatients);
        setPatients(oldPatients);

        // 5. Update settings file
        const newSettings: AppSettings = { medicationsUrl: oldSettings?.medicationsUrl || '' };
        saveData('settings', newSettings);
        setSettings(newSettings);

        saveData('migrationV2Completed', true);
        console.log("V2 migration completed successfully.");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const loadMeds = async () => {
        if (settings.medicationsUrl) {
            const meds = await fetchMedications(settings.medicationsUrl);
            setMedicationList(meds);
        }
    };
    loadMeds();
  }, [settings.medicationsUrl]);
  
  // Data persistence effects
  useEffect(() => { saveData('superAdmins', superAdmins); }, [superAdmins]);
  useEffect(() => { saveData('healthUnits', healthUnits); }, [healthUnits]);
  useEffect(() => { saveData('healthUnitAdmins', healthUnitAdmins); }, [healthUnitAdmins]);
  useEffect(() => { saveData('doctors', doctors); }, [doctors]);
  useEffect(() => { saveData('nurses', nurses); }, [nurses]);
  useEffect(() => { saveData('patients', patients); }, [patients]);
  useEffect(() => { saveData('consultations', consultations); }, [consultations]);
  useEffect(() => { saveData('settings', settings); }, [settings]);
  
  // Auth handlers
  const handleLogin = (name: string, password) => {
    const user_name = name.toUpperCase();
    const superAdmin = superAdmins.find(u => u.name === user_name && u.password === password);
    if (superAdmin) { setCurrentUser(superAdmin); setCurrentRole('SUPER_ADMIN'); return; }

    const unitAdmin = healthUnitAdmins.find(u => u.name === user_name && u.password === password);
    if (unitAdmin) { setCurrentUser(unitAdmin); setCurrentRole('HEALTH_UNIT_ADMIN'); return; }
    
    const doctor = doctors.find(u => u.name === user_name && u.password === password);
    if (doctor) { setCurrentUser(doctor); setCurrentRole('DOCTOR'); return; }

    const nurse = nurses.find(u => u.name === user_name && u.password === password);
    if (nurse) { setCurrentUser(nurse); setCurrentRole('NURSE'); return; }

    return "Usuario o contraseña incorrectos.";
  };
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
    setSelectedPatient(null);
  };
  
  // Admin Handlers
  const handleAddHealthUnit = (unit: Omit<HealthUnit, 'id'>) => setHealthUnits(prev => [...prev, { ...unit, id: uuidv4() }]);
  const handleUpdateHealthUnit = (updated: HealthUnit) => setHealthUnits(prev => prev.map(u => u.id === updated.id ? updated : u));
  const handleAddUnitAdmin = (admin: Omit<HealthUnitAdmin, 'id'>) => setHealthUnitAdmins(prev => [...prev, { ...admin, id: uuidv4() }]);
  const handleUpdateUnitAdmin = (updated: HealthUnitAdmin) => setHealthUnitAdmins(prev => prev.map(a => a.id === updated.id ? updated : a));
  const handleAddDoctor = (doctorData: Omit<Doctor, 'id'>) => setDoctors(prev => [...prev, { ...doctorData, id: uuidv4() }]);
  const handleUpdateDoctor = (updated: Doctor) => setDoctors(prev => prev.map(d => d.id === updated.id ? updated : d));
  const handleAddNurse = (nurseData: Omit<Nurse, 'id'>) => setNurses(prev => [...prev, { ...nurseData, id: uuidv4() }]);
  const handleUpdateNurse = (updated: Nurse) => setNurses(prev => prev.map(n => n.id === updated.id ? updated : n));

  // Patient handlers
  const handleAddPatient = (patientData: Omit<Patient, 'id' | 'doctorId' | 'patientCode' | 'healthUnitId'>) => {
    const user = currentUser as Doctor | Nurse;
    const unitDoctors = doctors.filter(d => d.healthUnitId === user.healthUnitId);
    const doctorId = currentRole === 'DOCTOR' ? user.id : unitDoctors[0]?.id;
    
    if (!user.healthUnitId || !doctorId) return;

    const unitPatients = patients.filter(p => p.healthUnitId === user.healthUnitId);
    const patientCode = generateNextPatientCode(unitPatients);
    const newPatient: Patient = { ...patientData, id: uuidv4(), doctorId, healthUnitId: user.healthUnitId, patientCode };
    setPatients(prev => [...prev, newPatient]);
  };
  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    if (selectedPatient?.id === updatedPatient.id) setSelectedPatient(updatedPatient);
  };
  const handleSelectPatient = (patientId: string) => setSelectedPatient(patients.find(p => p.id === patientId) || null);
  const handleBackToList = () => setSelectedPatient(null);

  // Consultation handlers
  const handleAddConsultation = (consultationData: Omit<Consultation, 'id'>) => {
    const newConsultation = { ...consultationData, id: uuidv4(), status: consultationData.status || 'COMPLETED' };
    setConsultations(prev => [...prev, newConsultation as Consultation]);
  };
  const handleUpdateConsultation = (updated: Consultation) => setConsultations(prev => prev.map(c => c.id === updated.id ? updated : c));
  
  // Deletion Handlers
  const handleDeletePatient = (patientId: string) => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
    setConsultations(prev => prev.filter(c => c.patientId !== patientId));
    if (selectedPatient?.id === patientId) {
        setSelectedPatient(null);
    }
  };

  const handleDeleteConsultation = (consultationId: string) => {
    setConsultations(prev => prev.filter(c => c.id !== consultationId));
  };

  // Settings handler
  const handleSaveSettings = (newSettings: AppSettings) => setSettings(newSettings);

  if (isLoading) {
      return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><p>Cargando aplicación...</p></div>;
  }
  
  const renderView = () => {
    if (!currentUser || !currentRole) {
      return <Login onLogin={handleLogin} />;
    }

    switch (currentRole) {
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard
          healthUnits={healthUnits}
          healthUnitAdmins={healthUnitAdmins}
          doctors={doctors}
          nurses={nurses}
          patients={patients}
          consultations={consultations}
          onAddHealthUnit={handleAddHealthUnit}
          onUpdateHealthUnit={handleUpdateHealthUnit}
          onAddUnitAdmin={handleAddUnitAdmin}
          onUpdateUnitAdmin={handleUpdateUnitAdmin}
          onAddDoctor={handleAddDoctor}
          onUpdateDoctor={handleUpdateDoctor}
          onAddNurse={handleAddNurse}
          onUpdateNurse={handleUpdateNurse}
          onLogout={handleLogout}
        />;
      
      case 'HEALTH_UNIT_ADMIN':
        const admin = currentUser as HealthUnitAdmin;
        return <HealthUnitAdminDashboard
          admin={admin}
          healthUnit={healthUnits.find(u => u.id === admin.healthUnitId)}
          allHealthUnits={healthUnits}
          doctors={doctors.filter(d => d.healthUnitId === admin.healthUnitId)}
          nurses={nurses.filter(n => n.healthUnitId === admin.healthUnitId)}
          onAddDoctor={handleAddDoctor}
          onUpdateDoctor={handleUpdateDoctor}
          onAddNurse={handleAddNurse}
          onUpdateNurse={handleUpdateNurse}
          onLogout={handleLogout}
        />;

      case 'NURSE':
        const nurse = currentUser as Nurse;
        return <NursingStation
            patients={patients.filter(p => p.healthUnitId === nurse.healthUnitId)}
            doctors={doctors.filter(d => d.healthUnitId === nurse.healthUnitId)}
            nurse={nurse}
            onAddPatient={handleAddPatient}
            onAddTriage={handleAddConsultation}
            onExit={handleLogout}
          />;

      case 'DOCTOR':
        const doctor = currentUser as Doctor;
        const doctorHealthUnit = healthUnits.find(u => u.id === doctor.healthUnitId);
        if (!doctorHealthUnit) return <p>Error: No se encontró la unidad de salud.</p>;

        const unitPatients = patients.filter(p => p.healthUnitId === doctor.healthUnitId);
        const unitConsultations = consultations.filter(c => unitPatients.some(p => p.id === c.patientId));

        if (!selectedPatient) {
            return <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <div className="w-full max-w-5xl">
                  <PatientList
                    patients={unitPatients}
                    doctor={doctor}
                    healthUnit={doctorHealthUnit}
                    consultations={unitConsultations}
                    onSelectPatient={handleSelectPatient}
                    onAddPatient={handleAddPatient}
                    onUpdatePatient={handleUpdatePatient}
                    onDeletePatient={handleDeletePatient}
                    onLogout={handleLogout}
                    onSaveSettings={handleSaveSettings}
                    settings={settings}
                  />
                </div>
              </div>;
        }
        return <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-7xl">
              <PatientDetail
                patient={selectedPatient}
                consultations={consultations.filter(c => c.patientId === selectedPatient.id)}
                doctor={doctor}
                healthUnit={doctorHealthUnit}
                medications={medicationList}
                onBack={handleBackToList}
                onUpdatePatient={handleUpdatePatient}
                onDeletePatient={handleDeletePatient}
                onAddConsultation={handleAddConsultation}
                onUpdateConsultation={handleUpdateConsultation}
                onDeleteConsultation={handleDeleteConsultation}
              />
            </div>
          </div>;
      
      default:
        return <Login onLogin={handleLogin} />;
    }
  }

  return <>{renderView()}</>;
};

export default App;
