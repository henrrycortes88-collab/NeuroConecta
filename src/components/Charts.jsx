// src/components/Charts.jsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, LineElement,
  PointElement, ArcElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, LineElement,
  PointElement, ArcElement,
  Title, Tooltip, Legend, Filler
);

const DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: '#7A8FB0', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,.05)' } },
    y: { ticks: { color: '#7A8FB0', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,.05)' } }
  }
};

export function BarChart({ labels, data, color, height = 80 }) {
  return (
    <div style={{ height }}>
      <Bar
        data={{
          labels,
          datasets: [{ data, backgroundColor: color + '66', borderColor: color, borderWidth: 1.5, borderRadius: 4 }]
        }}
        options={DEFAULTS}
      />
    </div>
  );
}

export function LineChart({ labels, data, color, height = 80, filled = true }) {
  return (
    <div style={{ height }}>
      <Line
        data={{
          labels,
          datasets: [{
            data, borderColor: color,
            backgroundColor: filled ? color + '22' : 'transparent',
            fill: filled, tension: .4,
            pointRadius: 3, pointBackgroundColor: color
          }]
        }}
        options={{ ...DEFAULTS, scales: { ...DEFAULTS.scales, x: { ...DEFAULTS.scales.x, grid: { display: false } } } }}
      />
    </div>
  );
}

export function HBarChart({ labels, data, color, height = 100 }) {
  return (
    <div style={{ height }}>
      <Bar
        data={{
          labels,
          datasets: [{ data, backgroundColor: color + '66', borderColor: color, borderWidth: 1.5, borderRadius: 4 }]
        }}
        options={{ ...DEFAULTS, indexAxis: 'y' }}
      />
    </div>
  );
}

export function MultiBarChart({ labels, datasets, height = 100 }) {
  return (
    <div style={{ height }}>
      <Bar
        data={{ labels, datasets }}
        options={{
          ...DEFAULTS,
          plugins: { legend: { display: true, labels: { color: '#7A8FB0', font: { size: 10 }, boxWidth: 10 } } }
        }}
      />
    </div>
  );
}

export function DonutChart({ labels, data, colors, height = 120 }) {
  return (
    <div style={{ height }}>
      <Doughnut
        data={{
          labels,
          datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#1A2235' }]
        }}
        options={{
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'right', labels: { color: '#7A8FB0', font: { size: 10 }, boxWidth: 10 } } }
        }}
      />
    </div>
  );
}
