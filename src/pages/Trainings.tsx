import { useEffect, useMemo, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { parseISO, format } from "date-fns";

export default function Trainings() {
    const [trainings, setTrainings] = useState<any[]>([]);
    const [rows, setRows] = useState<any[]>([]);
    const [query, setQuery] = useState("");

    useEffect(() => {
        const fetchTrainings = async () => {
            try {
                const res = await fetch(import.meta.env.VITE_API_BASE_URL + "gettrainings");
                const data = await res.json();
                setTrainings(Array.isArray(data) ? data : data._embedded?.trainings ?? []);
            } catch (e) {
                setTrainings([]);
            }
        };
        void fetchTrainings();
    }, []);

    useEffect(() => {
        const base = trainings.map((t: any, idx: number) => ({
            _raw: t,
            id: t.id ?? t._links?.self?.href ?? idx,
            activity: t.activity ?? t.activityType ?? "",
            dateRaw: t.date ?? t.datetime ?? t.timestamp ?? "",
            duration: t.duration ?? t.length ?? t.minutes ?? "",
            customerName: t.customer ? `${t.customer.firstname ?? ""} ${t.customer.lastname ?? ""}`.trim() : "",
        }));

        setRows(base);
    }, [trainings]);

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 120 },
        { field: "activity", headerName: "Activity", width: 180, sortable: true },
        {
            field: "dateRaw",
            headerName: "Date",
            width: 200,
            sortable: true,
            renderCell: (params: any) => {
                const raw = params?.row?.dateRaw ?? params?.value;
                try {
                    const s = raw ? format(parseISO(raw), "dd.MM.yyyy HH:mm") : "";
                    return <span>{s}</span>;
                } catch (e) {
                    return <span>{raw ?? ""}</span>;
                }
            },
        },
        { field: "duration", headerName: "Duration", width: 120, sortable: true },
        { field: "customerName", headerName: "Customer", width: 220, sortable: true },
    ];

    const filtered = useMemo(() => {
        if (!query) return rows;
        const q = query.toLowerCase();
        return rows.filter((r) => {
            const dateStr = (() => {
                try {
                    return r.dateRaw ? format(parseISO(r.dateRaw), "dd.MM.yyyy HH:mm") : "";
                } catch {
                    return r.dateRaw ?? "";
                }
            })();
            return (r.activity + " " + r.customerName + " " + dateStr + " " + r.id).toLowerCase().includes(q);
        });
    }, [rows, query]);

    return (
        <div>
            <div style={{ margin: "0.5rem 0" }}>
                <input
                    aria-label="Search trainings"
                    placeholder="Search by activity, customer, date"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ padding: "0.5rem", width: "100%", maxWidth: 420 }}
                />
            </div>

            <div style={{ height: 520, width: "100%" }}>
                <DataGrid
                    rows={filtered}
                    columns={columns}
                    pageSizeOptions={[5, 10, 25]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                />
            </div>
        </div>
    );
}
