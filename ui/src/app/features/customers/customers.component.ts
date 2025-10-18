// tenant.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';

interface Tenant {
  buildingNo: string;
  unitNo: string;
  ownerName: string;
  moveInDate: Date;
  mobileNumber: string;
  email: string;
}

@Component({
  selector: 'app-tenant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.component.html'
})
export class CustomersComponent {
  tenants: Tenant[] = [
    { buildingNo: '301', unitNo: '101', ownerName: 'John Doe', moveInDate: new Date('2025-01-01'), mobileNumber: '09171234567', email: 'john@example.com' },
    { buildingNo: '302', unitNo: '102', ownerName: 'Jane Smith', moveInDate: new Date('2025-02-01'), mobileNumber: '09179876543', email: 'jane@example.com' },
    { buildingNo: '303', unitNo: '103', ownerName: 'Mike Johnson', moveInDate: new Date('2025-03-05'), mobileNumber: '09171112222', email: 'mike@example.com' },
    { buildingNo: '304', unitNo: '104', ownerName: 'Sara Lee', moveInDate: new Date('2025-04-10'), mobileNumber: '09173334444', email: 'sara@example.com' }
  ];

  buildingList: string[] = ['A','B','C'];
  unitList: string[] = ['101','102','201','202'];

  selectedBuilding: string = '';
  selectedUnit: string = '';

  addTenant() {
    alert('Add new tenant logic goes here');
  }

  updateTenant(tenant: Tenant) {
    alert('Update tenant: ' + tenant.ownerName);
  }
}
