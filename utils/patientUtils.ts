import { Patient } from '../types';

/**
 * Genera el siguiente código de paciente disponible.
 * Busca el número más alto en los códigos existentes (ej: de 'P-042' extrae 42),
 * le suma 1 y lo formatea como 'P-043'.
 * @param patients La lista actual de todos los pacientes.
 * @returns El siguiente código de paciente como un string.
 */
export const generateNextPatientCode = (patients: Patient[]): string => {
  if (!patients || patients.length === 0) {
    return 'P-001';
  }

  const maxId = patients.reduce((max, p) => {
    if (p.patientCode && p.patientCode.startsWith('P-')) {
      const num = parseInt(p.patientCode.substring(2), 10);
      if (!isNaN(num) && num > max) {
        return num;
      }
    }
    return max;
  }, 0);

  const nextId = maxId + 1;
  return `P-${nextId.toString().padStart(3, '0')}`;
};