import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Alert, Chip, Stack } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { statsAPI } from '../../../services/api';

const DashboardProducts = () => {
    const [stats, setStats] = useState({ doctors: [], topSelling: [], lowStock: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            statsAPI.getDoctors().then(res => res),
            statsAPI.getProducts().then(res => res)
        ]).then(([docData, prodData]) => {
            setStats({
                doctors: docData.success ? docData.data : [],
                topSelling: prodData.success ? prodData.data.topSelling.map(p => ({ ...p, revenue: Number(p.revenue) })) : [],
                lowStock: prodData.success ? prodData.data.lowStock : []
            });
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="60vh"><CircularProgress /></Box>;

    return (
        <Box>
            <Grid container spacing={3}>
                {/* Top Products Chart */}
                <Grid size={{ xs: 12 }}>
                    <Card sx={{ height: 600, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', fontFamily: "'Inter', sans-serif" }}>
                        <CardContent sx={{ height: '100%', p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, fontFamily: "'Inter', sans-serif" }}>
                                Sản phẩm bán chạy (Doanh thu)
                            </Typography>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart data={stats.topSelling} layout="vertical" margin={{ left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E0E0E0" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000000}M`} />
                                    <YAxis dataKey="TenSanPham" type="category" width={140} axisLine={false} tickLine={false} style={{ fontSize: '0.85rem', fontWeight: 500, fontFamily: "'Inter', sans-serif" }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none', fontFamily: "'Inter', sans-serif" }}
                                        formatter={(value) => [`${Number(value).toLocaleString('vi-VN')} ₫`, 'Doanh thu']}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Bar dataKey="revenue" fill="#0f766e" barSize={24} radius={[0, 4, 4, 0]} name="Doanh thu" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Doctors Chart */}
                <Grid size={{ xs: 12 }}>
                    <Card sx={{ height: 600, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', fontFamily: "'Inter', sans-serif" }}>
                        <CardContent sx={{ height: '100%', p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, fontFamily: "'Inter', sans-serif" }}>
                                Top Bác sĩ (Lượt khám)
                            </Typography>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart data={stats.doctors} layout="vertical" margin={{ left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E0E0E0" />
                                    <XAxis type="number" axisLine={false} tickLine={false} />
                                    <YAxis dataKey="HoTen" type="category" width={140} axisLine={false} tickLine={false} style={{ fontSize: '0.85rem', fontWeight: 500, fontFamily: "'Inter', sans-serif" }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none', fontFamily: "'Inter', sans-serif" }}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Bar dataKey="visitCount" fill="#0088FE" barSize={24} radius={[0, 4, 4, 0]} name="Lượt khám" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardProducts;
