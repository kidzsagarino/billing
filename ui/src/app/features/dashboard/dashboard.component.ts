import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  imports: [CommonModule, FormsModule]
})

export class DashboardComponent {
  years = [2025, 2024, 2023];
  months = [
    { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' },
    { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' },
    { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' },
    { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' }
  ];

  selectedYear = 2025;
  selectedMonth: number | '' = '';

  stats = [
    { title: 'Total Due', value: 120000, icon: 'account_balance', color: 'bg-blue-500' },
    { title: 'Total Paid', value: 90000, icon: 'paid', color: 'bg-green-500' },
    { title: 'Balance', value: 30000, icon: 'account_balance_wallet', color: 'bg-yellow-500' },
    { title: 'Tenants', value: 25, icon: 'people', color: 'bg-purple-500' }
  ];

  tenants = [
    { name: 'John Doe', unit: '101', due: 5000, paid: 4000, balance: 1000 },
    { name: 'Jane Smith', unit: '102', due: 6000, paid: 6000, balance: 0 },
    { name: 'Mike Johnson', unit: '201', due: 5500, paid: 5000, balance: 500 },
  ];

  // Pie chart data
  billingPieLabels = ['Paid', 'Balance', 'Due'];
  billingPieData = [90000, 30000, 120000];

  // Stacked Bar chart data per building
  buildingLabels = ['Building A', 'Building B', 'Building C'];
  buildingBarData = [
    { data: [40000, 25000, 10000], label: 'Paid' },
    { data: [10000, 5000, 2000], label: 'Balance' }
  ];
  buildingBarOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { x: { stacked: true }, y: { stacked: true } }
  };

  filterData() {
    // implement filter logic based on selectedYear and selectedMonth
  }

  ngAfterViewInit(): void {
    // Pie Chart
    const pieCtx = document.getElementById('billingPie') as HTMLCanvasElement;
    new Chart(pieCtx, {
      type: 'pie',
      data: {
        labels: ['Paid', 'Balance', 'Overdue'],
        datasets: [{
          data: [6000, 2000, 1000],
          backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        }]
      },
      options: {
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });

    // Stacked Bar Chart
    const barCtx = document.getElementById('buildingBar') as HTMLCanvasElement;
    new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: ['Building A', 'Building B', 'Building C'],
        datasets: [
          { label: 'Paid', data: [4000, 3000, 2500], backgroundColor: '#10B981' },
          { label: 'Balance', data: [1000, 2000, 1500], backgroundColor: '#F59E0B' }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } },
        scales: {
          x: { stacked: true },
          y: { stacked: true, beginAtZero: true }
        }
      }
    });
  }
}
