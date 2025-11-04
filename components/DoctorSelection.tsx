import React, { useState } from 'react';
// FIX: Imported HealthUnit to use in props.
import { Doctor, Nurse, HealthUnit } from '../types';
import Modal from './Modal';
import DoctorManagementModal from './DoctorManagementModal';
import NurseManagementModal from './NurseManagementModal'; // New component
import { StethoscopeIcon } from './icons/StethoscopeIcon';
import { UserIcon } from './icons/UserIcon';
import { KeyIcon } from './icons/KeyIcon';
import { UsersIcon } from './icons/UsersIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { PowerIcon } from './icons/PowerIcon';

interface LoginScreenProps {
  doctors: Doctor[];
  nurses: Nurse[];
  // FIX: Added healthUnits to the props interface.
  healthUnits: HealthUnit[];
  onSelectDoctor: (doctor: Doctor) => void;
  onAddDoctor: (doctor: Omit<Doctor, 'id'>) => void;
  onUpdateDoctor: (doctor: Doctor) => void;
  onSelectNurse: (nurse: Nurse) => void;
  onAddNurse: (nurse: Omit<Nurse, 'id'>) => void;
  onUpdateNurse: (nurse: Nurse) => void;
}

const DoctorSelection: React.FC<LoginScreenProps> = ({ 
  // FIX: Destructured healthUnits from props.
  doctors, nurses, healthUnits, onSelectDoctor, onAddDoctor, onUpdateDoctor, onSelectNurse, onAddNurse, onUpdateNurse 
}) => {
  const [view, setView] = useState<'main' | 'doctor' | 'nurse'>('main');
  const [isManageDoctorsOpen, setIsManageDoctorsOpen] = useState(false);
  const [isManageNursesOpen, setIsManageNursesOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Doctor | Nurse | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSelect = (item: Doctor | Nurse) => {
    setSelectedItem(item);
    setError('');
    setPassword('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem && selectedItem.password === password) {
      if ('professionalLicense' in selectedItem) { // It's a Doctor
        onSelectDoctor(selectedItem as Doctor);
      } else { // It's a Nurse
        onSelectNurse(selectedItem as Nurse);
      }
    } else {
      setError('Contraseña incorrecta. Por favor, intente de nuevo.');
    }
  };

  const renderList = (items: (Doctor | Nurse)[]) => (
    <div className="space-y-4">
      {items.length > 0 ? (
        items.map(item => (
          <button
            key={item.id}
            onClick={() => handleSelect(item)}
            className="w-full flex items-center gap-4 p-4 text-left bg-slate-50 rounded-lg border hover:bg-blue-50 hover:border-blue-300 transition-all"
          >
            <UserIcon className="w-8 h-8 text-slate-400 shrink-0" />
            <div>
              <p className="font-bold text-lg text-slate-800">{item.name}</p>
              {'professionalLicense' in item && <p className="text-sm text-slate-500">{(item as Doctor).hasSpecialty ? (item as Doctor).specialtyName : 'Médico General'}</p>}
            </div>
          </button>
        ))
      ) : (
        <div className="text-center p-6 border-2 border-dashed rounded-lg">
            <p className="text-slate-500">No hay personal registrado.</p>
        </div>
      )}
    </div>
  );

  const renderSelectionView = (type: 'doctor' | 'nurse') => (
    <>
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => setView('main')} className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
            <ChevronLeftIcon className="w-4 h-4" />
            <span>Volver</span>
        </button>
        <h2 className="text-xl font-bold text-slate-800">Seleccione su Perfil</h2>
        <div className="w-16"></div>
      </div>
      {type === 'doctor' ? renderList(doctors) : renderList(nurses)}
    </>
  );

  const renderMainView = () => (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Bienvenido</h1>
        <p className="text-slate-500">Seleccione su rol para iniciar turno</p>
      </div>
      <div className="space-y-4">
        <button onClick={() => setView('doctor')} className="w-full flex items-center gap-4 p-4 text-left bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 hover:border-blue-400 transition-all">
          <StethoscopeIcon className="w-12 h-12 text-blue-600 shrink-0" />
          <div>
            <p className="font-bold text-xl text-slate-800">Acceder como Médico</p>
            <p className="text-sm text-slate-500">Gestionar pacientes y consultas.</p>
          </div>
        </button>
        <button onClick={() => setView('nurse')} className="w-full flex items-center gap-4 p-4 text-left bg-teal-50 rounded-lg border border-teal-200 hover:bg-teal-100 hover:border-teal-400 transition-all">
          <UsersIcon className="w-12 h-12 text-teal-600 shrink-0" />
          <div>
            <p className="font-bold text-xl text-slate-800">Acceder como Enfermera/o</p>
            <p className="text-sm text-slate-500">Realizar triaje y preparar pacientes.</p>
          </div>
        </button>
      </div>
      <div className="mt-8 pt-6 border-t grid grid-cols-1 sm:grid-cols-2 gap-2">
         <button onClick={() => setIsManageDoctorsOpen(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors">
          <KeyIcon className="w-4 h-4" />
          <span>Gestionar Médicos</span>
        </button>
        <button onClick={() => setIsManageNursesOpen(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors">
          <KeyIcon className="w-4 h-4" />
          <span>Gestionar Enfermería</span>
        </button>
      </div>
       <div className="mt-4">
        <button 
          onClick={() => window.close()} 
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 border border-red-200 transition-colors font-semibold"
        >
          <PowerIcon className="w-5 h-5" />
          <span>Salir de la Aplicación</span>
        </button>
      </div>
    </>
  );


  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl p-8">
        {view === 'main' && renderMainView()}
        {view === 'doctor' && renderSelectionView('doctor')}
        {view === 'nurse' && renderSelectionView('nurse')}
      </div>
      
      <Modal isOpen={isManageDoctorsOpen} onClose={() => setIsManageDoctorsOpen(false)} size="2xl">
        <DoctorManagementModal 
          doctors={doctors}
          // FIX: Passed the required healthUnits prop.
          healthUnits={healthUnits}
          onAddDoctor={onAddDoctor}
          onUpdateDoctor={onUpdateDoctor}
          onClose={() => setIsManageDoctorsOpen(false)}
        />
      </Modal>

      <Modal isOpen={isManageNursesOpen} onClose={() => setIsManageNursesOpen(false)} size="2xl">
        <NurseManagementModal
          nurses={nurses}
          // FIX: Passed the required healthUnits prop.
          healthUnits={healthUnits}
          onAddNurse={onAddNurse}
          onUpdateNurse={onUpdateNurse}
          onClose={() => setIsManageNursesOpen(false)}
        />
      </Modal>

      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} size="lg">
        {selectedItem && (
            <form onSubmit={handleLogin} className="p-2">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Iniciar Sesión</h2>
                <p className="text-slate-600 mb-4">Usuario: <span className="font-bold">{selectedItem.name}</span></p>
                
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">Contraseña</label>
                    <div className="relative mt-1">
                        <KeyIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                            required
                        />
                    </div>
                </div>

                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                    <button type="button" onClick={() => setSelectedItem(null)} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Ingresar</button>
                </div>
            </form>
        )}
      </Modal>
    </div>
  );
};

export default DoctorSelection;
