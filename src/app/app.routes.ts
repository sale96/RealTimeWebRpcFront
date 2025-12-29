import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { MeetingPage } from './pages/meeting-page/meeting-page';
import { CreateMeetingPage } from './pages/create-meeting/create-meeting.page';
import { JoinMeeting } from './pages/join-meeting/join-meeting';

export const routes: Routes = [
  {
    path: '',
    component: HomePage
  },
  {
    path: 'meeting',
    component: MeetingPage,
    
  },
  {
    path: 'create-meeting',
    component: CreateMeetingPage
  },
  {
    path: 'join-meeting',
    component: JoinMeeting
  }
];
