import React, { useEffect, useState } from "react";
import { EventService, Event } from "@/services/event.service";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const locales = {
  "pt-BR": ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
  getDay,
  locales,
});

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const start = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      ).toISOString();

      const end = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ).toISOString();

      const data = await EventService.getEventsByRange(start, end);

      const formatted = data.map((event: Event) => ({
        title: event.title,
        start: new Date(event.start_time),
        end: new Date(event.end_time || event.start_time),
      }));

      setEvents(formatted);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const formats = {
  monthHeaderFormat: (date: Date, culture: string, localizer: any) =>
    format(date, "LLLL yyyy", { locale: ptBR }), // full month name + year in pt-BR
};
 return (
  
  <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">

    {/* HEADER */}
    <div className="flex items-center justify-between p-6 rounded-2xl 
    bg-gradient-to-br from-[#0b1f1a]/80 to-[#071412]/80 
    backdrop-blur-xl border border-white/10 shadow-lg">

      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Calendário
        </h1>
        <p className="text-sm text-white/50 mt-1">
          Acompanhe os eventos e compromissos
        </p>
      </div>

      {/* TODAY BUTTON */}
      <button
        onClick={() => setCurrentDate(new Date())}
        className="px-4 py-2 rounded-lg 
        bg-white/5 hover:bg-white/10 
        border border-white/10 
        text-white/70 hover:text-white 
        transition"
      >
        Hoje
      </button>
    </div>

    {/* CALENDAR CONTAINER */}
    <div className="relative p-5 rounded-2xl 
    bg-[#0b1f1a]/60 backdrop-blur-xl 
    border border-white/10 shadow-xl">

      {/* subtle glow */}
      <div className="absolute inset-0 rounded-2xl 
      bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />

      {loading ? (
        <div className="text-center text-white/40 py-20">
          Carregando eventos...
        </div>
      ) : (
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={(newView) => setView(newView)}
        date={currentDate}
        onNavigate={(date) => setCurrentDate(date)}
        style={{ height: 650 }}
        messages={{
          today: "Hoje",
          previous: "Anterior",
          next: "Próximo",
          month: "Mês",
          week: "Semana",
          day: "Dia",
          agenda: "Agenda",
          date: "Data",
          time: "Hora",
          event: "Evento",
          noEventsInRange: "Nenhum evento neste período",
        }}
        formats={formats} // from previous step
        eventPropGetter={() => ({
          style: {
            backgroundColor: "#10b981",
            borderRadius: "10px",
            border: "none",
            color: "#022c22",
            padding: "4px 8px",
            fontSize: "12px",
            fontWeight: 500,
          },
        })}
        dayPropGetter={(date) => {
          const today = new Date();
          const isToday =
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate();

          if (isToday) {
            return {
              style: {
                backgroundColor: "#a3a8a8", // your custom color for today
                borderRadius: "8px",
              },
            };
          }

          return {}; // default style
        }}
        className="text-white rounded-xl overflow-hidden"
      />
      )}
    </div>
  </div>
);
};

export default CalendarPage;