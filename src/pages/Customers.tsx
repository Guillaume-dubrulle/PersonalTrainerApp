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
        { field: "id", headerName: "ID", flex: 1 },
        { field: "firstname", headerName: "First name", flex: 1 },
        { field: "lastname", headerName: "Last name", flex: 1 },
        { field: "email", headerName: "Email", flex: 1 },
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
            <div className="page-container">
                <div className="search">
                    <input
                        className="search-input"
                        aria-label="Search customers"
                        placeholder="Search by name, email or id"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div className="grid-small">
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
