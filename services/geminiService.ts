import { GoogleGenAI } from "@google/genai";
import { Patient, Consultation } from '../types';
import { calculateAge } from '../utils/dateUtils';


if (!process.env.API_KEY) {
  console.error("API_KEY for Gemini is not set in environment variables.");
}

// FIX: Initialized GoogleGenAI using a named parameter with process.env.API_KEY directly, as per coding guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generatePatientExplanation = async (diagnosis: string): Promise<string> => {
  // FIX: Using process.env.API_KEY directly for the check. This is a useful guard to prevent an unnecessary API call if the key is not configured.
  if (!process.env.API_KEY) {
    return "Error: La clave API de Gemini no está configurada.";
  }
  if (!diagnosis.trim()) {
    return "Por favor, ingrese un diagnóstico para generar una explicación.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Explica el siguiente diagnóstico médico en términos muy simples y claros para un paciente que no tiene conocimientos médicos. Usa un tono tranquilizador y positivo. Diagnóstico: "${diagnosis}"`,
       config: {
        temperature: 0.5,
        topP: 0.95,
        topK: 64,
       }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Hubo un error al generar la explicación. Por favor, intente de nuevo.";
  }
};

const formatDataForPrompt = (patient: Patient, consultation: Consultation): string => {
  const patientAge = calculateAge(patient.dob);

  const vitalSignsText = consultation.vitalSigns 
    ? Object.entries(consultation.vitalSigns)
        .map(([key, value]) => {
          if (value == null) return null;
          const units = { systolicBP: 'mmHg', diastolicBP: 'mmHg', heartRate: 'lpm', respiratoryRate: 'rpm', temperature: '°C', oxygenSaturation: '%', glucose: 'mg/dL', weight: 'kg', height: 'm' };
          const unit = units[key as keyof typeof units] || '';
          return `${key}: ${value}${unit ? ` ${unit}`: ''}`;
        })
        .filter(Boolean)
        .join(', ') 
    : 'No registrados.';
  
  const medicationsText = consultation.prescription?.medications.length > 0
    ? consultation.prescription.medications.map(m => `- ${m.name}: ${m.indication} (Vía: ${m.route})`).join('\n')
    : 'Ninguno.';
    
  return `
DATOS CLÍNICOS PARA NOTA MÉDICA:

--- PACIENTE ---
- Edad: ${patientAge}
- Sexo: ${patient.gender}
- CURP: ${patient.curp || 'No registrado'}
- Alergias: ${patient.allergies || 'No registradas'}
- Antecedentes Heredo-Familiares: ${patient.familyHistory || 'No registrados'}
- Antecedentes Personales Patológicos: ${patient.pathologicalHistory || 'No registrados'}
- Antecedentes Personales No Patológicos: ${patient.nonPathologicalHistory || 'No registrados'}
- Antecedentes Quirúrgicos: ${patient.surgicalHistory || 'No registrados'}
- Antecedentes Gineco-Obstétricos: ${patient.gender === 'Femenino' ? (patient.gynecologicalHistory || 'No registrados') : 'No aplica'}

--- CONSULTA ACTUAL (${new Date(consultation.date).toLocaleDateString('es-MX')}) ---
- Motivo Principal de Consulta (MPC): ${consultation.reason}
- Signos Vitales: ${vitalSignsText}
- Exploración Física: ${consultation.physicalExam || 'No registrada'}
- Resultados de Laboratorio Presentados: ${consultation.labResults || 'Ninguno'}
- Diagnóstico(s) Registrado(s): ${consultation.diagnosis}
- Estudios Solicitados: ${consultation.labStudies || 'Ninguno'}
- Tratamiento Farmacológico:
${medicationsText}
- Indicaciones Generales / Tratamiento No Farmacológico:
${consultation.prescription?.instructions || 'Ninguna'}
- Cita de Seguimiento: ${consultation.nextAppointment ? new Date(consultation.nextAppointment + 'T00:00:00').toLocaleDateString('es-MX') : 'No especificada'}
  `;
};

export const generateAIMedicalNote = async (patient: Patient, consultation: Consultation): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Error: La clave API de Gemini no está configurada.";
  }

  const userData = formatDataForPrompt(patient, consultation);
  const fullPrompt = `Actúa como un médico experto. Tu tarea es redactar una nota médica profesional y estructurada utilizando exclusivamente los datos clínicos que te serán proporcionados a continuación. La nota debe seguir rigurosamente el formato PSOA (Presentación, Subjetivo, Objetivo, Análisis) y debe concluir con un Plan de Diagnóstico y Tratamiento.

Por favor, organiza la información en las siguientes secciones:

1. PRESENTACIÓN (P)
Resumen conciso: Comienza con un breve resumen que incluya: Edad y sexo del paciente, motivo principal de la consulta (MPC), tiempo de evolución y los hallazgos clínicos más relevantes.

2. DATOS SUBJETIVOS (S)
Motivo de Consulta: ¿Por qué viene el paciente?
Historia de la Enfermedad Actual (HEA): Relato detallado de los síntomas, usando la metodología LOQSMARTAS (Localización, Calidad/Carácter, Quantidad/Severidad, Momento de inicio, Atenuantes/Agravantes, Radiación, Temporalidad, Signos y síntomas Asociados).
Revisión por Sistemas (RPS): Menciona hallazgos positivos y negativos relevantes de otros sistemas (ej: "Niega fiebre, cefalea, náuseas").
Antecedentes Personales Patológicos y No Patológicos (APPS): Incluye alergias, medicamentos habituales, antecedentes quirúrgicos y médicos relevantes, hábitos (tabaco, alcohol).

3. DATOS OBJETIVOS (O)
Signos Vitales y Parámetros: TA, FC, FR, Temp, SatO2, Peso/Talla/IMC (si aplica).
Exploración Física:
Apariencia General: Estado general, complexión, hidratación.
Por Sistemas: Descripción de hallazgos en Cabeza, Cuello, Tórax, Corazón, Pulmones, Abdomen, Extremidades, Sistema Nervioso, Piel, etc. Sé específico. Incluye solo lo relevante para el caso.
Estudios de Gabinete y Laboratorio (si se tienen): Incluye resultados de exámenes auxiliares (ej: radiografía, biometría hemática, química sanguínea). Interpreta los hallazgos anormales.

4. ANÁLISIS / ASSESSMENT (A)
Impresión Diagnóstica Sintetizada: Integra de manera lógica la información más relevante de las secciones Subjetiva y Objetiva para justificar tu diagnóstico.
Diagnóstico(s) Principal(es) y Secundario(s): Enumera los diagnósticos usando terminología médica estándar (ej. CIE-10). Comienza con el diagnóstico más probable.

5. PLAN TERAPÉUTICO Y DIAGNÓSTICO
Plan Diagnóstico (Estudios Solicitados): Lista los exámenes, gabinete o laboratorio que se deben solicitar para confirmar el diagnóstico o descartar diferenciales.
Plan Terapéutico (Tratamiento):
Farmacológico: Lista de medicamentos, dosis, frecuencia y vía.
No Farmacológico: Recomendaciones de estilo de vida, dieta, actividad física, fisioterapia, etc.
Educación al Paciente: Puntos clave a explicarle al paciente sobre su condición y tratamiento.
Plan de Seguimiento: Cuándo debe regresar a consulta y bajo qué condiciones debe regresar antes.

--- DATOS CLÍNICOS ---
${userData}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: fullPrompt,
    });
    
    let noteText = response.text;
    
    // Remove the conversational preamble and separator generated by the AI.
    const separator = '---';
    const separatorIndex = noteText.indexOf(separator);

    if (separatorIndex !== -1) {
      // If the separator is found, take everything after it.
      noteText = noteText.substring(separatorIndex + separator.length).trim();
    }
    
    return noteText;

  } catch (error) {
    console.error("Error calling Gemini API for medical note:", error);
    return "Hubo un error al generar la nota médica. Por favor, intente de nuevo.";
  }
};