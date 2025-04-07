import { TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';

describe('AppComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HomeComponent],
		}).compileComponents();
	});

	it('should render placeholder header2', () => {
		const fixture = TestBed.createComponent(HomeComponent);
		fixture.detectChanges();
		const compiled = fixture.nativeElement as HTMLElement;
		expect(compiled.querySelector('h2')?.textContent).toContain('Home - Team 22');
	});
});
