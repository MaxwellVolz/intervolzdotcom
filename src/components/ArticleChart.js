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
            const currentDate = new Date();
            const articlesByMonth = {};

            // Initialize articlesByMonth with all months from the earliest article to the current date
            const startDate = articles.length ? new Date(articles[articles.length - 1].Date) : new Date();
            startDate.setDate(1); // Start from the first day of the month

            while (startDate <= currentDate) {
                const month = startDate.toLocaleString('default', { month: 'short', year: 'numeric' });
                articlesByMonth[month] = 0;
                startDate.setMonth(startDate.getMonth() + 1);
            }

            // Count articles per month
            articles.forEach(article => {
                const month = new Date(article.Date).toLocaleString('default', { month: 'short', year: 'numeric' });
                articlesByMonth[month] = (articlesByMonth[month] || 0) + 1;
            });

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
                        pointRadius: 10,
                        pointHoverRadius: 30,
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
                                        stepSize: 1,
                                    },
                                },
                            },
                            plugins: {
                                legend: {
                                    display: false,
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
