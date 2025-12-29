import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-join-meeting',
  imports: [ReactiveFormsModule],
  templateUrl: './join-meeting.html',
  styleUrl: './join-meeting.scss',
})
export class JoinMeeting implements OnInit {
  constructor(private router: Router) {}

  joinMeetingForm = new FormGroup({
    meetingId: new FormControl('', [Validators.required, Validators.pattern(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)]),
  });

  ngOnInit() {
    const meetingId = localStorage.getItem('meetingId');

    // redirect to meeting page if meetingId is in the query parameters
    if (meetingId) {
      this.router.navigate(['/meeting'], { queryParams: { meetingId } });
    }
  }

  joinMeeting() {
    if (this.joinMeetingForm.invalid) {
      alert('Please enter a valid meeting ID');
      return;
    }

    console.log(this.joinMeetingForm.value);
  }
}
