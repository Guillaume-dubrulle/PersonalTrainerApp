import { useEffect, useMemo, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { parseISO, format } from "date-fns";
import type { TrainingType } from "../Type";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

export default function Trainings() {
    const [rows, setRows] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [query, setQuery] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        activity: "",
        duration: "",
        date: new Date(),
        customerUrl: "",
    });

    useEffect(() => {
        void fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [trainingsRes, customersRes] = await Promise.all([
                fetch(import.meta.env.VITE_API_BASE_URL + "gettrainings"),
                fetch(import.meta.env.VITE_API_BASE_URL + "customers"),
            ]);

            const trainingsData = await trainingsRes.json();
            const trainingsArray = (Array.isArray(trainingsData)
                ? trainingsData
                : trainingsData._embedded?.trainings ?? []) as TrainingType[];

            const customersData = await customersRes.json();
            setCustomers(customersData._embedded.customers);

            buildRows(trainingsArray);
        } catch (e) {
            console.error("Failed to fetch data:", e);
        }
    };

    const buildRows = (trainingsArray: TrainingType[]) => {
        const base = trainingsArray.map((t: TrainingType, idx: number) => {
            const customer = t.customer;
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
    };

    const handleAddClick = () => {
        setFormData({
            activity: "",
            duration: "",
            date: new Date(),
            customerUrl: "",
        });
        setOpenForm(true);
    };

    const handleFormClose = () => {
        setOpenForm(false);
    };

    const handleFormSubmit = async () => {
        try {
            const isoDate = formData.date.toISOString();
            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}trainings`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        date: isoDate,
                        activity: formData.activity,
                        duration: parseInt(formData.duration) || 0,
                        customer: formData.customerUrl,
                    }),
                }
            );
            if (res.ok) {
                await fetchData();
                handleFormClose();
            }
        } catch (e) {
            console.error("Failed to add training:", e);
        }
    };

    const handleDeleteClick = (trainingId: string) => {
        setDeleteId(trainingId);
        setOpenConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (deleteId) {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}trainings/${deleteId}`,
                    { method: "DELETE" }
                );
                if (res.ok) {
                    await fetchData();
                }
            } catch (e) {
                console.error("Failed to delete training:", e);
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
        { field: "duration", headerName: "Duration", flex: 0.8, sortable: true },
        { field: "customerName", headerName: "Customer", flex: 1, sortable: true },
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
                        color="error"
                        onClick={() => handleDeleteClick(params.row.id)}
                    >
                        Delete
                    </Button>
                </Stack>
            ),
        },
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
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="page-container">
                <div className="search">
                    <input
                        className="search-input"
                        aria-label="Search trainings"
                        placeholder="Search by activity, customer, date"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Button variant="contained" onClick={handleAddClick} sx={{ ml: 1 }}>
                        Add Training
                    </Button>
                </div>

                <div className="grid-large">
                    <DataGrid
                        rows={filtered}
                        columns={columns}
                        pageSizeOptions={[5, 10, 25]}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 5, page: 0 } },
                        }}
                    />
                </div>

                <Dialog open={openForm} onClose={handleFormClose} maxWidth="sm" fullWidth>
                    <DialogTitle>Add Training</DialogTitle>
                    <DialogContent sx={{ pt: 2 }}>
                        <Stack spacing={2}>
                            <FormControl fullWidth>
                                <InputLabel>Customer</InputLabel>
                                <Select
                                    value={formData.customerUrl}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            customerUrl: e.target.value,
                                        })
                                    }
                                    label="Customer"
                                >
                                    {customers.map((c) => (
                                        <MenuItem
                                            key={c._links?.self?.href}
                                            value={c._links?.self?.href}
                                        >
                                            {c.firstname} {c.lastname}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                label="Activity"
                                value={formData.activity}
                                onChange={(e) =>
                                    setFormData({ ...formData, activity: e.target.value })
                                }
                                fullWidth
                            />
                            <TextField
                                label="Duration (minutes)"
                                type="number"
                                value={formData.duration}
                                onChange={(e) =>
                                    setFormData({ ...formData, duration: e.target.value })
                                }
                                fullWidth
                            />
                            <DateTimePicker
                                label="Training Date & Time"
                                value={formData.date}
                                onChange={(newValue) =>
                                    setFormData({
                                        ...formData,
                                        date: newValue || new Date(),
                                    })
                                }
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleFormClose}>Cancel</Button>
                        <Button onClick={handleFormSubmit} variant="contained">
                            Add
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={openConfirm} onClose={handleDeleteCancel}>
                    <DialogTitle>Delete Training?</DialogTitle>
                    <DialogContent>
                        Are you sure you want to delete this training?
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
        </LocalizationProvider>
    );
}
