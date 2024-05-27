// src/components/TagsChart.js
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Box, useTheme, Card, CardContent, Typography } from '@mui/material';
import useArticles from '../hooks/useArticles';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
// import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TagsChart = () => {
    const theme = useTheme();
    const { articles, loading } = useArticles();
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });

    useEffect(() => {
        if (!loading) {
            const tagsFrequency = articles.reduce((acc, article) => {
                article.Tags.split(',').forEach(tag => {
                    tag = tag.trim();
                    acc[tag] = (acc[tag] || 0) + 1;
                });
                return acc;
            }, {});

            const labels = Object.keys(tagsFrequency).sort((a, b) => tagsFrequency[b] - tagsFrequency[a]);
            const data = labels.map(tag => tagsFrequency[tag]);

            setChartData({
                labels,
                datasets: [
                    {
                        label: 'Tag Frequency',
                        data,
                        backgroundColor: theme.palette.primary.main,
                        borderColor: theme.palette.primary.dark,
                        borderWidth: 1,
                    },
                ],
            });
        }
    }, [loading, articles, theme]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
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
    };

    return (
        <Card style={{ width: '100%', marginTop: theme.spacing(4) }}>
            <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                    Tags Frequency
                </Typography>
                <Box width="100%" height="300px">
                    <Bar data={chartData} options={chartOptions} />
                </Box>
            </CardContent>
        </Card>
    );
};

export default TagsChart;
