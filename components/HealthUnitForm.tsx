import React, { useState } from 'react';
import { HealthUnit } from '../types';

interface HealthUnitFormProps {
  unit?: HealthUnit | null;
  onSave: (unit: Omit<HealthUnit, 'id'> | HealthUnit) => void;
  onCancel: () => void;
}

const HealthUnitForm: React.FC<HealthUnitFormProps> = ({ unit, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<HealthUnit, 'id'>>({
    name: unit?.name || '',
    address: unit?.address || '',
    phone: unit?.phone || '',
    slogan: unit?.slogan || '',
    logo: unit?.logo || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, logo: reader.result as string }));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (unit) {
      onSave({ ...unit, ...formData });
    } else {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1 max-h-[85vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-slate-800">{unit ? 'Editar Unidad de Salud' : 'Nueva Unidad de Salud'}</h2>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nombre de la Unidad</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full input-style" required />
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-slate-700">Dirección</label>
        <input type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full input-style" required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Teléfono</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full input-style" />
        </div>
        <div>
          <label htmlFor="slogan" className="block text-sm font-medium text-slate-700">Slogan (Opcional)</label>
          <input type="text" name="slogan" value={formData.slogan} onChange={handleChange} className="mt-1 block w-full input-style" />
        </div>
      </div>
      <div>
        <label htmlFor="logo" className="block text-sm font-medium text-slate-700">Logo</label>
        <input type="file" name="logo" onChange={handleLogoChange} accept="image/*" className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        {formData.logo && <img src={formData.logo} alt="Vista previa del logo" className="mt-2 h-16 w-auto border rounded-md" />}
      </div>
      
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar</button>
      </div>
      <style>{`.input-style { background-color: white; border: 1px solid #cbd5e1; border-radius: 0.375rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; }`}</style>
    </form>
  );
};

export default HealthUnitForm;
