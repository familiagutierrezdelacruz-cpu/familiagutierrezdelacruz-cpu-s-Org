import React, { useState, useMemo } from 'react';
import { HealthUnit, HealthUnitAdmin, Doctor, Nurse, Patient, Consultation } from '../types';
import Modal from './Modal';
import { PlusIcon } from './icons/PlusIcon';
import { PencilIcon } from './icons/PencilIcon';
import { SwitchUserIcon } from './icons/SwitchUserIcon';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { StethoscopeIcon } from './icons/StethoscopeIcon';
import { UsersIcon } from './icons/UsersIcon';
import HealthUnitForm from './HealthUnitForm';
import HealthUnitAdminForm from './HealthUnitAdminForm';
import DoctorManagementModal from './DoctorManagementModal';
import NurseManagementModal from './NurseManagementModal';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';

interface SuperAdminDashboardProps {
  healthUnits: HealthUnit[];
  healthUnitAdmins: HealthUnitAdmin[];
  doctors: Doctor[];
  nurses: Nurse[];
  patients: Patient[];
  consultations: Consultation[];
  onAddHealthUnit: (unit: Omit<HealthUnit, 'id'>) => void;
  onUpdateHealthUnit: (unit: HealthUnit) => void;
  onAddUnitAdmin: (admin: Omit<HealthUnitAdmin, 'id'>) => void;
  onUpdateUnitAdmin: (admin: HealthUnitAdmin) => void;
  onAddDoctor: (doctor: Omit<Doctor, 'id'>) => void;
  onUpdateDoctor: (doctor: Doctor) => void;
  onAddNurse: (nurse: Omit<Nurse, 'id'>) => void;
  onUpdateNurse: (nurse: Nurse) => void;
  onLogout: () => void;
}

type ActiveTab = 'UNITS_ADMINS' | 'DOCTORS' | 'NURSES';

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  healthUnits,
  healthUnitAdmins,
  doctors,
  nurses,
  patients,
  consultations,
  onAddHealthUnit,
  onUpdateHealthUnit,
  onAddUnitAdmin,
  onUpdateUnitAdmin,
  onAddDoctor,
  onUpdateDoctor,
  onAddNurse,
  onUpdateNurse,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('UNITS_ADMINS');
  
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<HealthUnit | null>(null);
  
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<HealthUnitAdmin | null>(null);
  
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isNurseModalOpen, setIsNurseModalOpen] = useState(false);

  const unitIncomes = useMemo(() => {
    const incomes = new Map<string, number>();
    const patientUnitMap = new Map<string, string>();

    for (const patient of patients) {
      patientUnitMap.set(patient.id, patient.healthUnitId);
    }

    for (const consultation of consultations) {
      if (consultation.cost && consultation.cost > 0) {
        const unitId = patientUnitMap.get(consultation.patientId);
        if (unitId) {
          const currentIncome = incomes.get(unitId) || 0;
          incomes.set(unitId, currentIncome + consultation.cost);
        }
      }
    }
    return incomes;
  }, [patients, consultations]);

  const doctorIncomes = useMemo(() => {
    const incomes = new Map<string, number>();
    for (const consultation of consultations) {
      if (consultation.cost && consultation.cost > 0) {
        const currentIncome = incomes.get(consultation.doctorId) || 0;
        incomes.set(consultation.doctorId, currentIncome + consultation.cost);
      }
    }
    return incomes;
  }, [consultations]);


  const healthUnitsMap = useMemo(() => new Map(healthUnits.map(unit => [unit.id, unit.name])), [healthUnits]);
  
  const TabButton = ({ tabName, label, currentTab }: { tabName: ActiveTab; label: string; currentTab: ActiveTab; }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-semibold rounded-md ${
        currentTab === tabName
          ? 'bg-blue-600 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Panel de Súper Administrador</h1>
            <p className="text-slate-500">Gestión total del sistema.</p>
          </div>
          <button onClick={onLogout} className="mt-2 sm:mt-0 flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors">
            <SwitchUserIcon className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </header>

        <nav className="my-6 flex items-center gap-2 border-b pb-2">
            <TabButton tabName="UNITS_ADMINS" label="Unidades y Admins" currentTab={activeTab} />
            <TabButton tabName="DOCTORS" label="Personal Médico" currentTab={activeTab} />
            <TabButton tabName="NURSES" label="Personal de Enfermería" currentTab={activeTab} />
        </nav>

        <main>
          {activeTab === 'UNITS_ADMINS' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2"><BuildingOfficeIcon className="w-6 h-6"/>Unidades de Salud</h2>
                  <button onClick={() => { setEditingUnit(null); setIsUnitModalOpen(true); }} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <PlusIcon className="w-4 h-4"/><span>Nueva Unidad</span>
                  </button>
                </div>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  {healthUnits.map(unit => {
                    const totalIncome = unitIncomes.get(unit.id) || 0;
                    const unitDoctors = doctors.filter(d => d.healthUnitId === unit.id);
                    return (
                      <div key={unit.id} className="p-4 border rounded-lg bg-slate-50">
                        <div className="flex justify-between items-start">
                           <div>
                            <h3 className="font-semibold text-lg text-slate-800">{unit.name}</h3>
                            <p className="text-sm text-slate-500">{unit.address}</p>
                            <p className="text-sm font-bold text-green-700 mt-2 flex items-center gap-1">
                                <CurrencyDollarIcon className="w-4 h-4" />
                                <span>Ingresos Totales: {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalIncome)}</span>
                            </p>
                           </div>
                           <button onClick={() => { setEditingUnit(unit); setIsUnitModalOpen(true); }} className="p-2 text-slate-500 hover:text-blue-600 shrink-0"><PencilIcon className="w-5 h-5"/></button>
                        </div>
                        
                        {unitDoctors.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Ingresos por Médico</h4>
                                <div className="space-y-1">
                                {unitDoctors.map(doctor => {
                                    const doctorIncome = doctorIncomes.get(doctor.id) || 0;
                                    return (
                                    <div key={doctor.id} className="flex justify-between items-center text-sm pl-2">
                                        <span className="text-slate-600 flex items-center gap-1.5">
                                            <StethoscopeIcon className="w-3.5 h-3.5"/>
                                            {doctor.name}
                                        </span>
                                        <span className="font-semibold text-green-600">
                                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(doctorIncome)}
                                        </span>
                                    </div>
                                    );
                                })}
                                </div>
                            </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2"><ShieldCheckIcon className="w-6 h-6"/>Administradores</h2>
                  <button onClick={() => { setEditingAdmin(null); setIsAdminModalOpen(true); }} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700" disabled={healthUnits.length === 0}>
                    <PlusIcon className="w-4 h-4"/><span>Nuevo Admin</span>
                  </button>
                </div>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  {healthUnitAdmins.map(admin => (
                    <div key={admin.id} className="p-4 border rounded-lg bg-slate-50 flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-slate-800">{admin.name}</h3>
                        <p className="text-sm text-slate-500">Unidad: {healthUnitsMap.get(admin.healthUnitId) || 'No asignada'}</p>
                      </div>
                      <button onClick={() => { setEditingAdmin(admin); setIsAdminModalOpen(true); }} className="p-2 text-slate-500 hover:text-blue-600 shrink-0"><PencilIcon className="w-5 h-5"/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'DOCTORS' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2"><StethoscopeIcon className="w-6 h-6"/>Gestión de Personal Médico</h2>
                <button onClick={() => setIsDoctorModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700" disabled={healthUnits.length === 0}>
                  <PlusIcon className="w-4 h-4"/><span>Añadir Médico</span>
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-4">Total: {doctors.length} médicos.</p>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {doctors.map(doctor => (
                  <div key={doctor.id} className="p-4 border rounded-lg bg-slate-50 flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800">{doctor.name}</h3>
                      <p className="text-sm text-slate-500">Unidad: {healthUnitsMap.get(doctor.healthUnitId) || 'No asignada'}</p>
                    </div>
                    {/* Placeholder for future edit functionality within this view if needed */}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'NURSES' && (
             <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2"><UsersIcon className="w-6 h-6"/>Gestión de Personal de Enfermería</h2>
                <button onClick={() => setIsNurseModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700" disabled={healthUnits.length === 0}>
                  <PlusIcon className="w-4 h-4"/><span>Añadir Personal</span>
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-4">Total: {nurses.length} perfiles.</p>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {nurses.map(nurse => (
                  <div key={nurse.id} className="p-4 border rounded-lg bg-slate-50 flex justify-between items-start">
                     <div>
                      <h3 className="font-semibold text-lg text-slate-800">{nurse.name}</h3>
                      <p className="text-sm text-slate-500">Unidad: {healthUnitsMap.get(nurse.healthUnitId) || 'No asignada'}</p>
                    </div>
                    {/* Placeholder for future edit functionality */}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
      
      <Modal isOpen={isUnitModalOpen} onClose={() => setIsUnitModalOpen(false)} size="2xl">
        <HealthUnitForm unit={editingUnit} onSave={(unit) => { if ('id' in unit) onUpdateHealthUnit(unit); else onAddHealthUnit(unit); setIsUnitModalOpen(false); }} onCancel={() => setIsUnitModalOpen(false)} />
      </Modal>

      <Modal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} size="lg">
        <HealthUnitAdminForm admin={editingAdmin} healthUnits={healthUnits} onSave={(admin) => { if ('id' in admin) onUpdateUnitAdmin(admin); else onAddUnitAdmin(admin); setIsAdminModalOpen(false); }} onCancel={() => setIsAdminModalOpen(false)} />
      </Modal>

      <Modal isOpen={isDoctorModalOpen} onClose={() => setIsDoctorModalOpen(false)} size="2xl">
          <DoctorManagementModal 
            doctors={doctors}
            healthUnits={healthUnits}
            onAddDoctor={onAddDoctor}
            onUpdateDoctor={onUpdateDoctor}
            onClose={() => setIsDoctorModalOpen(false)}
          />
      </Modal>

      <Modal isOpen={isNurseModalOpen} onClose={() => setIsNurseModalOpen(false)} size="2xl">
          <NurseManagementModal
            nurses={nurses}
            healthUnits={healthUnits}
            onAddNurse={onAddNurse}
            onUpdateNurse={onUpdateNurse}
            onClose={() => setIsNurseModalOpen(false)}
          />
      </Modal>
    </div>
  );
};

export default SuperAdminDashboard;