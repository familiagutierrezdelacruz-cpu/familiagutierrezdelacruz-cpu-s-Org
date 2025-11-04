import React, { useState } from 'react';
import { HealthUnit, HealthUnitAdmin, Doctor, Nurse } from '../types';
import Modal from './Modal';
import DoctorManagementModal from './DoctorManagementModal';
import NurseManagementModal from './NurseManagementModal';
import { SwitchUserIcon } from './icons/SwitchUserIcon';
import { StethoscopeIcon } from './icons/StethoscopeIcon';
import { UsersIcon } from './icons/UsersIcon';

interface HealthUnitAdminDashboardProps {
  admin: HealthUnitAdmin;
  healthUnit?: HealthUnit;
  allHealthUnits: HealthUnit[];
  doctors: Doctor[];
  nurses: Nurse[];
  onAddDoctor: (doctor: Omit<Doctor, 'id'>) => void;
  onUpdateDoctor: (doctor: Doctor) => void;
  onAddNurse: (nurse: Omit<Nurse, 'id'>) => void;
  onUpdateNurse: (nurse: Nurse) => void;
  onLogout: () => void;
}

const HealthUnitAdminDashboard: React.FC<HealthUnitAdminDashboardProps> = ({
  admin,
  healthUnit,
  allHealthUnits,
  doctors,
  nurses,
  onAddDoctor,
  onUpdateDoctor,
  onAddNurse,
  onUpdateNurse,
  onLogout,
}) => {
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isNurseModalOpen, setIsNurseModalOpen] = useState(false);

  if (!healthUnit) {
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="text-center">
                <h2 className="text-xl font-bold text-red-600">Error: Unidad de Salud no encontrada.</h2>
                <p className="text-slate-500">Contacte al Súper Administrador.</p>
                <button onClick={onLogout} className="mt-4 px-4 py-2 bg-slate-200 rounded-md">Cerrar Sesión</button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{healthUnit.name}</h1>
            <p className="text-slate-500">Panel de Administración - {admin.name}</p>
          </div>
          <button onClick={onLogout} className="mt-2 sm:mt-0 flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors">
            <SwitchUserIcon className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </header>

        <main className="mt-6">
            <p className="text-center text-slate-600 mb-6">Desde aquí puede gestionar el personal de su unidad de salud.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border rounded-lg bg-blue-50 border-blue-200 text-center">
                    <StethoscopeIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-800">Personal Médico</h2>
                    <p className="text-slate-500 mb-4">{doctors.length} médico(s) registrado(s).</p>
                    <button onClick={() => setIsDoctorModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Gestionar Médicos
                    </button>
                </div>
                <div className="p-6 border rounded-lg bg-teal-50 border-teal-200 text-center">
                    <UsersIcon className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-800">Personal de Enfermería</h2>
                    <p className="text-slate-500 mb-4">{nurses.length} perfil(es) registrado(s).</p>
                     <button onClick={() => setIsNurseModalOpen(true)} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">
                        Gestionar Enfermería
                    </button>
                </div>
            </div>
        </main>
      </div>

      <Modal isOpen={isDoctorModalOpen} onClose={() => setIsDoctorModalOpen(false)} size="2xl">
        <DoctorManagementModal
            doctors={doctors}
            healthUnits={allHealthUnits}
            currentHealthUnitId={healthUnit.id}
            onAddDoctor={onAddDoctor}
            onUpdateDoctor={onUpdateDoctor}
            onClose={() => setIsDoctorModalOpen(false)}
        />
      </Modal>

      <Modal isOpen={isNurseModalOpen} onClose={() => setIsNurseModalOpen(false)} size="2xl">
        <NurseManagementModal
            nurses={nurses}
            healthUnits={allHealthUnits}
            currentHealthUnitId={healthUnit.id}
            onAddNurse={onAddNurse}
            onUpdateNurse={onUpdateNurse}
            onClose={() => setIsNurseModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default HealthUnitAdminDashboard;