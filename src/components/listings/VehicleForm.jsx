import React from 'react';

export default function VehicleForm({ vehicle, onChange }) {
  const update = (field, value) => onChange({ ...vehicle, [field]: value });
  const toggleEquip = (key) => {
    const set = new Set(vehicle.equipment || []);
    set.has(key) ? set.delete(key) : set.add(key);
    onChange({ ...vehicle, equipment: Array.from(set) });
  };

  const equipOptions = [
    { key: 'climatizzatore', label: 'Climatizzatore' },
    { key: 'navigatore', label: 'Navigatore' },
    { key: 'sensori_parcheggio', label: 'Sensori di parcheggio' },
    { key: 'cerchi_in_lega', label: 'Cerchi in lega' },
    { key: 'bluetooth', label: 'Bluetooth' },
    { key: 'telecamera_posteriore', label: 'Telecamera posteriore' },
    { key: 'cruise_control', label: 'Cruise control' },
    { key: 'sedili_riscaldati', label: 'Sedili riscaldati' },
    { key: 'tetto_apribile', label: 'Tetto apribile' },
    { key: 'isofix', label: 'ISOFIX' },
  ];

  return (
    <div className="mt-6 p-4 rounded-xl border bg-white">
      <h3 className="text-lg font-semibold mb-4 text-slate-800">Dettagli veicolo</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="zaza-form-label">Marca</label>
          <input className="zaza-input" value={vehicle.brand} onChange={(e) => update('brand', e.target.value)} />
        </div>
        <div>
          <label className="zaza-form-label">Modello</label>
          <input className="zaza-input" value={vehicle.model} onChange={(e) => update('model', e.target.value)} />
        </div>
        <div>
          <label className="zaza-form-label">Anno immatricolazione</label>
          <input type="number" className="zaza-input" value={vehicle.registrationYear} onChange={(e) => update('registrationYear', e.target.value)} />
        </div>
        <div>
          <label className="zaza-form-label">Chilometraggio (km)</label>
          <input type="number" className="zaza-input" value={vehicle.mileageKm} onChange={(e) => update('mileageKm', e.target.value)} />
        </div>
        <div>
          <label className="zaza-form-label">Carburante</label>
          <select className="zaza-input" value={vehicle.fuelType} onChange={(e) => update('fuelType', e.target.value)}>
            <option value="">Seleziona</option>
            <option value="benzina">Benzina</option>
            <option value="diesel">Diesel</option>
            <option value="gpl">GPL</option>
            <option value="metano">Metano</option>
            <option value="elettrico">Elettrico</option>
            <option value="ibrido">Ibrido</option>
          </select>
        </div>
        <div>
          <label className="zaza-form-label">Cambio</label>
          <select className="zaza-input" value={vehicle.transmission} onChange={(e) => update('transmission', e.target.value)}>
            <option value="">Seleziona</option>
            <option value="manuale">Manuale</option>
            <option value="automatico">Automatico</option>
          </select>
        </div>
        <div>
          <label className="zaza-form-label">Potenza (kW)</label>
          <input type="number" className="zaza-input" value={vehicle.powerKw} onChange={(e) => update('powerKw', e.target.value)} />
        </div>
        <div>
          <label className="zaza-form-label">Colore</label>
          <input className="zaza-input" value={vehicle.color} onChange={(e) => update('color', e.target.value)} />
        </div>
        <div>
          <label className="zaza-form-label">Stato veicolo</label>
          <select className="zaza-input" value={vehicle.condition} onChange={(e) => update('condition', e.target.value)}>
            <option value="">Seleziona</option>
            <option value="nuovo">Nuovo</option>
            <option value="usato">Usato</option>
            <option value="incidentato">Incidentato</option>
          </select>
        </div>
        <div>
          <label className="zaza-form-label">Validità TÜV</label>
          <input type="date" className="zaza-input" value={vehicle.tuvValidUntil} onChange={(e) => update('tuvValidUntil', e.target.value)} />
        </div>
      </div>

      <div className="mt-4">
        <label className="zaza-form-label mb-2">Equipaggiamento</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {equipOptions.map(opt => (
            <label key={opt.key} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={vehicle.equipment?.includes(opt.key) || false} onChange={() => toggleEquip(opt.key)} />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}