import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress, useTheme } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AttachMoney, People, Receipt } from '@mui/icons-material';
import { statsAPI } from '../../../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const KPICard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
        <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                    <Typography color="textSecondary" variant="subtitle2" sx={{ fontWeight: 600, mb: 1, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        {title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                        {value}
                    </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const DashboardOverview = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    useEffect(() => {
        statsAPI.getGeneral()
            .then(data => {
                if (data.success) setStats(data.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="60vh"><CircularProgress /></Box>;
    if (!stats) return <Typography color="error" align="center">Không thể tải dữ liệu.</Typography>;

    // Format Data for Line Chart
    const lineData = stats.revenueTrend.map(item => ({ name: item.month, revenue: Number(item.revenue) }));

    return (
        <Box>
            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <KPICard
                        title="Doanh thu tháng này"
                        value={`${Number(stats.revenue).toLocaleString('vi-VN')} ₫`}
                        icon={<AttachMoney fontSize="large" />}
                        color="#00C49F"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <KPICard
                        title="Tổng lượt khách"
                        value={stats.visits}
                        icon={<People fontSize="large" />}
                        color="#0088FE"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <KPICard
                        title="Giá trị đơn TB"
                        value={`${Number(stats.avgTicket).toLocaleString('vi-VN')} ₫`}
                        icon={<Receipt fontSize="large" />}
                        color="#FFBB28"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                    <Card sx={{ height: 500, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', fontFamily: "'Inter', sans-serif" }}>
                        <CardContent sx={{ height: '100%', p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, fontFamily: "'Inter', sans-serif" }}>
                                Biểu đồ doanh thu (12 tháng gần nhất)
                            </Typography>
                            <ResponsiveContainer width="100%" height="90%">
                                <LineChart data={lineData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#757575', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#757575', fontSize: 12 }} tickFormatter={(value) => `${value / 1000000}M`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none', fontFamily: "'Inter', sans-serif" }}
                                        formatter={(value) => [`${Number(value).toLocaleString('vi-VN')} ₫`, 'Doanh thu']}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="#0f766e" strokeWidth={3} dot={{ r: 4, fill: '#0f766e', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardOverview;
