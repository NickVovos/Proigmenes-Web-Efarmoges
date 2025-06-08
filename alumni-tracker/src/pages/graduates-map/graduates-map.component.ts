import { Component, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-graduates-map',
  templateUrl: './graduates-map.component.html',
  styleUrls: ['./graduates-map.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule]
})
export class GraduatesMapComponent implements AfterViewInit, OnChanges {
  @Input() graduates: any[] = [];
  @Input() currentUserId!: number;

  private L: any;
  private leaflet: any;
  private map: any;
  private mapReady = false;
  private markers: any[] = [];

  async ngAfterViewInit() {
    if (typeof window === 'undefined') return;

    this.L = await import('leaflet');
    this.leaflet = this.L.default ? this.L.default : this.L;
    // Defensive: Use Icon.Default from the correct object
    const IconDefault = this.leaflet.Icon?.Default;
    if (IconDefault) {
      IconDefault.mergeOptions({
        iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
        iconUrl: 'assets/leaflet/marker-icon.png',
        shadowUrl: 'assets/leaflet/marker-shadow.png',
      });
    }
    this.map = this.leaflet.map('map').setView([20, 0], 2);
    this.leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
    this.mapReady = true;
    this.plotMarkers();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['graduates'] && this.mapReady) {
      this.plotMarkers();
    }
  }

  private plotMarkers() {
    if (!this.map || !this.graduates?.length) return;

    // Clear existing markers
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];

    this.graduates.forEach(grad => {
      const employments = grad.employments;
      if (!employments?.length) return;

      const latestEmployment = employments.find((e: { address: { latitude: string; longitude: string; }; }) => {
        const lat = parseFloat(e.address?.latitude);
        const lng = parseFloat(e.address?.longitude);
        return !isNaN(lat) && !isNaN(lng);
      });

      if (!latestEmployment) return;

      const address = latestEmployment.address;
      const lat = parseFloat(address.latitude);
      const lng = parseFloat(address.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      const iconUrl = grad.userId === this.currentUserId
        ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
        : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';

      const marker = this.leaflet.marker([lat, lng], {
        icon: this.leaflet.icon({
          iconUrl,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        })
      }).addTo(this.map)
        .bindPopup(`
          <strong>${grad.firstName} ${grad.lastName}</strong><br>
          ${latestEmployment.organization || ''}<br>
          ${address.city || ''}, ${address.country || ''}
        `);

      this.markers.push(marker);
    });

    setTimeout(() => this.map.invalidateSize(), 100);
  }
}
