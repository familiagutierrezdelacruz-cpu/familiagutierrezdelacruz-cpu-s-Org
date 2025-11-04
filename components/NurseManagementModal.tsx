import React, { useState } from 'react';
import { Nurse } from '../types';
import NurseForm from './NurseForm';
import { PlusIcon } from './icons/PlusIcon';
import { PencilIcon } from './icons/PencilIcon';

interface NurseManagementModalProps {
  nurses: Nurse[];
  onAddNurse: (nurse: Omit<Nurse, 'id'>) => void;
  onUpdateNurse: (nurse: Nurse) => void;
  onClose: () => void;
}

const NurseManagementModal: React.FC<NurseManagementModalProps> = ({ nurses, onAddNurse, onUpdateNurse, onClose }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingNurse, setEditingNurse] = useState<Nurse | null>(null);

  const handleAddNew = () => {
    setEditingNurse(null);
    setIsFormVisible(true);
  };

  const handleEdit = (nurse: Nurse) => {
    setEditingNurse(nurse);
    setIsFormVisible(true);
  };

  const handleSaveNurse = (nurseData: Omit<Nurse, 'id'> | Nurse) => {
    if ('id' in nurseData) {
      onUpdateNurse(nurseData as Nurse);
    } else {
      onAddNurse(nurseData);
    }
    setIsFormVisible(false);
    setEditingNurse(null);
  };

  return (
    <div className="p-1 max-h-[85vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Gestión de Personal de Enfermería</h2>
      
      {isFormVisible ? (
        <NurseForm 
          nurse={editingNurse || undefined}
          onSave={handleSaveNurse}
          onCancel={() => setIsFormVisible(false)}
        />
      ) : (
        <>
          <ul className="space-y-3 mb-6">
            {nurses.map(nurse => (
              <li key={nurse.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border">
                <div>
                  <p className="font-semibold text-slate-800">{nurse.name}</p>
                </div>
                <button onClick={() => handleEdit(nurse)} className="p-2 text-slate-600 hover:text-blue-600 rounded-md hover:bg-slate-200">
                  <PencilIcon className="w-5 h-5"/>
                </button>
              </li>
            ))}
             {nurses.length === 0 && <p className="text-center text-slate-500 py-4">No hay personal de enfermería registrado.</p>}
          </ul>
          <div className="flex justify-between items-center">
            <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cerrar</button>
            <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <PlusIcon className="w-5 h-5"/>
              <span>Añadir Personal</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NurseManagementModal;
