// src/components/TagsChart.js
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Box, useTheme, Card, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useArticles from '../hooks/useArticles';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TagsChart = () => {
    const theme = useTheme();
    const { articles, loading } = useArticles();
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [activeIndex, setActiveIndex] = useState(null);
    const navigate = useNavigate();

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
        indexAxis: 'y', // Make the bars horizontal
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1, // Ensure X-axis displays whole numbers
                },
            },
            y: {
                ticks: {
                    color: (context) => {
                        return activeIndex !== null && context.index === activeIndex
                            ? theme.palette.primary.main
                            : "#999999";
                    },
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
        onHover: (event, elements) => {
            if (elements.length > 0) {
                setActiveIndex(elements[0].index);
            } else {
                setActiveIndex(null);
            }
        },
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const tag = chartData.labels[index];
                navigate(`/tags/${tag}`);
            }
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
