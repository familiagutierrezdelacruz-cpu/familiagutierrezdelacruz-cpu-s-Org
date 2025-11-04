import React, { useState, useMemo, useEffect } from 'react';
import { Patient, Doctor, Consultation, VitalSigns, Nurse } from '../types';

interface TriageFormProps {
  patient: Patient;
  doctors: Doctor[];
  nurse: Nurse;
  onSave: (triageData: Omit<Consultation, 'id'>) => void;
  onCancel: () => void;
}

const TriageForm: React.FC<TriageFormProps> = ({ patient, doctors, nurse, onSave, onCancel }) => {
  const [reason, setReason] = useState('');
  const [doctorId, setDoctorId] = useState<string>(doctors[0]?.id || '');
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({});

  const bmi = useMemo(() => {
    const weight = Number(vitalSigns.weight);
    const height = Number(vitalSigns.height);
    if (weight > 0 && height > 0) {
      const bmiValue = weight / (height * height);
      let interpretation = 'Desconocido';
      if (bmiValue < 18.5) interpretation = 'Bajo peso';
      else if (bmiValue < 25) interpretation = 'Normal';
      else if (bmiValue < 30) interpretation = 'Sobrepeso';
      else interpretation = 'Obesidad';
      return { value: bmiValue.toFixed(2), interpretation };
    }
    return { value: '', interpretation: '' };
  }, [vitalSigns.weight, vitalSigns.height]);

  const map = useMemo(() => {
    const systolic = Number(vitalSigns.systolicBP);
    const diastolic = Number(vitalSigns.diastolicBP);
    if (systolic > 0 && diastolic > 0 && systolic >= diastolic) {
      const mapValue = diastolic + (systolic - diastolic) / 3;
      return mapValue.toFixed(1);
    }
    return null;
  }, [vitalSigns.systolicBP, vitalSigns.diastolicBP]);

  useEffect(() => {
    setVitalSigns(prev => ({
      ...prev,
      bmi: bmi.value || undefined,
      bmiInterpretation: bmi.interpretation || undefined,
      map: map ? Number(map) : undefined,
    }));
  }, [bmi, map]);

  const handleVitalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVitalSigns(prev => ({ ...prev, [name]: value ? Number(value) : undefined }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) {
        alert("Por favor, seleccione un médico tratante.");
        return;
    }
    
    const triageData: Omit<Consultation, 'id'> = {
      patientId: patient.id,
      doctorId: doctorId,
      date: new Date().toISOString(),
      reason,
      vitalSigns,
      status: 'TRIAGE',
      triageBy: nurse.name,
      diagnosis: '', // Will be filled by doctor
      prescription: { medications: [] }, // Will be filled by doctor
    };
    onSave(triageData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1 max-h-[85vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-slate-800">Triaje de Consulta</h2>
      <p className="text-slate-600">Paciente: <span className="font-bold">{patient.name}</span></p>

      <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="text-lg font-semibold text-slate-700 px-2">Motivo y Asignación</legend>
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-slate-700">Motivo de la Consulta</label>
          <textarea 
            name="reason" 
            id="reason" 
            value={reason} 
            onChange={(e) => setReason(e.target.value.toUpperCase())} 
            rows={2} 
            className="mt-1 block w-full input-style" 
            required 
          />
        </div>
        <div>
          <label htmlFor="doctorId" className="block text-sm font-medium text-slate-700">Asignar a Médico</label>
          <select 
            name="doctorId" 
            id="doctorId"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="mt-1 block w-full input-style"
            required
          >
            {doctors.map(doc => (
              <option key={doc.id} value={doc.id}>{doc.name}</option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="text-lg font-semibold text-slate-700 px-2">Signos Vitales</legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
                <label className="block text-xs font-medium text-slate-600">T.A. Sistólica (mmHg)</label>
                <input type="number" name="systolicBP" value={vitalSigns.systolicBP || ''} onChange={handleVitalsChange} className="mt-1 block w-full input-style" />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-600">T.A. Diastólica (mmHg)</label>
                <input type="number" name="diastolicBP" value={vitalSigns.diastolicBP || ''} onChange={handleVitalsChange} className="mt-1 block w-full input-style" />
            </div>
            {map && (
                <div className="p-2 bg-slate-100 rounded-md text-center">
                    <p className="text-xs font-medium text-slate-600">T.A. Media (PAM)</p>
                    <p className="font-bold text-slate-800">{map} mmHg</p>
                </div>
            )}
            <div>
                <label className="block text-xs font-medium text-slate-600">F.C. (lpm)</label>
                <input type="number" name="heartRate" value={vitalSigns.heartRate || ''} onChange={handleVitalsChange} className="mt-1 block w-full input-style" />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-600">F.R. (rpm)</label>
                <input type="number" name="respiratoryRate" value={vitalSigns.respiratoryRate || ''} onChange={handleVitalsChange} className="mt-1 block w-full input-style" />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-600">Temp (°C)</label>
                <input type="number" step="0.1" name="temperature" value={vitalSigns.temperature || ''} onChange={handleVitalsChange} className="mt-1 block w-full input-style" />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-600">Sat O₂ (%)</label>
                <input type="number" name="oxygenSaturation" value={vitalSigns.oxygenSaturation || ''} onChange={handleVitalsChange} className="mt-1 block w-full input-style" />
            </div>
             <div>
                <label className="block text-xs font-medium text-slate-600">Glucosa (mg/dL)</label>
                <input type="number" name="glucose" value={vitalSigns.glucose || ''} onChange={handleVitalsChange} className="mt-1 block w-full input-style" />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-600">Peso (kg)</label>
                <input type="number" step="0.1" name="weight" value={vitalSigns.weight || ''} onChange={handleVitalsChange} className="mt-1 block w-full input-style" />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-600">Talla (m)</label>
                <input type="number" step="0.01" name="height" value={vitalSigns.height || ''} onChange={handleVitalsChange} className="mt-1 block w-full input-style" />
            </div>
            {bmi.value && (
                <div className="p-2 bg-slate-100 rounded-md text-center">
                    <p className="text-xs font-medium text-slate-600">IMC</p>
                    <p className="font-bold text-slate-800">{bmi.value}</p>
                    <p className="text-xs text-slate-500">{bmi.interpretation}</p>
                </div>
            )}
        </div>
      </fieldset>
      
      <div className="flex justify-end space-x-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Enviar a Médico</button>
      </div>

       <style>{`.input-style { background-color: white; border: 1px solid #cbd5e1; border-radius: 0.375rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); outline: none;} .input-style:focus { ring: 2px; ring-color: #3b82f6; border-color: #3b82f6;}`}</style>
    </form>
  );
};

export default TriageForm;