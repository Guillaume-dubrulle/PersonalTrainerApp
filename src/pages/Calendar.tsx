import { useEffect, useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { TrainingType, CustomerType } from "../Type";

const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export default function Calendar() {
    const [events, setEvents] = useState<any[]>([]);
    const [view, setView] = useState<any>("month");
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        void fetchTrainings();
    }, []);

    const fetchTrainings = async () => {
        try {
            const res = await fetch(import.meta.env.VITE_API_BASE_URL + "gettrainings");
            const data = await res.json();
            const trainingsArray = (Array.isArray(data)
                ? data
                : data._embedded?.trainings ?? []) as TrainingType[];

            const calendarEvents = trainingsArray.map((t: TrainingType) => {
                const customer = (t as unknown as { customer?: CustomerType }).customer;
                const startDate = new Date(t.date || "");
                const endDate = new Date(startDate.getTime() + (t.duration || 30) * 60000);

                return {
                    id: t._links?.self?.href,
                    title: `${t.activity} - ${customer ? `${customer.firstname} ${customer.lastname}` : "No customer"}`,
                    start: startDate,
                    end: endDate,
                    resource: {
                        activity: t.activity,
                        duration: t.duration,
                        customer: customer,
                    },
                };
            });

            setEvents(calendarEvents);
        } catch (e) {
            console.error("Failed to fetch trainings:", e);
        }
    };

    const handleViewChange = (newView: any) => {
        setView(newView);
    };

    const handleSelectSlot = (slotInfo: any) => {
        setDate(slotInfo.start);
    };

    return (
        <div className="page-container" style={{ paddingBottom: "2rem" }}>
            <div className="grid-large" style={{ height: "600px", marginBottom: "2rem" }}>
                <BigCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    view={view}
                    onView={handleViewChange}
                    date={date}
                    onNavigate={setDate}
                    onSelectSlot={handleSelectSlot}
                    selectable
                    popup
                    style={{ height: "100%" }}
                />
            </div>
        </div>
    );
}