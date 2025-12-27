import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Container, Paper } from '@mui/material';
import DashboardOverview from './tabs/DashboardOverview';
import DashboardBranch from './tabs/DashboardBranch';
import DashboardProducts from './tabs/DashboardProducts';

const ManagerDashboard = () => {
    const [tabIndex, setTabIndex] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 10 }}>
            <Box mb={5} display="flex" flexDirection="column" alignItems="flex-start" sx={{ fontFamily: "'Inter', sans-serif" }}>
                <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: '#1a1a1a', letterSpacing: '-0.5px', fontFamily: "'Inter', sans-serif" }}>
                    Bảng tin Quản trị
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 600, fontFamily: "'Inter', sans-serif" }}>
                    Theo dõi toàn diện hiệu suất kinh doanh, hoạt động của các chi nhánh và nguồn lực nhân sự.
                </Typography>
            </Box>

            <Box sx={{ mb: 4, fontFamily: "'Inter', sans-serif" }}>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        border: '1px solid #eee',
                        display: 'inline-flex',
                        overflow: 'hidden',
                        bgcolor: '#f5f5f5',
                        p: 0.5
                    }}
                >
                    <Tabs
                        value={tabIndex}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            '& .MuiTabs-indicator': { display: 'none' },
                            minHeight: 48
                        }}
                    >
                        <Tab
                            label="Tổng quan"
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '1rem',
                                borderRadius: 2.5,
                                px: 3,
                                py: 1.5,
                                minHeight: 48,
                                transition: 'all 0.2s',
                                '&.Mui-selected': { bgcolor: '#fff', color: 'primary.main', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
                            }}
                        />
                        <Tab
                            label="Hiệu suất Chi nhánh"
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '1rem',
                                borderRadius: 2.5,
                                px: 3,
                                py: 1.5,
                                minHeight: 48,
                                transition: 'all 0.2s',
                                '&.Mui-selected': { bgcolor: '#fff', color: 'primary.main', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
                            }}
                        />
                        <Tab
                            label="Nhân sự & Sản phẩm"
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '1rem',
                                borderRadius: 2.5,
                                px: 3,
                                py: 1.5,
                                minHeight: 48,
                                transition: 'all 0.2s',
                                '&.Mui-selected': { bgcolor: '#fff', color: 'primary.main', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
                            }}
                        />
                    </Tabs>
                </Paper>
            </Box>

            <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
                <style>
                    {`
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}
                </style>
                {tabIndex === 0 && <DashboardOverview />}
                {tabIndex === 1 && <DashboardBranch />}
                {tabIndex === 2 && <DashboardProducts />}
            </Box>
        </Container>
    );
};

export default ManagerDashboard;
