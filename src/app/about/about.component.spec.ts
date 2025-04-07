import { TestBed } from '@angular/core/testing';
import { AboutComponent } from './about.component';

describe('AppComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [AboutComponent],
		}).compileComponents();
	});

	it('should render placeholder header2', () => {
		const fixture = TestBed.createComponent(AboutComponent);
		fixture.detectChanges();
		const compiled = fixture.nativeElement as HTMLElement;
		expect(compiled.querySelector('h2')?.textContent).toContain('About Us');
	});
});
