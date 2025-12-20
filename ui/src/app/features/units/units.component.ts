import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

interface Unit {
  id: number;
  name: string;
  tenant: string | null;
  status: 'Occupied' | 'Vacant';
  rent: number;
}

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.css']
})
export class UnitsComponent {
  displayedColumns: string[] = ['id', 'name', 'tenant', 'status', 'rent', 'actions'];

  units: Unit[] = [
    { id: 1, name: 'Unit A1', tenant: 'John Doe', status: 'Occupied', rent: 15000 },
    { id: 2, name: 'Unit A2', tenant: null, status: 'Vacant', rent: 12000 },
    { id: 3, name: 'Unit B1', tenant: 'Jane Smith', status: 'Occupied', rent: 18000 },
    { id: 4, name: 'Unit B2', tenant: null, status: 'Vacant', rent: 14000 }
  ];

  addUnit() {
    
  }

  editUnit(unit: Unit) {
    
  }

  deleteUnit(unit: Unit) {
    
  }
}