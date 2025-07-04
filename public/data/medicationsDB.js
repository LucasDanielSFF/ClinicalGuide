export const DB_VERSION = '0.2.0';
export const medicationsDB = {
  cetamina: {
    id: 'cetamina',
    name: 'Cetamina',
    admtype: {
      bolus: {
        dose: { min: 1, max: 5, step: 0.1, unit: 'mg/kg' },
        doseOptions: [
          { id: 'iot', label: 'Intubação Orotraqueal - SRI (1 - 3 mg/kg)', min: 1, max: 2, step: 0.01, unit: 'mg/kg', ticksCount: 21 },
          { id: 'iot1', label: '1', min: 1, max: 4, step: 0.01, unit: 'mg/kg', ticksCount: 21 }
        ],
        presentation: [
          { label: '10 mg/mL', value: 10000 },
          { label: '50 mg/mL', value: 50000 },
          { label: '100 mg/mL', value: 100000 }
        ]
      },
      infusion: {
        dose: { min: 2, max: 7, step: 0.01, unit: 'mcg/kg/min' },
        doseOptions: [
          { id: 'padrao', label: 'Dose Padrão (2-7 mcg/kg/min)', min: 2, max: 7, step: 0.01, unit: 'mcg/kg/min' },  
        ],
        dilution: [
          { label: '10mL (50mg/mL) + 490mL SF 0.9%/SG 5%', medVolume: 10, solVolume: 490, concValue: 50, concUnit: 'mg/mL' },
          { label: '8mL (50mg/mL) + 192mL SF 0.9%/SG 5%', medVolume: 8, solVolume: 192, concValue: 50, concUnit: 'mg/mL' },
          { label: '10mL (50mg/mL) + 90mL SF 0.9%/SG 5%', medVolume: 10, solVolume: 90, concValue: 50, concUnit: 'mg/mL' }
        ]
      }
    }
  },
  dexmedetomidina: {
    id: 'dexmedetomidina',
    name: 'Dexmedetomidina',
    admtype: {
      infusion: {
        dose: { min: 0.2, max: 1.4, step: 0.01, unit: 'mcg/kg/h' },
        doseOptions: [
          { id: 'padrao', label: 'Dose Padrão (0.2-1.4 mcg/kg/h)', min: 0.2, max: 1.4, step: 0.01, unit: 'mcg/kg/h', ticksCount: 15 },  
          { id: 'pos-operatorio', label: 'Pós-Operatório (0.4-0.8 mcg/kg/h)', min: 0.4, max: 0.8, step: 0.01, unit: 'mcg/kg/h', ticksCount: 15 }
        ],
        dilution: [
          { label: '2mL + 48mL SF 0.9%', medVolume: 2, solVolume: 48, concValue: 100, concUnit: 'mcg/mL' },
          { label: '4mL + 96mL SF 0.9%', medVolume: 4, solVolume: 96, concValue: 100, concUnit: 'mcg/mL' }
        ]
      }
    }
  },
  dobutamina: {
    id: 'dobutamima',
    name: 'Dobutamina',
    admtype: {
      infusion: {
        dose: { min: 0.25, max: 20, step: 0.01, unit: 'mcg/kg/min' },
        doseOptions: [
          { id: 'padrao', label: 'Dose Padrão (0.20-20 mcg/kg/min)', min: 0.25, max: 20, step: 0.01, unit: 'mcg/kg/min' }
        ],
        dilution: [
          { label: '20mL + 230 mL SF 0.9%', medVolume: 20, solVolume: 230, concValue: 12.5, concUnit: 'mg/mL' },
          { label: '40mL + 210 mL SF 0.9%', medVolume: 40, solVolume: 210, concValue: 12.5, concUnit: 'mg/mL' }
        ]
      }
    }
  },
  etomidato: {
    id: 'etomidato',
    name: 'Etomidato',
    admtype: {
      bolus: {
        dose: { min: 1, max: 5, step: 0.01, unit: 'mg/kg' },
        doseOptions: [
          { id: 'iot', label: 'Intubação Orotraqueal - SRI (1 - 3 mg/kg)', min: 0.1, max: 0.3, step: 0.01, unit: 'mg/kg' }
        ],
        presentation: [
          { label: '2 mg/mL', value: 2000 }
        ]
      },
    }
  },
  fentanila: {
    id: 'fentanila',
    name: 'Fentanila',
    admtype: {
      bolus: {
        dose: { min: 1, max: 5, step: 0.01, unit: 'mcg/kg' },
        doseOptions: [
          { id: 'iot', label: 'Intubação Orotraqueal - SRI (1 - 3 mcg/kg)', min: 1, max: 3, step: 0.01, unit: 'mcg/kg', ticksCount: 101 }
        ],
        presentation: [
          { label: '50 mcg/mL', value: 50 },
        ]
      },
      infusion: {
        dose: { min: 0.3, max: 3, step: 0.01, unit: 'mcg/kg/h' },
        dilution: [
          { label: '40mL + 160mL de SF 0.9%', medVolume: 40, solVolume: 160, concValue: 50, concUnit: 'mcg/mL' },
          { label: '80mL + 120mL de SF 0.9%', medVolume: 80, solVolume: 120, concValue: 50, concUnit: 'mcg/mL' }
        ]
      }
    }
  },
  midazolam: {
    id: 'midazolam',
    name: 'Midazolam',
    admtype: {
      bolus: {
        dose: { min: 0.05, max: 0.3, step: 0.01, unit: 'mg/kg' },
          doseOptions: [
          { id: 'iot', label: 'Intubação Orotraqueal - SRI (0.1 - 0.3 mg/kg)', min: 0.1, max: 0.3, step: 0.001, unit: 'mg/kg', ticksCount: 21 }
        ],
        presentation: [
          { label: '1 mg/mL', value: 1000 },
          { label: '5 mg/mL', value: 5000 }
        ],
      },
      infusion: {
        dose: { min: 0.02, max: 0.2, step: 0.01, unit: 'mg/kg/h' },
        dilution: [
          { label: '40mL (5mg/mL) + 160mL SF 0.9%', medVolume: 40, solVolume: 160, concValue: 5, concUnit: 'mg/mL' },
          { label: '15mL (5mg/mL) + 50mL SF 0.9%', medVolume: 15, solVolume: 50, concValue: 5, concUnit: 'mg/mL' }
        ]
      }
    }
  },
  noradrenalina: {
    id: 'noradrenalina',
    name: 'Norepinefrina',
    admtype: {
      bolus: {
        dose: { min: 0.05, max: 2, step: 0.001, unit: 'mcg/kg' },
        doseOptions: [
          { id: 'iot', label: 'Intubação Orotraqueal - SRI (1 - 3 mcg/kg)', min: 1, max: 3, step: 0.01, unit: 'mcg' }
        ],
        presentation: [
          { label: '1 mg/mL', value: 1000 },
        ]
      },
      infusion: {
        dose: { min: 0.05, max: 3.3, step: 0.01, unit: 'mcg/kg/min' },
        dilution: [
          { label: '20mL + 180mL SF 0.9%', medVolume: 20, solVolume: 180, concValue: 1, concUnit: 'mg/mL' },
          { label: '16mL + 234mL SG 5%)', medVolume: 16, solVolume: 234, concValue: 1, concUnit: 'mg/mL' }
        ]
      }
    }
  },
  rocuronio: {
    id: 'rocuronio',
    name: 'Rocurônio',
    admtype: {
      bolus: {
        dose: { min: 0.05, max: 0.3, step: 0.01, unit: 'mg/kg' },
        doseOptions: [
          { id: 'iot', label: 'Intubação Orotraqueal - SRI (0.6 - 1.2 mg/kg)', min: 0.6, max: 1.2, step: 0.01, unit: 'mg/kg' }
        ],
        presentation: [
          { label: '10 mg/mL', value: 10000 }
        ]
      }
    }
  },
  voriconazol: {
    id: 'voriconazol',
    name: 'Voriconazol',
    admtype: {
      infusion: {
        dose: { min: 3, max: 3, step: 0.01, unit: 'mg/kg/h' },
        doseOptions: [
          { id: 'padrao', label: 'Dose Padrão (3 mg/kg/h)', min: 3, max: 4, step: 0, unit: 'mg/kg/h' },  
          { id: 'reduzida', label: 'Dose Reduzida (2 mg/kg/h)', min: 2, max: 2, step: 0, unit: 'mg/kg/h' }
        ],
        dilution: [
          { label: '1mL + 19mL ABD', medVolume: 1, solVolume: 19, concValue: 20, concUnit: 'mg/mL' },
          { label: '1mL + 39mL ABD', medVolume: 1, solVolume: 39, concValue: 10, concUnit: 'mg/mL' }
        ]
      }
    }
  }
};