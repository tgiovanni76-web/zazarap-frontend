import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export default function EventsCalendar({ events = [] }) {
  const [selectedDay, setSelectedDay] = useState();
  const days = useMemo(() => events.map(e => new Date(e.date)), [events]);
  const selectedEvents = useMemo(() => {
    if (!selectedDay) return [];
    const key = selectedDay.toISOString().slice(0,10);
    return events.filter(e => e.date === key);
  }, [selectedDay, events]);

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2">Calendario scadenze & offerte</h3>
        <div className="flex flex-col lg:flex-row gap-4">
          <DayPicker
            mode="single"
            selected={selectedDay}
            onSelect={setSelectedDay}
            modifiers={{ hasEvent: days }}
            modifiersClassNames={{ hasEvent: 'border-2 border-amber-500 rounded-full' }}
          />
          <div className="flex-1">
            <div className="text-sm text-slate-500 mb-2">Eventi del giorno</div>
            <ul className="space-y-2">
              {selectedEvents.length === 0 && <li className="text-slate-400">Nessun evento</li>}
              {selectedEvents.map((e, i) => (
                <li key={i} className="p-2 rounded border flex items-center justify-between">
                  <span className="font-medium">{e.title}</span>
                  <span className={`text-xs px-2 py-1 rounded ${e.type === 'expiry' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {e.type === 'expiry' ? 'Scadenza' : 'Offerta'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}