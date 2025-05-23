// graduate-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Graduate } from '../../Models/Graduate';
import { GraduatesMapComponent } from '../graduates-map/graduates-map.component';
import { NewGraduateComponent } from '../new-graduate/new-graduate.component';

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
  modalVisible = false;
  currentUserId!: number;
  creatingGraduate = false;
    selectedGraduate: any = null;
    totalResults: number = 0;

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

  ngOnInit() {
    this.getCurrentUserId();

      this.http.get<{ total: number }>('https://localhost:5001/api/graduates/count', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token')! }
    }).subscribe(response => {
      this.totalGraduates = response.total;
    });

  }

  

  getCurrentUserId() {
    this.http.get<{ userId: number }>('https://localhost:5001/api/account/me', {
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

    if (this.firstName.trim()) {
      params = params.set('firstName', this.firstName);
    }

    if (this.lastName.trim()) {
      params = params.set('lastName', this.lastName);
    }

    if (this.email.trim()) {
      params = params.set('email', this.email);
    }

    if (this.academicEntryYear) {
      params = params.set('academicEntryYear', this.academicEntryYear.toString());
    }

    if (this.graduationYear) {
      params = params.set('graduationYear', this.graduationYear.toString());
    }

    if (this.degreeGrade) {
      params = params.set('degreeGrade', this.degreeGrade.toString());
    }

    this.http.get<any>('https://localhost:5001/api/graduates/search', {
      params,
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')!
      }
    }).subscribe({
      next: res => {
        this.graduates = res.results;
        this.totalResults = res.totalResults;
      },
      error: err => {
        console.error('Failed to fetch graduates', err);
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
      this.http.delete(`https://localhost:5001/api/graduates/${id}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')!
        }
      }).subscribe(() => {
        this.graduates = this.graduates.filter(g => g.id !== id);
        this.totalResults--;
         this.totalGraduates--;
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
    this.selectedGraduate = null;
  }

  editGraduate(grad: any) {
    this.http.get(`https://localhost:5001/api/graduates/${grad.id}`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')!
      }
    }).subscribe((fullGrad: any) => {
      this.selectedGraduate = fullGrad;
      this.creatingGraduate = true;
    });
  }
}
