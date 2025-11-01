import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WaterService } from '../../services/water.service';
import { BuildingService } from '../../services/building.service';
import { UnitService } from '../../services/unit.service';

@Component({
  selector: 'app-water-reading',
  styleUrls: ['./water-reading.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './water-reading.component.html'
})
export class WaterReadingComponent {
  readings: any[] = [];
  buildings: any[] = [];
  units: any[] = [];
  filteredUnits: any[] = [];
  selectedBuilding = '';

  reading: any = {
    buildingNumber: '',
    unitNumber: '',
    readingDate: '',
    previousReading: 0,
    currentReading: 0,
    consumption: 0,
    ratePerCubic: 0,
    totalAmount: 0
  };

  searchBuilding = '';
  searchUnit = '';
  billingMonth = '';
  showModal = false;

  page = 1;
  pageSize = 10;
  total = 0;

  isEditing = false;

  constructor(
    private waterService: WaterService,
    private buildingService: BuildingService,
    private unitService: UnitService
  ) {}

  ngOnInit() {
    this.loadBuildings();
    this.loadUnits();
    this.loadReadings();
  }

  /** 🔹 Load all buildings */
  loadBuildings() {
    this.buildingService.getAll().subscribe({
      next: (res) => (this.buildings = res),
      error: (err) => console.error('Error loading buildings:', err)
    });
  }

  /** 🔹 Load all units */
  loadUnits() {
    this.unitService.getAllUnits().subscribe({
      next: (res) => (this.units = res),
      error: (err) => console.error('Error loading units:', err)
    });
  }

  /** 🔹 Load water readings from API with pagination & filters */
  loadReadings() {
    this.waterService.getAllReadings(this.page, this.pageSize).subscribe({
      next: (res: any) => {
        // Filter by building, unit, and billingMonth
        
        this.readings = res.data;
        this.total = this.readings.length;

      },
      error: (err) => console.error('Error loading water readings:', err)
    });
  }

  /** 🔹 Open add/edit modal */
  openModal(reading?: any) {
    if (reading) {
      this.reading = { ...reading };
      this.isEditing = true;
    } else {
      this.reading = {
        buildingNumber: '',
        unitNumber: '',
        readingDate: '',
        previousReading: 0,
        currentReading: 0,
        consumption: 0,
        ratePerCubic: 0,
        totalAmount: 0
      };
      this.isEditing = false;
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  /** 🔹 Compute consumption and total */
  computeConsumption() {
    this.reading.consumption = Math.max(0, this.reading.currentReading - this.reading.previousReading);
    this.computeTotal();
  }

  computeTotal() {
    this.reading.totalAmount = +(this.reading.consumption * this.reading.ratePerCubic).toFixed(2);
  }

  /** 🔹 Save reading */
  saveReading() {
    // Convert date to YYYY-MM for billingMonth
    const dateStr = this.reading.readingDate;
    const billingMonth = dateStr ? dateStr.substring(0, 7) : '';

    const payload = {
      buildingNumber: this.reading.buildingNumber,
      unitNumber: this.reading.unitNumber,
      previousReading: this.reading.previousReading,
      currentReading: this.reading.currentReading,
      consumption: this.reading.consumption,
      ratePerCubic: this.reading.ratePerCubic,
      totalAmount: this.reading.totalAmount,
      billingMonth
    };

    this.waterService.saveReading(payload).subscribe({
      next: () => {
       
        this.closeModal();
        this.loadReadings();
      },
      error: (err) => {
        console.error('Error saving reading:', err);
        alert('❌ Failed to save water reading.');
      }
    });
  }

  /** 🔹 Pagination helpers */
  goToPage(page: number) {
    if (page < 1) return;
    this.page = page;
    this.loadReadings();
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.page = 1;
    this.loadReadings();
  }

  get totalPages() {
    return this.pageSize ? Math.ceil(this.total / this.pageSize) : 1;
  }

  /** 🔹 Filter change triggers */
  onFilterChange() {
    this.page = 1;
    this.loadReadings();
  }

  onBuildingChange() {
    if (this.reading.buildingNumber) {
      this.unitService.getUnitsByBuilding(this.reading.buildingNumber).subscribe({
        next: (res) => (this.filteredUnits = res),
        error: (err) => console.error('Error loading units for building:', err)
      });
    } else {
      this.filteredUnits = [];
    }
  }

  onSearchChange() {
    // this.page = 1;
    // if (this.searchText.trim()) {
    //   this.moveInService.search(this.searchText.trim()).subscribe({
    //     next: (res) => {
    //       this.moveIns = res;
    //       this.total = res.length;
    //     },
    //     error: (err) => console.error('Error searching move-ins:', err),
    //   });
    // } else {
    //   this.loadMoveIns();
    // }
  }
}