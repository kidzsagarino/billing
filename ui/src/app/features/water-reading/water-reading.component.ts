import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WaterService } from '../../services/water.service';
import { BuildingService } from '../../services/building.service';
import { UnitService } from '../../services/unit.service';
import { HotToastService } from '@ngxpert/hot-toast';

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

  selectedYear: number = 2025;
  selectedMonth: number = 10;
  // Year and month arrays for dropdowns
  years: number[] = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i); // last 5 years
  months: number[] = Array.from({ length: 12 }, (_, i) => i + 1);

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

  editingIndex: number | null = null;
  editValue: number | null = null;
  originalValue: number | null = null;

  constructor(
    private waterService: WaterService,
    private buildingService: BuildingService,
    private unitService: UnitService,
    private toast: HotToastService
  ) {}

 ngOnInit() {
    const now = new Date();

    this.selectedMonth = now.getMonth() + 1;
    this.selectedYear = now.getFullYear();
    this.searchByBillingMonth();
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
    const billingMonth = `${this.selectedYear}-${this.selectedMonth.toString().padStart(2,'0')}`;
    this.waterService.getReadings(billingMonth).subscribe({
      next: (res: any) => {
        // Filter by building, unit, and billingMonth
        
        this.readings = res.data;
        this.total = this.readings.length;

      },
      error: (err) => this.toast.error('Error loading water readings: ' + (err.error?.error || err.message || 'Unknown error'))
    });
  }

  // /** 🔹 Open add/edit modal */
  openModal(reading?: any) {
    // if (reading) {
    //   this.reading = { ...reading };
    //   this.isEditing = true;
    // } else {
    //   this.reading = {
    //     buildingNumber: '',
    //     unitNumber: '',
    //     readingDate: '',
    //     previousReading: 0,
    //     currentReading: 0,
    //     consumption: 0,
    //     ratePerCubic: 0,
    //     totalAmount: 0
    //   };
    //   this.isEditing = false;
    // }
    // this.showModal = true;
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

  loadReadingForBillingMonth(){
    this.waterService.saveReadingForBillingMonth({
      billingMonth: `${this.selectedYear}-${this.selectedMonth.toString().padStart(2,'0')}`
    }).subscribe({
      next: () => { 
        this.loadReadings();
      }
      ,
      error: (err) => {
        console.error('Error loading readings for billing month:', err);
        this.toast.error(err.error.message || '❌ Failed to load readings for billing month.');
      }
    });
  }

  startEdit(index: number, currentValue: number) {
    this.editingIndex = index;
    this.editValue = currentValue;
    this.originalValue = currentValue;
  }
    
  isEditing(index: number) {
    return this.editingIndex === index;
  }

  finishEdit(index: number) {
    if (this.editValue === this.originalValue) {
      this.cancelEdit();
      return;
    }

    const reading = this.readings[index];
    reading.Consumption = this.editValue;

    this.updateConsumption(reading.Id, this.editValue ?? 0);

    this.cancelEdit();
  }

  cancelEdit() {
    this.editingIndex = null;
    this.editValue = null;
    this.originalValue = null;
  }

  onKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Enter') {
      (event.target as HTMLElement).blur();
    } else if (event.key === 'Escape') {
      this.cancelEdit();
    }
  }

  selectText(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    // Wait for DOM to render before selecting (important)
    setTimeout(() => input.select(), 0);
  }

  // Example API call
  updateConsumption(id: string, newValue: number) {
    // Replace with your actual service method
    this.waterService.updateReading(id, { Consumption: newValue }).subscribe({
      next: () => {
       
      },
      error: (err) => {
        console.error('Error updating consumption:', err);
        alert('❌ Failed to update consumption.');
      }
    }); 
  }
  searchByUnitNumber() {
    if (!this.searchUnit) {
      this.loadReadings();
      return;
    } 
    this.waterService.searchByUnitNumber(this.searchUnit).subscribe({
      next: (res) => {
        console.log('Readings loaded by unit number:', res);
        this.readings = res;
      }
      ,
      error: (err) => {
        console.error('Error loading readings by unit number:', err);
      }
    }); 
  }
  searchByBillingMonth() {
    if (!this.selectedYear || !this.selectedMonth) {
      this.loadReadings();
      return;
    }
    const billingMonth = `${this.selectedYear}-${this.selectedMonth.toString().padStart(2, '0')}`;
    this.waterService.searchByBillingMonth(billingMonth).subscribe({
      next: (res) => {
        console.log('Readings loaded by billing month:', res);
        this.readings = res;
      } ,
      error: (err) => {
        console.error('Error loading readings by billing month:', err);
      }
    });
  }
}