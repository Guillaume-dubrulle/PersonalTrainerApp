import { useState, useEffect, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import type { CustomerType } from "../Type";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack} from "@mui/material";

export default function Customers() {
    const [customers, setCustomers] = useState<CustomerType[]>([]);
    const [query, setQuery] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        streetaddress: "",
        postcode: "",
        city: "",
    });

    useEffect(() => {
        void fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await fetch(import.meta.env.VITE_API_BASE_URL + "customers");
            const data = await res.json();
            setCustomers(data._embedded.customers);
        } catch (e) {
            console.error("Failed to fetch customers:", e);
        }
    };

    const handleAddClick = () => {
        setEditingId(null);
        setFormData({
            firstname: "",
            lastname: "",
            email: "",
            phone: "",
            streetaddress: "",
            postcode: "",
            city: "",
        });
        setOpenForm(true);
    };

    const handleEditClick = (customerId: string) => {
        const customer = customers.find(
            (c) => c._links?.self?.href?.split("customers/")[1] === customerId
        );
        if (customer) {
            setEditingId(customerId);
            setFormData({
                firstname: customer.firstname,
                lastname: customer.lastname,
                email: customer.email,
                phone: customer.phone,
                streetaddress: customer.streetaddress,
                postcode: customer.postcode,
                city: customer.city,
            });
            setOpenForm(true);
        }
    };

    const handleFormClose = () => {
        setOpenForm(false);
        setEditingId(null);
    };

    const handleFormSubmit = async () => {
        try {
            if (editingId) {
                const customerId = editingId;
                const res = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}customers/${customerId}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(formData),
                    }
                );
                if (res.ok) {
                    await fetchCustomers();
                    handleFormClose();
                }
            } else {
                const res = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}customers`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(formData),
                    }
                );
                if (res.ok) {
                    await fetchCustomers();
                    handleFormClose();
                }
            }
        } catch (e) {
            console.error("Failed to save customer:", e);
        }
    };

    const handleDeleteClick = (customerId: string) => {
        setDeleteId(customerId);
        setOpenConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (deleteId) {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}customers/${deleteId}`,
                    { method: "DELETE" }
                );
                if (res.ok) {
                    await fetchCustomers();
                }
            } catch (e) {
                console.error("Failed to delete customer:", e);
            }
        }
        setOpenConfirm(false);
        setDeleteId(null);
    };

    const handleDeleteCancel = () => {
        setOpenConfirm(false);
        setDeleteId(null);
    };

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", flex: 0.5 },
        { field: "firstname", headerName: "First name", flex: 1 },
        { field: "lastname", headerName: "Last name", flex: 1 },
        { field: "email", headerName: "Email", flex: 1 },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            sortable: false,
            renderCell: (params: any) => (
                <Stack direction="row" spacing={1} justifyContent={"center"} marginTop={1} marginBottom={1}>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleEditClick(params.row.id)}
                    >
                        Edit
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteClick(params.row.id)}
                    >
                        Delete
                    </Button>
                </Stack>
            ),
        },
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
                <Button variant="contained" onClick={handleAddClick} sx={{ ml: 1 }}>
                    Add Customer
                </Button>
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

            <Dialog open={openForm} onClose={handleFormClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingId ? "Edit Customer" : "Add Customer"}
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Stack spacing={2}>
                        <TextField
                            label="First Name"
                            value={formData.firstname}
                            onChange={(e) =>
                                setFormData({ ...formData, firstname: e.target.value })
                            }
                            fullWidth
                        />
                        <TextField
                            label="Last Name"
                            value={formData.lastname}
                            onChange={(e) =>
                                setFormData({ ...formData, lastname: e.target.value })
                            }
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            fullWidth
                        />
                        <TextField
                            label="Phone"
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                            }
                            fullWidth
                        />
                        <TextField
                            label="Street Address"
                            value={formData.streetaddress}
                            onChange={(e) =>
                                setFormData({ ...formData, streetaddress: e.target.value })
                            }
                            fullWidth
                        />
                        <TextField
                            label="Postcode"
                            value={formData.postcode}
                            onChange={(e) =>
                                setFormData({ ...formData, postcode: e.target.value })
                            }
                            fullWidth
                        />
                        <TextField
                            label="City"
                            value={formData.city}
                            onChange={(e) =>
                                setFormData({ ...formData, city: e.target.value })
                            }
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleFormClose}>Cancel</Button>
                    <Button onClick={handleFormSubmit} variant="contained">
                        {editingId ? "Update" : "Add"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openConfirm} onClose={handleDeleteCancel}>
                <DialogTitle>Delete Customer?</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this customer? All associated trainings will also be deleted.
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>No</Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                    >
                        Yes, Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
