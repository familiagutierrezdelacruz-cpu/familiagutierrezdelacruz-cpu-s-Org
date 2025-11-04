import React, { useState } from 'react';
import { HealthUnit, HealthUnitAdmin } from '../types';

interface HealthUnitAdminFormProps {
  admin?: HealthUnitAdmin | null;
  healthUnits: HealthUnit[];
  onSave: (admin: Omit<HealthUnitAdmin, 'id'> | HealthUnitAdmin) => void;
  onCancel: () => void;
}

const HealthUnitAdminForm: React.FC<HealthUnitAdminFormProps> = ({ admin, healthUnits, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: admin?.name || '',
    healthUnitId: admin?.healthUnitId || (healthUnits[0]?.id || ''),
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const finalValue = name === 'name' ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!admin && !password) {
      setError('La contraseña es obligatoria para nuevos administradores.');
      return;
    }
    if (!formData.healthUnitId) {
        setError('Debe seleccionar una unidad de salud.');
        return;
    }

    const finalAdminData: any = { ...formData };
    if (password) {
      finalAdminData.password = password;
    }

    if (admin) {
      onSave({ ...admin, ...finalAdminData });
    } else {
      onSave(finalAdminData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <h2 className="text-2xl font-bold text-slate-800">{admin ? 'Editar Administrador' : 'Nuevo Administrador'}</h2>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nombre de Usuario</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full input-style" required />
      </div>

      <div>
        <label htmlFor="healthUnitId" className="block text-sm font-medium text-slate-700">Unidad de Salud</label>
        <select name="healthUnitId" value={formData.healthUnitId} onChange={handleChange} className="mt-1 block w-full input-style" required>
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
              <label className="block text-sm font-medium text-slate-700">Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full input-style" placeholder={admin ? 'No cambiar' : ''} required={!admin} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Confirmar Contraseña</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full input-style" required={!admin || !!password} />
            </div>
        </div>
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      </fieldset>
      
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar</button>
      </div>
      <style>{`.input-style { background-color: white; border: 1px solid #cbd5e1; border-radius: 0.375rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; }`}</style>
    </form>
  );
};

export default HealthUnitAdminForm;
