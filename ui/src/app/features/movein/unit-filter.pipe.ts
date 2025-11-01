import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'unitFilter', standalone: true })
export class UnitFilterPipe implements PipeTransform {
  transform(units: any[], search: string): any[] {
    if (!search) return units;
    const term = search.toLowerCase();
    return units.filter(u =>
      (u.UnitNumber || '').toLowerCase().includes(term)
    );
  }
}
