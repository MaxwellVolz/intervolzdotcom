// components/ChartPanel.tsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Draggable from 'react-draggable'; // Optional: for movable UI

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type ChartPanelProps = {
    title: string;
    seriesName: string;
    getData: () => Plotly.Data[];
    style?: React.CSSProperties;
};

export default function ChartPanel({ title, seriesName, getData, style }: ChartPanelProps) {
    const [plotData, setPlotData] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });

    useEffect(() => {
        const interval = setInterval(() => {
            const newData = getData();
            setPlotData(newData);
        }, 1000);
        return () => clearInterval(interval);
    }, [getData]);

    return (
        <Draggable handle=".handle">
            <div
                className="handle"
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: '#111',
                    color: '#fff',
                    border: '1px solid #444',
                    borderRadius: 8,
                    padding: 10,
                    zIndex: 100,
                    width: 400,
                    ...style,
                }}
            >
                <h3 style={{ margin: 0, paddingBottom: 5 }}>{title}</h3>
                <Plot
                    data={getData()}
                    layout={{
                        autosize: true,
                        margin: { t: 10, b: 40, l: 50, r: 10 },
                        paper_bgcolor: '#111',
                        plot_bgcolor: '#111',
                        font: { color: '#fff' },
                        showlegend: false,
                        xaxis: {
                            title: {
                                text: 'seconds ago',
                                font: { color: '#888' },
                            },
                            autorange: 'reversed',        // ✅ right-to-left timeline
                            fixedrange: true,             // ❌ disables zoom/pan
                            tickfont: { color: '#888' },

                        },
                        yaxis: {
                            title: {
                                text: 'deg',
                                font: { color: '#888' },
                            },
                            fixedrange: true,
                            tickfont: { color: '#888' },

                        },
                    }}
                    config={{
                        // displayModeBar: false,
                        staticPlot: true,
                    }}
                    style={{ width: '100%', height: 200 }}
                />



            </div>
        </Draggable>
    );
}
