import React from 'react';
import { Patient, Doctor, Consultation, HealthUnit } from '../types';
import { calculateAge } from '../utils/dateUtils';

interface PrintableAINoteProps {
  patient: Patient;
  doctor: Doctor;
  consultation: Consultation;
  healthUnit: HealthUnit;
  noteContent: string;
}

const PrintableAINote: React.FC<PrintableAINoteProps> = React.forwardRef<HTMLDivElement, PrintableAINoteProps>(({ patient, doctor, consultation, healthUnit, noteContent }, ref) => {
  const consultDate = new Date(consultation.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
  const patientAge = calculateAge(patient.dob);

  return (
    <div ref={ref} id="printable-ai-note" className="p-4 sm:p-6 font-serif bg-white text-black text-sm">
        <header className="text-center pb-2 border-b-2 border-black">
            <div className="flex justify-center items-center gap-4">
                {healthUnit?.logo && <img src={healthUnit.logo} alt="Logo" className="h-16 w-auto"/>}
                <div>
                    <h1 className="text-xl font-bold">{healthUnit?.name || 'CONSULTORIO MÉDICO'}</h1>
                    <p className="text-xs">{healthUnit?.address}</p>
                    <p className="text-xs">TEL. {healthUnit?.phone}</p>
                </div>
            </div>
        </header>
        
        <main className="mt-4">
            <h2 className="text-xl font-bold text-center mb-4">NOTA MÉDICA DE EVOLUCIÓN</h2>
            
            <section className="border-y-2 border-black py-2 text-xs mb-4">
                <div className="grid grid-cols-2 gap-x-4">
                    <p><span className="font-bold">PACIENTE:</span> {patient.name.toUpperCase()}</p>
                    {patient.patientCode && <p><span className="font-bold">CÓDIGO:</span> {patient.patientCode}</p>}
                    <p><span className="font-bold">EDAD:</span> {patientAge?.toUpperCase()}</p>
                    <p><span className="font-bold">FECHA:</span> {consultDate}</p>
                </div>
            </section>

            <section className="text-sm">
                <p className="whitespace-pre-wrap">{noteContent}</p>
            </section>
        </main>

        <footer className="mt-24 pt-4 text-xs">
            <div className="text-center">
                <div className="inline-block border-t-2 border-black pt-1 px-12">
                    <p className="font-bold">{doctor.name}</p>
                    <p>CÉD. PROF. {doctor.professionalLicense}</p>
                    <p>FIRMA DEL MÉDICO</p>
                </div>
            </div>
        </footer>
        <style>{`
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                #printable-ai-note {
                    font-size: 10pt;
                }
                #printable-ai-note h1 { font-size: 14pt; }
                #printable-ai-note h2 { font-size: 12pt; }
                #printable-ai-note p { font-size: 10pt; line-height: 1.4; }
                #printable-ai-note section, #printable-ai-note main, #printable-ai-note footer {
                    break-inside: avoid;
                }
            }
        `}</style>
    </div>
  );
});

export default PrintableAINote;