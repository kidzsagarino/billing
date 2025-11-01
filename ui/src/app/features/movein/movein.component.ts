import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MoveInService } from '../../services/move-in.service';
import { BuildingService } from '../../services/building.service';
import { UnitService } from '../../services/unit.service';
import { UnitFilterPipe } from './unit-filter.pipe';

@Component({
  selector: 'app-movein',
  styleUrls:['./movein.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, UnitFilterPipe],
  templateUrl: './movein.component.html'
})
export class MoveInComponent {
  moveIn = { Id: '', FullName: '', Email: '', Mobile: '', MoveInDate: '', BuildingId: '', UnitId: '' };
  moveIns: any[] = [];
  buildings: any[] = [];
  units: any[] = [];
  formUnits: any[] = [];
  filteredUnits: any[] = [];
  selectedBuilding = '';
  selectedUnit = '';
  searchText = '';
  isEditing: boolean = false;
  showModal = false;
  page = 1;
  pageSize = 10;
  total = 0;
  math = Math;
  unitSearchText = '';
  showUnitDropdown = false;
  selectedUnitDisplay = '';
  unitFilterText = '';

  constructor(
    private moveInService: MoveInService,
    private buildingService: BuildingService,
    private unitService: UnitService
  ) {}

  ngOnInit() {
    this.unitFilterText = '';
    this.loadBuildings();
    this.loadUnits();
    this.loadMoveIns();
  }

  /** 🔹 Load all move-ins (paginated, with unit filter) */
  loadMoveIns(): void {
    this.moveInService.getAll(this.selectedBuilding, this.selectedUnit, this.page, this.pageSize, this.unitFilterText).subscribe({
      next: (res) => {
        this.moveIns = res.data;
        this.total = res.total;
      },
      error: (err) => console.error('Error loading move-ins:', err),
    });
  }

  /** 🔹 Load units filtered by building */
  loadUnits(): void {
    this.unitService.getUnitsByBuilding(this.selectedBuilding).subscribe({
      next: (data) => (this.units = data),
      error: (err) => console.error('Error loading units:', err),
    });
  }

  loadBuildings() {
    this.buildingService.getAll().subscribe({
      next: (data) => (this.buildings = data),
      error: (err) => console.error('Error loading buildings:', err),
    });
  }

  onBuildingChange() {
   if (this.selectedBuilding) {
    this.unitService.getUnitsByBuilding(this.selectedBuilding).subscribe({
      next: (data) => (this.filteredUnits = data),
      error: (err) => console.error('Error loading units:', err),
      });
    } else {
      this.filteredUnits = [];
    }
  }

 onFormBuildingChange() {
    if (this.moveIn.BuildingId) {
      this.unitService.getUnitsByBuilding(this.moveIn.BuildingId).subscribe({
        next: (data) => (this.formUnits = data),
        error: (err) => console.error('Error loading form units:', err),
      });
    } else {
      this.formUnits = [];
    }
  }
  addMoveIn() {
    this.moveInService.create(this.moveIn).subscribe({
      next: () => {
        alert('✅ Move-in added!');
        this.resetForm();
        this.loadMoveIns();
      },
      error: (err) => {
        console.error('Error saving move-in:', err);
        alert('❌ Failed to save move-in.');
      },
    });
  }

  updateMoveIn() {
    console.log(this.moveIn.Id);
    this.moveInService.update(this.moveIn.Id, this.moveIn).subscribe({
      next: () => {
        alert('✅ Move-in updated successfully!');
        this.closeModal();
        this.loadMoveIns();
        this.isEditing = false;
        this.resetForm();
      },
      error: (err) => {
        console.error('Error updating move-in:', err);
        alert('❌ Failed to update move-in.');
      },
    });
  }

  editMoveIn(moveIn: any) {
    this.moveIn = { ...moveIn };
    this.isEditing = true;
    this.openModal();
  }

  resetForm() {
    this.moveIn = { Id: '', FullName: '', Email: '', Mobile: '', MoveInDate: '', BuildingId: '', UnitId: '' };
    this.isEditing = false;
  }

  filteredMoveIns() {
    // No client-side filtering, just return moveIns as provided by backend
    return this.moveIns;
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadMoveIns();
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.page = 1;
    this.loadMoveIns();
  }

  get totalPages() {
    return this.pageSize ? Math.ceil(this.total / this.pageSize) : 1;
  }

  onSearchChange() {
    this.page = 1;
    if (this.searchText.trim()) {
      this.moveInService.search(this.searchText.trim()).subscribe({
        next: (res) => {
          this.moveIns = res;
          this.total = res.length;
        },
        error: (err) => console.error('Error searching move-ins:', err),
      });
    } else {
      this.loadMoveIns();
    }
  }

  onUnitSearchChange() {
    this.showUnitDropdown = true;
  }

  filteredUnitsForDropdown() {
    const term = this.unitSearchText.trim().toLowerCase();
    if (!term) return this.units;
    return this.units.filter(u => (u.UnitNumber || '').toString().toLowerCase().includes(term));
  }

  selectUnit(unit: any) {
    this.moveIn.UnitId = unit.Id;
    this.selectedUnitDisplay = unit.UnitNumber;
    this.unitSearchText = unit.UnitNumber;
    this.showUnitDropdown = false;
  }

  // Add this to trigger backend search on unit filter change
  onUnitFilterChange() {
    this.page = 1;
    this.loadMoveIns();
  }
}