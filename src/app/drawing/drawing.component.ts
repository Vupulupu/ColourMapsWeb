
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-drawing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './drawing.component.html',
  styleUrls: ['./drawing.component.css']
})
export class DrawingComponent {
  //form the values
  rows: number | null = null;
  columns: number | null = null;
  colors: number | null = null;

  //fpr error messages
  rowsError: string = '';
  columnsError: string = '';
  colorsError: string = '';
  isFormValid: boolean = false;
  isTableGenerated: boolean = false;

  //table data i got help with this online
  columnLabels: string[] = [];
  rowNumbers: number[] = [];
  availableColors: string[] = [
    'red', 'orange', 'yellow', 'green', 'blue',
    'purple', 'grey', 'brown', 'black', 'teal'
  ];
  selectedColors: string[] = [];
  selectedRadioIndex: number = 0;

  //validate  inputs
  validateForm(): void {
    this.rowsError = '';
    this.columnsError = '';
    this.colorsError = '';
    this.isFormValid = true;
    //validate rows 
    if (this.rows === null || this.rows < 1 || this.rows > 1000) {
      this.rowsError = 'Rows must be between 1 and 1000';
      this.isFormValid = false;
    }
    //validate colm
    if (this.columns === null || this.columns < 1 || this.columns > 702) {
      this.columnsError = 'Columns must be between 1 and 702';
      this.isFormValid = false;
    }
    //and color 
    if (this.colors === null || this.colors < 1 || this.colors > 10) {
      this.colorsError = 'Colors must be between 1 and 10';
      this.isFormValid = false;
    }
  }
  //generate tables
  generateTables(): void {
    this.validateForm();
    
    if (this.isFormValid && this.rows !== null && this.columns !== null && this.colors !== null) {
      //color selection with default values
      this.selectedColors = [];
      for (let i = 0; i < this.colors; i++) {
        this.selectedColors.push(this.availableColors[i % this.availableColors.length]);
      }
      //first radio button as selected
      this.selectedRadioIndex = 0;
      // Excel-style column headers (A, B, ..., Z, AA, ...) this was ahrd got help online
      this.generateColumnLabels();
      this.rowNumbers = Array.from({ length: this.rows }, (_, i) => i + 1);
      this.isTableGenerated = true;
    }
  }

  //generate Excel-style column 
  generateColumnLabels(): void {
    if (!this.columns) return;
    
    this.columnLabels = [];
    for (let i = 0; i < this.columns; i++) {
      this.columnLabels.push(this.getColumnLabel(i));
    }
  }
  //convert index to Excel column label
  getColumnLabel(index: number): string {
    let label = '';
    
    if (index >= 26) {
      label += String.fromCharCode(65 + Math.floor(index / 26) - 1);
    }
    
    label += String.fromCharCode(65 + (index % 26));
    return label;
  }

  // Handle radio button selection
  selectRadio(index: number): void {
    this.selectedRadioIndex = index;
  }
  // Handle color selection change
  onColorChange(index: number, color: string): void {
    // Check if the color is already selected in another row
    const existingIndex = this.selectedColors.findIndex(
      (c, i) => c === color && i !== index
    );
    if (existingIndex !== -1) {
      //swap the colors
      const temp = this.selectedColors[index];
      this.selectedColors[index] = color;
      this.selectedColors[existingIndex] = temp;
    } else {
      this.selectedColors[index] = color;
    }
  }
  //handle cell click
  onCellClick(rowIndex: number, colIndex: number): void {
    alert(`${this.columnLabels[colIndex]}${rowIndex + 1}`);
  }
  //print
  printPage(): void {
    window.print();
  }
  //reset form to create a new sheet
  resetForm(): void {
    this.isTableGenerated = false;
    this.rows = null;
    this.columns = null;
    this.colors = null;
    this.rowsError = '';
    this.columnsError = '';
    this.colorsError = '';
  }
}