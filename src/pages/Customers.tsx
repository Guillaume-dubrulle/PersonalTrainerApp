import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import type { CustomerType } from "../Type";

export default function Customers() {
    const [customers, setCustomers] = useState<CustomerType[]>([]);

    useEffect(() => {
        const fetchCustomers = async () => {
            const res = await fetch(import.meta.env.VITE_API_BASE_URL + "customers");
            const data = await res.json();
            setCustomers(data._embedded.customers);
        };
        void fetchCustomers();
    }, []);

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 100 },
        { field: "firstname", headerName: "First name", width: 150 },
        { field: "lastname", headerName: "Last name", width: 150 },
        { field: "email", headerName: "Email", width: 200 },
    ];

    const rows = customers.map((c) => ({
        id: c._links?.self?.href?.split("customers/")[1],
        firstname: c.firstname,
        lastname: c.lastname,
        email: c.email ?? "",
    }));

    return (
        <div style={{ height: 480, width: "100%" }}>
            <DataGrid
                rows={rows}
                columns={columns}
                pageSizeOptions={[5, 10, 25]}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 5,
                            page: 0
                        }
                    } 
                }}
            />
        </div>
    );
}
