import { useState, useEffect, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import type { CustomerType } from "../Type";

export default function Customers() {
    const [customers, setCustomers] = useState<CustomerType[]>([]);
    const [query, setQuery] = useState("");

    useEffect(() => {
        const fetchCustomers = async () => {
            const res = await fetch(import.meta.env.VITE_API_BASE_URL + "customers");
            const data = await res.json();
            setCustomers(data._embedded.customers);
        };
        void fetchCustomers();
    }, []);

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 120 },
        { field: "firstname", headerName: "First name", width: 150, sortable: true },
        { field: "lastname", headerName: "Last name", width: 150, sortable: true },
        { field: "email", headerName: "Email", width: 220, sortable: true },
    ];

    const rows = useMemo(
        () =>
            customers.map((c, idx) => ({
                id: c._links?.self?.href?.split("customers/")[1] ?? idx,
                firstname: c.firstname,
                lastname: c.lastname,
                email: c.email ?? "",
            })),
        [customers]
    );

    const filtered = useMemo(() => {
        if (!query) return rows;
        const q = query.toLowerCase();
        return rows.filter((r) => (r.firstname + " " + r.lastname + " " + r.email + " " + r.id).toLowerCase().includes(q));
    }, [rows, query]);

    return (
        <div>
            <div style={{ margin: "0.5rem 0" }}>
                <input
                    aria-label="Search customers"
                    placeholder="Search by name, email or id"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ padding: "0.5rem", width: "100%", maxWidth: 420 }}
                />
            </div>

            <div style={{ height: 480, width: "100%" }}>
                <DataGrid
                    rows={filtered}
                    columns={columns}
                    pageSizeOptions={[5, 10, 25]}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 5, page: 0 },
                        },
                    }}
                />
            </div>
        </div>
    );
}
