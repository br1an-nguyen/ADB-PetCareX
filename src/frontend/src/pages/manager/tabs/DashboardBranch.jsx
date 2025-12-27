import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { statsAPI } from '../../../services/api';

const DashboardBranch = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        statsAPI.getBranches()
            .then(data => {
                if (data.success) {
                    // Format numbers
                    const formatted = data.data.map(b => ({
                        ...b,
                        revenue: Number(b.revenue)
                    }));
                    setBranches(formatted);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="60vh"><CircularProgress /></Box>;

    return (
        <Box>
            <Card sx={{ height: 600, mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ height: '100%', p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                        Hiệu suất doanh thu chi nhánh
                    </Typography>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart
                            layout="vertical"
                            data={branches}
                            margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E0E0E0" />
                            <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000000}M`} />
                            <YAxis dataKey="Ten_ChiNhanh" type="category" width={180} axisLine={false} tickLine={false} style={{ fontWeight: 500 }} />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }}
                                formatter={(value) => [`${Number(value).toLocaleString('vi-VN')} ₫`, 'Doanh thu']}
                            />
                            <Bar dataKey="revenue" fill="#8884d8" barSize={34} radius={[0, 4, 4, 0]}>
                                {branches.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0088FE' : '#00C49F'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </Box>
    );
};

export default DashboardBranch;
