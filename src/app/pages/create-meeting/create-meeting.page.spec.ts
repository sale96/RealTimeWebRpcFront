import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMeetingPage } from './create-meeting.page';

describe('CreateMeetingPage', () => {
  let component: CreateMeetingPage;
  let fixture: ComponentFixture<CreateMeetingPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateMeetingPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateMeetingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
