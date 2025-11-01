import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterReadingComponent } from './water-reading.component';

describe('WaterReadingComponent', () => {
  let component: WaterReadingComponent;
  let fixture: ComponentFixture<WaterReadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterReadingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaterReadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
