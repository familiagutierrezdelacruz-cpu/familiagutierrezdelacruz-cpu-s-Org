import React, { useState } from 'react';
import { Nurse, HealthUnit } from '../types';

interface NurseFormProps {
  nurse?: Nurse;
  healthUnits: HealthUnit[];
  currentHealthUnitId?: string;
  onSave: (nurse: Omit<Nurse, 'id'> | Nurse) => void;
  onCancel: () => void;
}

const NurseForm: React.FC<NurseFormProps> = ({ nurse, healthUnits, currentHealthUnitId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: nurse?.name || '',
    healthUnitId: nurse?.healthUnitId || currentHealthUnitId || healthUnits[0]?.id || ''
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setFormData(prev => ({...prev, name: value.toUpperCase()}));
    } else {
      setFormData(prev => ({...prev, [name]: value}));
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!nurse && !password) {
      setError('La contraseña es obligatoria para nuevos perfiles.');
      return;
    }
    
    const finalNurseData: any = { ...formData };
    if (password) {
      finalNurseData.password = password;
    }

    if (nurse) {
      onSave({ ...nurse, ...finalNurseData });
    } else {
      onSave(finalNurseData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold text-slate-800">{nurse ? 'Editar Perfil' : 'Nuevo Perfil de Enfermería'}</h3>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nombre Completo</label>
        <input 
            type="text" 
            name="name" 
            id="name" 
            value={formData.name} 
            onChange={handleChange} 
            className="mt-1 block w-full input-style" 
            required 
        />
      </div>
       <div>
        <label htmlFor="healthUnitId" className="block text-sm font-medium text-slate-700">Unidad de Salud</label>
        <select 
          name="healthUnitId" 
          id="healthUnitId" 
          value={formData.healthUnitId} 
          onChange={handleChange} 
          className="mt-1 block w-full input-style" 
          disabled={!!currentHealthUnitId}
          required
        >
           <option value="" disabled>Seleccione una unidad</option>
           {healthUnits.map(unit => (
            <option key={unit.id} value={unit.id}>{unit.name}</option>
           ))}
        </select>
      </div>
     
       <fieldset className="border p-4 rounded-md space-y-4">
        <legend className="text-sm font-semibold text-slate-700 px-2">Seguridad</legend>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Contraseña</label>
              <input type="password" name="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full input-style" placeholder={nurse ? 'Dejar en blanco para no cambiar' : ''} required={!nurse} />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirmar Contraseña</label>
              <input type="password" name="confirmPassword" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full input-style" required={!nurse || !!password} />
            </div>
        </div>
         {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      </fieldset>
      
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar</button>
      </div>
      <style>{`.input-style { background-color: white; border: 1px solid #cbd5e1; border-radius: 0.375rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); outline: none;} .input-style:focus { ring: 2px; ring-color: #3b82f6; border-color: #3b82f6;}`}</style>
    </form>
  );
};

export default NurseForm;