// src/components/ArticleChart.js
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Box, useTheme, Card, CardContent, Typography } from '@mui/material';
import useArticles from '../hooks/useArticles';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ArticleChart = () => {
    const theme = useTheme();
    const { articles, loading } = useArticles();
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });

    useEffect(() => {
        if (!loading) {
            const articlesByMonth = articles.reduce((acc, article) => {
                const month = new Date(article.Date).toLocaleString('default', { month: 'short', year: 'numeric' });
                acc[month] = (acc[month] || 0) + 1;
                return acc;
            }, {});

            const labels = Object.keys(articlesByMonth).sort((a, b) => new Date(a) - new Date(b));
            const data = labels.map(month => articlesByMonth[month]);

            setChartData({
                labels,
                datasets: [
                    {
                        label: 'Articles',
                        data,
                        borderColor: theme.palette.primary.main,
                        backgroundColor: theme.palette.primary.light,
                        pointRadius: 10, // Increase marker size
                        pointHoverRadius: 30, // Increase hover marker size
                        fill: false,
                    },
                ],
            });
        }
    }, [loading, articles, theme]);

    return (
        <Card style={{ width: '100%', marginTop: theme.spacing(4) }}>
            <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                    Articles by Month
                </Typography>
                <Box width="100%" height="300px">
                    <Line
                        data={chartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                x: {
                                    ticks: {
                                        maxRotation: 15,
                                        minRotation: 15,
                                    },
                                },
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        stepSize: 1, // Ensure Y-axis displays whole numbers
                                    },
                                },
                            },
                            plugins: {
                                legend: {
                                    display: false, // Hide the legend
                                },
                                tooltip: {
                                    backgroundColor: theme.palette.background.paper,
                                    titleFont: { size: 16, weight: 'bold' },
                                    bodyFont: { size: 14 },
                                    padding: 10,
                                    borderColor: theme.palette.divider,
                                    borderWidth: 1,
                                    titleColor: theme.palette.text.primary,
                                    bodyColor: theme.palette.text.secondary,
                                },
                            },
                        }}
                    />
                </Box>
            </CardContent>
        </Card>
    );
};

export default ArticleChart;
