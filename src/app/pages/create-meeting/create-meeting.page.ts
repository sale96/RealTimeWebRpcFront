import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MeetingService } from '../../services/meeting.service';
import { Router, RouterLink } from '@angular/router';
import { CreateMeetingRequest } from '../../types/meetings';

@Component({
  selector: 'app-create-meeting.page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './create-meeting.page.html',
  styleUrl: './create-meeting.page.scss',
})
export class CreateMeetingPage {
  constructor(private meetingService: MeetingService, private router: Router) {}

  createMeetingForm = new FormGroup({
    clientName: new FormControl(''),
    maxParticipants: new FormControl(''),
    startTime: new FormControl(new Date()),
    password: new FormControl(''),
  });

  createMeeting() {
    if (this.createMeetingForm.invalid) {
      return;
    }

    console.log(this.createMeetingForm.value.startTime);
    const request: CreateMeetingRequest = {
      clientName: this.createMeetingForm.value.clientName ?? '',
      maxParticipants: parseInt(this.createMeetingForm.value.maxParticipants ?? '0') || 0,
      startTime: new Date(this.createMeetingForm.value.startTime ?? ''),
      password: this.createMeetingForm.value.password ?? '',
    };

    this.meetingService.createMeeting(request).subscribe({
      next: (response) => {
        console.log(response);
        localStorage.setItem('meetingId', response.id);
        localStorage.setItem('clientId', response.clientId);
        this.router.navigate(['/meeting', response.id]);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
