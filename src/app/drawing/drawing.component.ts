import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RxFor } from '@rx-angular/template/for';

@Component({
  selector: 'app-drawing',
  standalone: true,
  imports: [CommonModule, FormsModule, RxFor],
  templateUrl: './drawing.component.html',
  styleUrls: ['./drawing.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawingComponent {
  //form the values
  rows: number | null;
  columns: number | null;
  colors: number | null;

  //for error messages
  rowsError: string;
  columnsError: string;
  colorsError: string;
  isFormValid: boolean;
  isTableGenerated: boolean;

  //table data i got help with this online
  columnLabels: string[];
  rowNumbers: number[];
  availableColors: string[] = [
    'red', 'orange', 'yellow', 'green', 'blue',
    'purple', 'grey', 'brown', 'black', 'teal'
  ];

  availableColorObjects = [
    { name: 'red', hex: '#FF0000' },
    { name: 'orange', hex: '#FFA500' },
    { name: 'yellow', hex: '#FFFF00' },
    { name: 'green', hex: '#008000' },
    { name: 'teal', hex: '#008080' },
    { name: 'blue', hex: '#0000FF' },
    { name: 'purple', hex: '#800080' },
    { name: 'brown', hex: '#A52A2A' },
    { name: 'grey', hex: '#808080' },
    { name: 'black', hex: '#000000' },
  ];
  
  selectedColors: string[] = [];
  //unbound selectedColors for fetching color before new selection
  previousSelectedColors: string[] = [];
  selectedRadioIndex: number = 0;

  activeColorIndex: number = 0;
  cellColors: string[][] = [];
  colorCoordinates: { [color: string]: string[] } = {};

  constructor() {
    this.rows = null;
    this.columns = null;
    this.colors = null;
    this.rowsError = '';
    this.columnsError = '';
    this.colorsError = '';
    this.isFormValid = false;
    this.isTableGenerated = false;
    this.columnLabels = [];
    this.rowNumbers = [];
  }
  
  // Method to get hex code for a color name
  getHexForColor(colorName: string): string {
    const colorObj = this.availableColorObjects.find(c => c.name === colorName);
    return colorObj ? colorObj.hex : '';
  }
  
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
      this.colorCoordinates = {};
      for (let i = 0; i < this.colors; i++) {
        const color = this.availableColors[i % this.availableColors.length];
        this.selectedColors.push(color);
        this.previousSelectedColors.push(color);
        this.colorCoordinates[color] = [];
      }

      //first radio button as selected
      this.selectedRadioIndex = 0;
      // Excel-style column headers (A, B, ..., Z, AA, ...) this was hard got help online
      this.generateColumnLabels();
      this.rowNumbers = Array.from({ length: this.rows }, (_, i) => i + 1);
      this.cellColors = Array.from({ length: this.rows! }, () => Array(this.columns!).fill(''));
      this.isTableGenerated = true;
    }
  }

  trackRow(index: number, item: any): string {
    return `row-${index}`;
  }

  trackCol(index: number, item: any): string {
    return `col-${index}`;
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
    this.activeColorIndex = index;
    this.selectedRadioIndex = index;
  }
  // Handle color selection change
  onColorChange(index: number, newColor: string): void {
    const oldColor = this.previousSelectedColors[index];

    this.cellColors.forEach((row, rIndex) => {
      row.forEach((cellColor, cIndex) => {
        if (cellColor === oldColor) {
          this.cellColors[rIndex][cIndex] = newColor;
          const cellElement = document.querySelectorAll('.paintable-cell')[rIndex * this.columns! + cIndex] as HTMLElement;
          if (cellElement) {
            cellElement.style.backgroundColor = newColor;
          }
        }
      });
    });

    this.colorCoordinates[newColor] = this.colorCoordinates[oldColor] ?? [];
    delete this.colorCoordinates[oldColor];
  
    this.selectedColors[index] = newColor;
    this.previousSelectedColors[index] = newColor;
    this.updateColorDisplayCells();
  }
  
  //handle cell click
  onCellClick(rowIndex: number, colIndex: number): void {
    const activeColor = this.selectedColors[this.activeColorIndex];
    const prevColor = this.cellColors[rowIndex][colIndex];
    const coordinate = `${this.columnLabels[colIndex]}${rowIndex + 1}`;
  
    if (prevColor) {
      const index = this.colorCoordinates[prevColor].indexOf(coordinate);
      if (index > -1) {
        this.colorCoordinates[prevColor].splice(index, 1);
      }
    }
    this.cellColors[rowIndex][colIndex] = activeColor;
    if (!this.colorCoordinates[activeColor].includes(coordinate)) {
      this.colorCoordinates[activeColor].push(coordinate);
      this.colorCoordinates[activeColor].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    }
  
    this.updateColorDisplayCells();
  }

  updateColorDisplayCells(): void {
    const displayCells = [... document.querySelectorAll('.color-coords-cell')] as HTMLElement[];
    this.selectedColors.forEach((color, index) => {
      displayCells[index].textContent = this.colorCoordinates[color].join(', ');
    });
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
    this.selectedColors = [];
    this.previousSelectedColors = [];
  }
}