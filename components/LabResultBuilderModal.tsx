import React, { useState } from 'react';
import { COMMON_LAB_TESTS } from '../utils/labTests';

interface LabResultBuilderModalProps {
    onSave: (results: string) => void;
    onCancel: () => void;
}

type LabResultsState = {
    [testName: string]: {
        [parameterName: string]: string;
    };
};

const LabResultBuilderModal: React.FC<LabResultBuilderModalProps> = ({ onSave, onCancel }) => {
    const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
    const [resultsData, setResultsData] = useState<LabResultsState>({});

    const handleTestSelectionChange = (testName: string) => {
        const newSelectedTests = new Set(selectedTests);
        if (newSelectedTests.has(testName)) {
            newSelectedTests.delete(testName);
            // Also remove data for this test
            const newResultsData = { ...resultsData };
            delete newResultsData[testName];
            setResultsData(newResultsData);
        } else {
            newSelectedTests.add(testName);
            // Initialize data for this test
            setResultsData(prev => ({ ...prev, [testName]: {} }));
        }
        setSelectedTests(newSelectedTests);
    };

    const handleParameterChange = (testName: string, paramName: string, value: string) => {
        setResultsData(prev => ({
            ...prev,
            [testName]: {
                ...prev[testName],
                [paramName]: value,
            },
        }));
    };
    
    const handleSave = () => {
        let formattedString = '';
        
        // FIX: Explicitly type 'testName' to avoid it being inferred as 'unknown'.
        Array.from(selectedTests).forEach((testName: string, index) => {
            const testDetails = COMMON_LAB_TESTS.find(t => t.name === testName);
            const testResults = resultsData[testName];

            if (!testDetails || !testResults) return;

            formattedString += `--- ${testName.toUpperCase()} ---\n`;
            
            testDetails.parameters.forEach((param) => {
                const value = testResults[param.name];
                if (value !== undefined && value.trim() !== '') {
                    formattedString += `${param.name}: ${value}\n`;
                }
            });
            
            if (index < selectedTests.size -1) {
                formattedString += '\n';
            }
        });
        
        onSave(formattedString.trim());
    };

    return (
        <div className="p-1 max-h-[85vh] flex flex-col">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Constructor de Resultados de Laboratorio</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-y-auto">
                {/* Test Selection Column */}
                <div className="border-r pr-4">
                    <h3 className="font-semibold text-slate-700 mb-2">1. Seleccione los estudios presentados</h3>
                    <div className="space-y-2">
                        {COMMON_LAB_TESTS.map(test => (
                            <label key={test.name} className="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedTests.has(test.name)}
                                    onChange={() => handleTestSelectionChange(test.name)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-3 text-sm font-medium text-slate-800">{test.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Parameter Input Column */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-slate-700 mb-2">2. Ingrese los valores</h3>
                     {selectedTests.size > 0 ? (
                        // FIX: Explicitly type 'testName' to avoid it being inferred as 'unknown'.
                        Array.from(selectedTests).map((testName: string) => {
                            const testDetails = COMMON_LAB_TESTS.find(t => t.name === testName);
                            if (!testDetails) return null;
                            
                            return (
                                <fieldset key={testName} className="border p-3 rounded-md">
                                    <legend className="text-sm font-bold text-slate-600 px-1">{testName}</legend>
                                    <div className="space-y-2 mt-2">
                                        {testDetails.parameters.map((param) => (
                                            <div key={param.name} className="grid grid-cols-2 items-center gap-2">
                                                <label htmlFor={`${testName}-${param.name}`} className="text-xs font-medium text-slate-600 text-right">{param.name}</label>
                                                {param.type === 'select' && param.options ? (
                                                     <select
                                                        id={`${testName}-${param.name}`}
                                                        value={resultsData[testName]?.[param.name] || ''}
                                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleParameterChange(testName, param.name, e.target.value)}
                                                        className="block w-full input-style-sm"
                                                    >
                                                        <option value=""></option>
                                                        {param.options.map((opt: string) => <option key={opt} value={opt.toUpperCase()}>{opt}</option>)}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        id={`${testName}-${param.name}`}
                                                        value={resultsData[testName]?.[param.name] || ''}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleParameterChange(testName, param.name, e.target.value.toUpperCase())}
                                                        className="block w-full input-style-sm"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </fieldset>
                            )
                        })
                    ) : (
                        <div className="text-center text-slate-400 pt-10">
                            <p>Seleccione un estudio de la lista de la izquierda para comenzar a ingresar resultados.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end space-x-2 pt-6 mt-4 border-t">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancelar</button>
                <button type="button" onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar Resultados</button>
            </div>
            <style>{`
                .input-style-sm { 
                    background-color: white; 
                    border: 1px solid #cbd5e1; 
                    border-radius: 0.375rem; 
                    padding: 0.25rem 0.5rem; 
                    font-size: 0.875rem; 
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); 
                    outline: none;
                } 
                .input-style-sm:focus { 
                    --tw-ring-color: #3b82f6;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px var(--tw-ring-color);
                }
            `}</style>
        </div>
    );
};

export default LabResultBuilderModal;
