import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
    providedIn: 'root',
})
export class SignalRService {
    private hubConnection: signalR.HubConnection;

    constructor() {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5256/meetingHub', {
                withCredentials: true,
            })
            .build();
    }

    sendIce(targetId: string, candidate: string) {
        this.hubConnection.invoke('SendIceCandidate', targetId, candidate)
            .catch(err => console.error(err.toString()));
    }

    onReceiveOffer(callback: (from: string, sdp: string) => void) {
        this.hubConnection.on('ReceiveOffer', callback);
    }

    onReceiveAnswer(callback: (from: string, sdp: string) => void) {
        this.hubConnection.on('ReceiveAnswer', callback);
    }

    onReceiveIceCandidate(callback: (from: string, candidate: string) => void) {
        this.hubConnection.on('ReceiveIceCandidate', callback);
    }

    sendOffer(targetId: string, offer: string) {
        this.hubConnection.invoke('SendOffer', targetId, offer)
            .catch(err => console.error(err.toString()));
    }

    sendAnswer(from: string, answer: string) {
        this.hubConnection.invoke('SendAnswer', from, answer)
            .catch(err => console.error(err.toString()));
    }

    async connect() {
        await this.hubConnection.start()
            .then(() => console.log('Connection started'))
            .catch(err => console.error(err.toString()));
    }

    isConnected() {
        return this.hubConnection.state === signalR.HubConnectionState.Connected;
    }

    onMessageReceived(callback: (message: string) => void) {
        this.hubConnection.on('ReceiveMessage', callback);
    }

    onJoinedMeeting(callback: (clientId: string) => void) {
        this.hubConnection.on('JoinedMeeting', callback);
    }

    onReceiveNumberOfParticipants(callback: (numberOfParticipants: number) => void) {
        this.hubConnection.on('ReceiveNumberOfParticipants', callback);
    }

    joinMeeting(meetingId: string, clientId: string) {
        if (!this.isConnected()) {
            console.error('Not connected to SignalR');
            return;
        }

        this.hubConnection.invoke('JoinMeeting', meetingId, clientId)
            .catch(err => console.error(err.toString()));
    }

    leaveMeeting(meetingId: string) {
        this.hubConnection.invoke('LeaveMeeting', meetingId)
            .catch(err => console.error(err.toString()));
    }

    sendMessage(meetingId: string, message: string) {
        this.hubConnection.invoke('SendMessage', meetingId, message)
            .catch(err => console.error(err.toString()));
    }

    getMeetingParticipants(meetingId: string) {
        this.hubConnection.invoke('GetMeetingParticipants', meetingId)
            .catch(err => console.error(err.toString()));
    }

    disconnect() {
        this.hubConnection.stop()
            .catch(err => console.error(err.toString()));
    }
}