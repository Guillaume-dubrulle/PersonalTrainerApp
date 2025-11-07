import { useEffect, useMemo, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { parseISO, format } from "date-fns";
import type { TrainingType } from "../Type";

export default function Trainings() {
    const [trainings, setTrainings] = useState<TrainingType[]>([]);
    const [rows, setRows] = useState<any[]>([]);
    const [query, setQuery] = useState("");
    const [customerNames, setCustomerNames] = useState();
    
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
        const fetchAll = async () => {
            const res = await fetch(import.meta.env.VITE_API_BASE_URL + "trainings");
            const data = await res.json();
            const trainingsArray = data._embedded?.trainings ?? [];

            const urls = Array.from(
            new Set(
                trainingsArray
                .map((t: any) => t._links?.customer?.href)
                .filter(Boolean) as string[]
            )
            );

            const customerMap = new Map<string, string>();
            await Promise.all(
            urls.map(async (url) => {
                try {
                const r = await fetch(url);
                if (!r.ok) return;
                const c = await r.json();
                const name = `${c.firstname ?? ""} ${c.lastname ?? ""}`.trim();
                customerMap.set(url, name);
                } catch (e) {
                customerMap.set(url, "");
                }
            })
            );

            const rows = trainingsArray.map((t: any) => {
            const customerUrl = t._links?.customer?.href;
            return {
                id: t._links?.self?.href?.split("api/trainings/")[1] ?? "",
                activity: t.activity,
                dateRaw: t.date,
                duration: t.duration,
                customerName: customerUrl ? (customerMap.get(customerUrl) ?? "") : "",
                _raw: t,
            };
            });
        setRows(rows);
    };

    void fetchAll();
    }, []);

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", flex: 1 },
        { field: "activity", headerName: "Activity", flex: 1, sortable: true },
        {
            field: "dateRaw",
            headerName: "Date",
            flex: 1,
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
        { field: "duration", headerName: "Duration", flex: 1, sortable: true },
        { field: "customerName", headerName: "Customer", flex: 1, sortable: true },
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
            <div className="page-container">
                <div className="search">
                    <input
                        className="search-input"
                        aria-label="Search trainings"
                        placeholder="Search by activity, customer, date"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div className="grid-large">
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
