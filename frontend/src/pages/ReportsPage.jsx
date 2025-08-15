import React, { useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState(null);

  const fetchReport = async () => {
    console.log('1. "Get Report" button clicked.'); // Log #1

    if (!startDate || !endDate) {
      alert('Please select a start and end date');
      return;
    }

    console.log('2. Sending request to API with dates:', { startDate, endDate }); // Log #2

    try {
      const res = await axios.get(`http://localhost:3001/api/sales-report`, {
        params: { startDate, endDate },
      });
      console.log('4. Successful response received from server:', res.data); // Log #4
      setReport(res.data);
    } catch (err) {
      console.error('Error! Request to server failed. Full error:', err); // Error Log
      if (err.response) {
        console.error('Error response from server (backend):', err.response.data);
      }
      alert('Error fetching report. Please check the browser console (F12) for details.');
    }
  };

  let chartData = null;
  if (report) {
    const allProductNames = Array.from(
      new Set([
        ...report.sales.map((p) => p.name),
        ...report.returns.map((p) => p.name),
      ])
    );
    const salesData = allProductNames.map((name) => {
      const found = report.sales.find((p) => p.name === name);
      return found ? found.totalRevenue : 0;
    });
    const returnsData = allProductNames.map((name) => {
      const found = report.returns.find((p) => p.name === name);
      return found ? -found.totalRefund : 0; // Negative for returns
    });

    chartData = {
      labels: allProductNames,
      datasets: [
        {
          label: 'Sales ($)',
          data: salesData,
          backgroundColor: '#4CAF50',
        },
        {
          label: 'Returns ($)',
          data: returnsData,
          backgroundColor: '#F44336',
        },
      ],    };
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: 'white' } },
      title: { display: true, text: 'Sales and Returns Chart', color: 'white' },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              // Format number as currency, using absolute value for display
              label += '$' + Math.abs(context.parsed.y).toLocaleString('en-US');
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: 'white' },
        grid: { color: 'rgba(255, 255, 255, 0.2)' }
      },
      y: {
        ticks: {
          color: 'white',
          // Format Y-axis labels as currency
          callback: function(value) {
            return '$' + value.toLocaleString('en-US');
          }
        },
        grid: { color: 'rgba(255, 255, 255, 0.2)' }
      },    },
  };

  // Helper function to format numbers as currency
  const formatCurrency = (number) => {    return number.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  return (
    <div style={{ padding: '20px', color: 'white' }}> {/* Removed RTL direction */}
      <h1>📊 Sales and Returns Report</h1>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button onClick={fetchReport}>Get Report</button>
      </div>

      {report && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h3>📅 From {new Date(report.startDate).toLocaleDateString('en-US')} to {new Date(report.endDate).toLocaleDateString('en-US')}</h3>
            <p>🛒 Total Orders: <b>{report.totalOrders}</b></p>
            <p>💰 Total Revenue: <b>{formatCurrency(report.totalRevenue)}</b></p>
          </div>
          
          <h3>Sales</h3>
          <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '30px', backgroundColor: 'white', color: 'black' }}>
            <thead style={{ backgroundColor: '#e0f2f1' }}>
              <tr>
                <th>Product Name</th>
                <th>Quantity Sold</th>
                <th>Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {report.sales.map((p, idx) => (
                <tr key={idx}>
                  <td>{p.name}</td>
                  <td>{p.soldQuantity}</td>
                  <td>{formatCurrency(p.totalRevenue)}</td>
                </tr>              ))}
            </tbody>
          </table>

          <h3>Returns</h3>
          <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '30px', backgroundColor: 'white', color: 'black' }}>
            <thead style={{ backgroundColor: '#ffebee' }}>
              <tr>
                <th>Product Name</th>
                <th>Quantity Returned</th>
                <th>Total Refund</th>
              </tr>
            </thead>
            <tbody>
              {report.returns.map((p, idx) => (
                <tr key={idx}>
                  <td>{p.name}</td>
                  <td>{p.returnedQuantity}</td>
                  <td>{formatCurrency(p.totalRefund)}</td>
                </tr>
              ))}
            </tbody>
          </table>          {chartData && (
            <div style={{ background: 'rgba(50, 50, 50, 0.5)', padding: '20px', borderRadius: '10px' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}
        </>
      )}
    </div>
  );
}