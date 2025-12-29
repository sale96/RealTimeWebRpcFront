import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SignalRService } from '../../services/signal-r.service';
import { ActivatedRoute } from '@angular/router';
import { WebRtcService } from '../../services/web-rtc.service';

@Component({
  selector: 'app-meeting-page',
  imports: [],
  templateUrl: './meeting-page.html',
  styles: [
    `
    :host {
      display: block;
      width: 100%;
      height: 100vh;
    }
    `
  ]
})
export class MeetingPage implements OnInit {
  messages: string[] = [];
  meetingId: string | null = null;
  clientId: string | null = null;
  numberOfParticipants: number = 0;

  constructor(private signalRService: SignalRService, private route: ActivatedRoute, private webRtcService: WebRtcService) {
  }

  async ngAfterViewInit() {
  }

  ngOnInit() {
    this.meetingId = this.route.snapshot.queryParamMap.get('meetingId');

    if (!this.meetingId) {
      this.meetingId = localStorage.getItem('meetingId') ?? '';
    }

    this.clientId = localStorage.getItem('clientId') ?? '';

    this.signalRService.onMessageReceived((message: string) => {
      console.log(`Received message: ${message}`);
      this.messages.push(message);
    });

    this.signalRService.onJoinedMeeting((clientId: string) => {
      console.log(`Joined meeting: ${clientId}`);
      localStorage.setItem('clientId', clientId);
      this.clientId = clientId;

      this.webRtcService.startCall(this.meetingId ?? '').then(() => {
        console.log('Call started');
        this.webRtcService.getLocalStream().then((stream: MediaStream) => {
          const localVideo = document.getElementById('local-video') as HTMLVideoElement;
          localVideo.srcObject = stream;
          localVideo.play();
        });
      })
    });

    this.signalRService.onReceiveNumberOfParticipants((numberOfParticipants: number) => {
      console.log(`Number of participants: ${numberOfParticipants}`);
      this.numberOfParticipants = numberOfParticipants;
    });

    this.webRtcService.setCallbackOnIceCandidate((peerId: string, candidate: RTCIceCandidate) => {
      console.log(`ICE candidate from ${peerId}:`);
      console.table(candidate);
      this.signalRService.sendIce(peerId, JSON.stringify(candidate));
    });

    this.webRtcService.setCallbackOnTrack((peerId: string, stream: MediaStream) => {
      console.log(`Track from ${peerId}: ${stream}`);
      const remoteVideo = document.getElementById('remote-video') as HTMLVideoElement;
      remoteVideo.srcObject = stream;
      remoteVideo.play();
    });

    this.signalRService.onReceiveOffer((from: string, sdp: string) => {
      console.log(`Receive offer: ${from}, ${sdp}`);
      this.webRtcService.receiveOffer(from, sdp);
    });

    this.signalRService.onReceiveAnswer((from: string, sdp: string) => {
      console.log(`Receive answer: ${from}, ${sdp}`);
      this.webRtcService.receiveAnswer(from, sdp);
    });

    this.signalRService.onReceiveIceCandidate((from: string, candidate: string) => {
      console.log(`Receive ice candidate: ${from}, ${candidate}`);
      this.webRtcService.addIce(from, candidate);
    });

    this.signalRService.connect().then(() => {
      this.signalRService.joinMeeting(this.meetingId ?? '', this.clientId ?? '');
    });
  }

  startCall() {
    this.webRtcService.startCall(this.meetingId ?? '');
  }

  sendMessage(message: string) {
    this.signalRService.sendMessage(this.meetingId ?? '', message);
  }

  ngOnDestroy() {
    this.signalRService.disconnect();
    this.webRtcService.cleanup();
  }
}
