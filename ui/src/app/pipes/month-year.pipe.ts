import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monthYear',
  standalone: true
})
export class MonthYearPipe implements PipeTransform {

  private months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  transform(value: string | number): string {
    if (!value && value !== 0) return '';

    if (typeof value === 'number' || /^[0-9]{1,2}$/.test(value.toString())) {
      const m = Number(value);
      return (m >= 1 && m <= 12) ? this.months[m - 1] : '';
    }

    const parts = value.toString().split('-');

    if (parts.length === 2) {
      const [year, month] = parts;
      const m = parseInt(month, 10);
      return `${this.months[m - 1]}-${year.slice(-2)}`;
    }

    if (parts.length === 3) {
      const [year, month, day] = parts;
      const m = parseInt(month, 10);
      const d = day.padStart(2, '0');
      const y = year.slice(-2);
      return `${this.months[m - 1]}, ${d}, ${y}`;
    }

    return value.toString();
  }

}
