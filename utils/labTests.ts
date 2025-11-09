interface LabParameter {
    name: string;
    type: 'text' | 'select';
    options?: string[];
}

interface LabTest {
    name: string;
    parameters: LabParameter[];
}

export const COMMON_LAB_TESTS: LabTest[] = [
    {
        name: "BIOMETRIA HEMATICA COMPLETA",
        parameters: [
            { name: 'Hemoglobina (g/dL)', type: 'text' },
            { name: 'Hematocrito (%)', type: 'text' },
            { name: 'Leucocitos (mil/mm³)', type: 'text' },
            { name: 'Neutrófilos (%)', type: 'text' },
            { name: 'Linfocitos (%)', type: 'text' },
            { name: 'Plaquetas (mil/mm³)', type: 'text' },
        ],
    },
    {
        name: "QUIMICA SANGUINEA 7",
        parameters: [
            { name: 'Glucosa (mg/dL)', type: 'text' },
            { name: 'Urea (mg/dL)', type: 'text' },
            { name: 'Creatinina (mg/dL)', type: 'text' },
            { name: 'Ácido Úrico (mg/dL)', type: 'text' },
            { name: 'Colesterol Total (mg/dL)', type: 'text' },
            { name: 'Triglicéridos (mg/dL)', type: 'text' },
            { name: 'Nitrógeno Ureico (BUN) (mg/dL)', type: 'text' },
        ],
    },
    {
        name: "EXAMEN GENERAL DE ORINA",
        parameters: [
            { name: 'Color', type: 'text' },
            { name: 'Aspecto', type: 'text' },
            { name: 'Densidad', type: 'text' },
            { name: 'pH', type: 'text' },
            { name: 'Leucocitos', type: 'text' },
            { name: 'Nitritos', type: 'text' },
            { name: 'Proteínas', type: 'text' },
            { name: 'Glucosa', type: 'text' },
            { name: 'Cetonas', type: 'text' },
            { name: 'Sangre', type: 'text' },
        ],
    },
    {
        name: "REACCIONES FEBRILES",
        parameters: [
            { name: 'Tífico O', type: 'text' },
            { name: 'Tífico H', type: 'text' },
            { name: 'Paratífico A', type: 'text' },
            { name: 'Paratífico B', type: 'text' },
            { name: 'Brucella abortus', type: 'text' },
            { name: 'Proteus OX-19', type: 'text' },
        ],
    },
    {
        name: "PRUEBAS DE DENGUE",
        parameters: [
            { name: 'Antígeno NS1', type: 'select', options: ['Positivo', 'Negativo'] },
            { name: 'Anticuerpos IgG', type: 'select', options: ['Positivo', 'Negativo'] },
            { name: 'Anticuerpos IgM', type: 'select', options: ['Positivo', 'Negativo'] },
        ],
    },
    {
        name: "HEMOGLOBINA GLUCOSILADA",
        parameters: [
            { name: 'HbA1c (%)', type: 'text' },
        ],
    },
];
