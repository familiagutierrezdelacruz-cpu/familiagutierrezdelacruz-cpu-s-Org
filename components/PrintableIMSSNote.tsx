import React from 'react';
import { Patient, Doctor, Consultation, HealthUnit } from '../types';

interface PrintableIMSSNoteProps {
  patient: Patient;
  doctor: Doctor;
  consultation: Consultation;
  healthUnit: HealthUnit;
}

const PrintableIMSSNote: React.FC<PrintableIMSSNoteProps> = React.forwardRef<HTMLDivElement, PrintableIMSSNoteProps>(({ patient, doctor, consultation, healthUnit }, ref) => {
  const vitals = consultation.vitalSigns;

  return (
    <div ref={ref} id="printable-imss-note" className="p-4 bg-white text-black font-sans text-xs">
        {/* HEADER */}
        <header className="text-center mb-2">
            <h3 className="font-bold">UNIDAD DE SALUD DE PRIMER NIVEL SUCHIAPA</h3>
            <h3 className="font-bold">IMSS BIENESTAR</h3>
            <h4 className="font-bold">NOTA DE ATENCION EN CONSULTA</h4>
        </header>

        {/* SECTION A: PATIENT ID */}
        <div className="border-2 border-black p-1">
            <p className="font-bold text-center text-sm mb-1">A. IDENTIFICACIÓN DEL PACIENTE</p>
            <div className="grid grid-cols-2 gap-x-2 text-[9pt]">
                <div><span className="font-bold">FECHA DE ATENCION:</span> {new Date(consultation.date).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit' })}</div>
                <div></div>
                <div><span className="font-bold">NOMBRE DEL PACIENTE:</span> {patient.name}</div>
                <div><span className="font-bold">FECHA DE NACIMIENTO:</span> {new Date(patient.dob + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                <div><span className="font-bold">CURP:</span> {patient.curp || 'N/A'}</div>
            </div>
        </div>

        {/* SECTION B: VITALS, DIAGNOSIS, ETC. */}
        <div className="border-2 border-black border-t-0 p-1 min-h-[650px]">
            <p className="font-bold text-center text-sm mb-1">B. SIGNOS VITALES, DIAGNÓSTICO, PRESCRIPCIÓN Y EVOLUCIÓN</p>
            <div className="flex h-full">
                <div className="w-[25%] pr-1 border-r border-black text-[9pt]">
                    <p><span className="font-bold">TA:</span> {vitals?.systolicBP && vitals.diastolicBP ? `${vitals.systolicBP}/${vitals.diastolicBP}`:''}</p>
                    <p><span className="font-bold">FC:</span> {vitals?.heartRate ? `${vitals.heartRate} LPM`: ''}</p>
                    <p><span className="font-bold">FR:</span> {vitals?.respiratoryRate ? `${vitals.respiratoryRate} RPM` : ''}</p>
                    <p><span className="font-bold">T°:</span> {vitals?.temperature ? `${vitals.temperature} °C` : ''}</p>
                    <p><span className="font-bold">SaO₂:</span> {vitals?.oxygenSaturation ? `${vitals.oxygenSaturation} %` : ''}</p>
                    <p><span className="font-bold">PESO:</span> {vitals?.weight ? `${vitals.weight} KGS` : ''}</p>
                    <p><span className="font-bold">TALLA:</span> {vitals?.height ? `${(vitals.height * 100).toFixed(0)} CMS` : ''}</p>
                    <p><span className="font-bold">IMC:</span> {vitals?.bmi || ''}</p>
                    <p className="mt-4"><span className="font-bold">GLUC:</span> {vitals?.glucose ? `${vitals.glucose} MG/DL` : ''}</p>
                </div>
                <div className="w-[75%] pl-2">
                    {consultation.aiMedicalNote ? (
                        <pre className="whitespace-pre-wrap font-sans text-[9pt] leading-snug">{consultation.aiMedicalNote}</pre>
                    ) : (
                        <div className="h-full flex items-center justify-center p-4">
                            <p className="text-red-600 font-bold text-center">
                                Nota médica de IA no generada.<br/>
                                Por favor, genere la nota desde el historial del paciente antes de imprimir este formato.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        {/* FOOTER */}
        <div className="mt-16 text-center text-xs">
            <div className="inline-block border-t-2 border-black pt-1 px-12">
                <p className="font-bold">{doctor.name}</p>
                <p>CÉD. PROF. {doctor.professionalLicense}</p>
                <p>FIRMA DEL MÉDICO</p>
            </div>
        </div>
        <style>{`
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                #printable-imss-note {
                    font-size: 10pt;
                }
            }
        `}</style>
    </div>
  );
});

export default PrintableIMSSNote;