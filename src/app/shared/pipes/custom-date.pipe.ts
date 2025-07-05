import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'customDate',
  standalone: true
})
export class CustomDatePipe implements PipeTransform {
  transform(value: any, format: string = 'dd/MM/yyyy hh:mm a', locale: string = 'en-US'): string {
    if (!value) return '';
    try {
      return formatDate(value, format, locale);
    } catch {
      return value;
    }
  }
}
