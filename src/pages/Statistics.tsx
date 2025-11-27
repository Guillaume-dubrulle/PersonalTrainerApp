import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { groupBy, sumBy } from "lodash";
import { Box, Typography, Card, CardContent } from "@mui/material";
import type { TrainingType } from "../Type";

export default function Statistics() {
    const [chartData, setChartData] = useState<any[]>([]);
    const [totalMinutes, setTotalMinutes] = useState(0);

    useEffect(() => {
        void fetchAndProcessTrainings();
    }, []);

    const fetchAndProcessTrainings = async () => {
        try {
            const res = await fetch(import.meta.env.VITE_API_BASE_URL + "gettrainings");
            const data = await res.json();
            const trainingsArray = (Array.isArray(data) ? data : data._embedded?.trainings ?? []) as TrainingType[];

            const grouped = groupBy(trainingsArray, (t: TrainingType) => t.activity);

            const stats = Object.entries(grouped).map(([activity, trainings]) => {
                const totalMinutes = sumBy(trainings, (t: any) => t.duration || 0);
                return {
                    activity,
                    minutes: totalMinutes,
                    count: trainings.length,
                };
            });

            const total = sumBy(stats, (s) => s.minutes);
            setTotalMinutes(total);
            setChartData(stats.sort((a, b) => b.minutes - a.minutes));
        } catch (e) {
            console.error("Failed to fetch trainings:", e);
        }
    };

    return (
        <div className="page-container" style={{ paddingBottom: "2rem" }}>
            <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
                Training Statistics
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 2, mb: 4, maxWidth: "900px", mx: "auto", width: "100%" }}>
                <Card>
                    <CardContent sx={{ textAlign: "center" }}>
                        <Typography color="textSecondary" gutterBottom>
                            Total Training Minutes
                        </Typography>
                        <Typography variant="h5">{totalMinutes} minutes</Typography>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent sx={{ textAlign: "center" }}>
                        <Typography color="textSecondary" gutterBottom>
                            Total Activities
                        </Typography>
                        <Typography variant="h5">{chartData.length}</Typography>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent sx={{ textAlign: "center" }}>
                        <Typography color="textSecondary" gutterBottom>
                            Total Trainings
                        </Typography>
                        <Typography variant="h5">
                            {chartData.reduce((sum, item) => sum + item.count, 0)}
                        </Typography>
                    </CardContent>
                </Card>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                    maxWidth: "900px",
                    mx: "auto",
                    mb: 4,
                }}
            >
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="activity"
                            angle={-45}
                            textAnchor="end"
                            height={120}
                        />
                        <YAxis label={{ value: "Minutes", angle: -90, position: "insideLeft" }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="minutes" fill="#8884d8" name="Minutes" />
                    </BarChart>
                </ResponsiveContainer>
            </Box>

            <Box
                sx={{
                    maxWidth: "900px",
                    mx: "auto",
                    width: "100%",
                    overflowX: "auto",
                }}
            >
                <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
                    Activity Breakdown
                </Typography>
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        textAlign: "left",
                    }}
                >
                    <thead>
                        <tr style={{ borderBottom: "2px solid #ddd" }}>
                            <th style={{ padding: "10px" }}>Activity</th>
                            <th style={{ padding: "10px", textAlign: "right" }}>Minutes</th>
                            <th style={{ padding: "10px", textAlign: "right" }}>Count</th>
                            <th style={{ padding: "10px", textAlign: "right" }}>Avg/Session</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chartData.map((item, idx) => (
                            <tr
                                key={idx}
                                style={{
                                    borderBottom: "1px solid #eee",
                                    backgroundColor: idx % 2 === 0 ? "#f5f5f5" : "transparent",
                                }}
                            >
                                <td style={{ padding: "10px" }}>{item.activity}</td>
                                <td style={{ padding: "10px", textAlign: "right" }}>
                                    {item.minutes}
                                </td>
                                <td style={{ padding: "10px", textAlign: "right" }}>
                                    {item.count}
                                </td>
                                <td style={{ padding: "10px", textAlign: "right" }}>
                                    {(item.minutes / item.count).toFixed(1)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Box>
        </div>
    );
}
