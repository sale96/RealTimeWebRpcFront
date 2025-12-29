import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateMeetingResponse, CreateMeetingRequest } from '../types/meetings';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  private readonly apiUrl = 'http://localhost:5256';
  constructor(private http: HttpClient) {}

  createMeeting(request: CreateMeetingRequest): Observable<CreateMeetingResponse> {
    return this.http.post<CreateMeetingResponse>(`${this.apiUrl}/api/meeting/create`, request);
  }
}
