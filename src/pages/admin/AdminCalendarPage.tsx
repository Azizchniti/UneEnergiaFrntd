import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import { EventService, Event } from "@/services/event.service";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
  getDay,
  locales: { "pt-BR": ptBR },
});

const AdminCalendarPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>("month");
  const [loading, setLoading] = useState(true);

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
  });

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
        ...event,
        title: event.title,
        start: new Date(event.start_time),
        end: new Date(event.end_time || event.start_time),
      }));

      setEvents(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 OPEN CREATE MODAL
  const openCreate = () => {
    setSelectedEvent(null);
    setForm({
      title: "",
      description: "",
      start_time: "",
      end_time: "",
    });
    setShowModal(true);
  };

  // 🔥 CLICK EVENT → EDIT
  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    setForm({
      title: event.title,
      description: event.description || "",
      start_time: event.start.toISOString().slice(0, 16),
      end_time: event.end.toISOString().slice(0, 16),
    });
    setShowModal(true);
  };

  // ✅ SAVE (CREATE OR UPDATE)
  const handleSubmit = async () => {
    try {
      if (selectedEvent) {
        await EventService.updateEvent(selectedEvent.id, form);
      } else {
        await EventService.createEvent(form);
      }

      setShowModal(false);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  // ❌ DELETE
  const handleDelete = async () => {
    if (!selectedEvent) return;

    await EventService.deleteEvent(selectedEvent.id);
    setShowModal(false);
    fetchEvents();
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
          Gerencie eventos e compromissos
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setCurrentDate(new Date())}
          className="px-4 py-2 rounded-lg 
          bg-white/5 hover:bg-white/10 
          border border-white/10 
          text-white/70 hover:text-white transition"
        >
          Hoje
        </button>

        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-lg 
          bg-emerald-500 hover:bg-emerald-600 
          text-black font-medium shadow-md transition"
        >
          + Novo evento
        </button>
      </div>
    </div>

    {/* CALENDAR */}
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
          onView={setView}
          date={currentDate}
          onNavigate={setCurrentDate}
          onSelectEvent={handleSelectEvent}
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

          eventPropGetter={() => ({
            style: {
              backgroundColor: "#10b981",
              borderRadius: "10px",
              border: "none",
              color: "#022c22",
              padding: "4px 8px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
            },
          })}

          className="text-white rounded-xl overflow-hidden"
        />
      )}
    </div>

    {/* MODAL */}
    {showModal && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

        <div className="w-full max-w-md p-6 rounded-2xl 
        bg-gradient-to-br from-[#071412] to-[#0b1f1a] 
        border border-white/10 shadow-2xl space-y-4">

          <h2 className="text-white text-lg font-semibold">
            {selectedEvent ? "Editar evento" : "Novo evento"}
          </h2>

          {/* INPUTS */}
          <div className="space-y-3">

            <input
              type="text"
              placeholder="Título do evento"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg 
              bg-black/30 border border-white/10 
              text-white placeholder-white/40 
              focus:outline-none focus:border-emerald-500"
            />

            <textarea
              placeholder="Descrição (opcional)"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg 
              bg-black/30 border border-white/10 
              text-white placeholder-white/40 
              focus:outline-none focus:border-emerald-500"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="datetime-local"
                value={form.start_time}
                onChange={(e) =>
                  setForm({ ...form, start_time: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg 
                bg-black/30 border border-white/10 text-white"
              />

              <input
                type="datetime-local"
                value={form.end_time}
                onChange={(e) =>
                  setForm({ ...form, end_time: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg 
                bg-black/30 border border-white/10 text-white"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-between pt-4">

            {selectedEvent ? (
              <button
                onClick={handleDelete}
                className="text-red-400 hover:text-red-500 text-sm"
              >
                Excluir evento
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg 
                bg-white/5 hover:bg-white/10 
                border border-white/10 text-white/70"
              >
                Cancelar
              </button>

              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg 
                bg-emerald-500 hover:bg-emerald-600 
                text-black font-medium"
              >
                Salvar
              </button>
            </div>
          </div>

        </div>
      </div>
    )}
  </div>
);
};

export default AdminCalendarPage;