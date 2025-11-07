import { useEffect, useMemo, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { parseISO, format } from "date-fns";
import type { TrainingType, CustomerType } from "../Type";

export default function Trainings() {
    const [rows, setRows] = useState<any[]>([]);
    const [query, setQuery] = useState("");

    useEffect(() => {
        const fetchAndBuildRows = async () => {
            try {
                const res = await fetch(import.meta.env.VITE_API_BASE_URL + "gettrainings");
                const data = await res.json();
                const trainingsArray = (Array.isArray(data) ? data : data._embedded?.trainings ?? []) as TrainingType[];

                const base = trainingsArray.map((t: TrainingType, idx: number) => {
                    const customer = (t as unknown as { customer?: CustomerType }).customer;
                    return {
                        _raw: t,
                        id: t._links?.self?.href ?? idx,
                        activity: t.activity ?? "",
                        dateRaw: t.date ?? "",
                        duration: t.duration ?? "",
                        customerName: customer ? `${customer.firstname} ${customer.lastname}`.trim() : "",
                    };
                });

                setRows(base);
            } catch (e) {
                setRows([]);
            }
        };

        void fetchAndBuildRows();
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
