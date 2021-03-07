import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestRxjsComponent } from './test-rxjs.component';

describe('TestRxjsComponent', () => {
  let component: TestRxjsComponent;
  let fixture: ComponentFixture<TestRxjsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestRxjsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestRxjsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
