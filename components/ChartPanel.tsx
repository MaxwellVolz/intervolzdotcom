'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import type { Data, Layout, Config } from 'plotly.js';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false }) as React.ComponentType<{
    data: Data[];
    layout: Partial<Layout>;
    config?: Partial<Config>;
    style?: React.CSSProperties;
}>;

type ChartPanelProps = {
    title: string;
    getData: () => Data[];
    style?: React.CSSProperties;
};

export default function ChartPanel({ title, getData, style }: ChartPanelProps) {
    const [plotData, setPlotData] = useState<Data[]>([]);

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
                    data={plotData}
                    layout={{
                        autosize: true,
                        margin: { t: 10, b: 40, l: 60, r: 10 },
                        paper_bgcolor: '#111',
                        plot_bgcolor: '#111',
                        font: { color: '#fff' },
                        showlegend: false,
                        xaxis: {
                            title: {
                                text: 'Seconds Ago',
                                font: { color: '#fff' },
                            },
                            autorange: 'reversed',
                            fixedrange: true,
                            tickfont: { color: '#fff' },
                        },
                        yaxis: {
                            title: {
                                text: 'Degrees',
                                font: { color: '#fff' },
                            },
                            fixedrange: true,
                            tickfont: { color: '#fff' },
                        },
                    }}
                    config={{
                        displayModeBar: false,
                        staticPlot: true,
                    }}
                    style={{ width: '100%', height: 200 }}
                />
            </div>
        </Draggable>
    );
}
