// graduate-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Graduate } from '../../Models/Graduate';
import { GraduatesMapComponent } from '../graduates-map/graduates-map.component';
import { NewGraduateComponent } from '../new-graduate/new-graduate.component';

declare var google: any;

@Component({
  selector: 'app-graduate-dashboard',
  templateUrl: './graduate-dashboard.component.html',
  styleUrls: ['./graduate-dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    GraduatesMapComponent,
    NewGraduateComponent
  ]
})
export class GraduateDashboardComponent implements OnInit {
  graduates: Graduate[] = [];
  allGraduates: Graduate[] = []; // NEW → All graduates for map + chart
  modalVisible = false;
  currentUserId!: number;
  creatingGraduate = false;
  selectedGraduate: any = null;
  totalResults: number = 0;
  chartsLoaded = false;

  // Filters
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  academicEntryYear?: number;
  graduationYear?: number;
  degreeGrade?: number;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 4;
  totalGraduates: number = 0;

  constructor(private http: HttpClient) {}

  async ngOnInit() {
    await this.loadGoogleCharts();

    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(() => {
      this.chartsLoaded = true;
      this.getCurrentUserId();
      this.loadAllGraduates(); // Load all graduates after charts ready
    });

    this.http.get<{ total: number }>('https://alumniapi20250607211620.azurewebsites.net/api/graduates/count', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token')! }
    }).subscribe(response => {
      this.totalGraduates = response.total;
    });
  }

loadGoogleCharts(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      // We are in SSR → skip loading
      resolve();
      return;
    }

    const scriptId = 'google-charts-script';
    if (document.getElementById(scriptId)) {
      resolve(); // already loaded
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'text/javascript';
    script.src = 'https://www.gstatic.com/charts/loader.js';
    script.onload = () => {
      resolve();
    };
    document.body.appendChild(script);
  });
}

  getCurrentUserId() {
    this.http.get<{ userId: number }>('https://alumniapi20250607211620.azurewebsites.net/api/account/me', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token')! }
    }).subscribe({
      next: res => {
        this.currentUserId = res.userId;
        this.fetchGraduates();
      },
      error: err => console.error('Failed to fetch current user ID', err)
    });
  }

  fetchGraduates() {
    let params = new HttpParams().set('page', this.currentPage.toString());

    if (this.firstName.trim()) params = params.set('firstName', this.firstName);
    if (this.lastName.trim()) params = params.set('lastName', this.lastName);
    if (this.email.trim()) params = params.set('email', this.email);
    if (this.academicEntryYear) params = params.set('academicEntryYear', this.academicEntryYear.toString());
    if (this.graduationYear) params = params.set('graduationYear', this.graduationYear.toString());
    if (this.degreeGrade) params = params.set('degreeGrade', this.degreeGrade.toString());

    this.http.get<any>('https://alumniapi20250607211620.azurewebsites.net/api/graduates/search', {
      params,
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token')! }
    }).subscribe({
      next: res => {
        this.graduates = res.results;
        this.totalResults = res.totalResults;
        // Do not call drawCountryChart here → we use ALL graduates
      },
      error: err => {
        console.error('Failed to fetch graduates', err);
      }
    });
  }

  loadAllGraduates() {
    this.http.get<Graduate[]>('https://alumniapi20250607211620.azurewebsites.net/api/graduates/mygraduates', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token')! }
    }).subscribe({
      next: res => {
        this.allGraduates = res;
        this.drawCountryChart();
      },
      error: err => {
        console.error('Failed to fetch all graduates', err);
      }
    });
  }

  applyFilters() {
    this.currentPage = 1;
    this.fetchGraduates();
  }

  get totalPages(): number[] {
    const total = Math.ceil(this.totalResults / this.pageSize);
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages.length) return;
    this.currentPage = page;
    this.fetchGraduates();
  }

  deleteGraduate(id: number) {
    if (confirm('Are you sure you want to delete this graduate?')) {
      this.http.delete(`https://alumniapi20250607211620.azurewebsites.net/api/graduates/${id}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')!
        }
      }).subscribe(() => {
        this.graduates = this.graduates.filter(g => g.id !== id);
        this.totalResults--;
        this.totalGraduates--;

        // Also update allGraduates
        this.allGraduates = this.allGraduates.filter(g => g.id !== id);
        this.drawCountryChart();
      });
    }
  }

  openModal() {
    this.modalVisible = true;
    this.creatingGraduate = true;
  }

  closeModal() {
    this.modalVisible = false;
    this.creatingGraduate = false;
  }

  onGraduateCreated() {
    this.creatingGraduate = false;
    this.fetchGraduates();
    this.loadAllGraduates(); // Refresh all graduates after create
    this.selectedGraduate = null;
  }

  editGraduate(grad: any) {
    this.http.get(`https://alumniapi20250607211620.azurewebsites.net/api/graduates/${grad.id}`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')!
      }
    }).subscribe((fullGrad: any) => {
      this.selectedGraduate = fullGrad;
      this.creatingGraduate = true;
    });
  }

  drawCountryChart() {
    if (!this.chartsLoaded) return;

    const countryCount: { [country: string]: number } = {};
debugger;
    this.allGraduates.forEach(grad => {
      if (grad.employments && grad.employments.length > 0) {
        const latestEmployment = grad.employments
          .sort((a, b) => b.from.localeCompare(a.from))[0];

        const country = latestEmployment.address?.country || 'Άγνωστη Χώρα';

        if (countryCount[country]) {
          countryCount[country]++;
        } else {
          countryCount[country] = 1;
        }
      } else {
        const noEmploymentCountry = 'Χωρίς Εργασία';
        if (countryCount[noEmploymentCountry]) {
          countryCount[noEmploymentCountry]++;
        } else {
          countryCount[noEmploymentCountry] = 1;
        }
      }
    });

    const chartData: (string | number)[][] = [['Χώρα', 'Απόφοιτοι']];
    for (const country in countryCount) {
      chartData.push([country, countryCount[country]]);
    }

    const data = google.visualization.arrayToDataTable(chartData);

    const options = {
      title: 'Κατανομή Αποφοίτων ανά Χώρα',
      legend: { position: 'none' },
      hAxis: { title: 'Χώρα' },
      vAxis: { title: 'Αριθμός Αποφοίτων' },
      bar: { groupWidth: '75%' }
    };

    const chart = new google.visualization.ColumnChart(document.getElementById('countryChart'));
    chart.draw(data, options);
  }
}
