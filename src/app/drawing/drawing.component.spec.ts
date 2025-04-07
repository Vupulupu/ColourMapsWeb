import { TestBed } from '@angular/core/testing';
import { DrawingComponent } from './drawing.component';

describe('AppComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [DrawingComponent],
		}).compileComponents();
	});

	it('should render placeholder header2', () => {
		const fixture = TestBed.createComponent(DrawingComponent);
		fixture.detectChanges();
		const compiled = fixture.nativeElement as HTMLElement;
		expect(compiled.querySelector('h2')?.textContent).toContain('Drawing Workspace');
	});
});
