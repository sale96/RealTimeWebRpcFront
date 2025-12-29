import { Injectable } from "@angular/core";
import { SignalRService } from "./signal-r.service";


@Injectable({
    providedIn: 'root',
})
export class WebRtcService {
    private peerConnections: Map<string,RTCPeerConnection> = new Map();
    private localStream: MediaStream | null = null;
    private callbackOnIceCandidate!: (peerId: string, candidate: RTCIceCandidate) => void;
    private callbackOnTrack!: (peerId: string, stream: MediaStream) => void;

    constructor(private signalRService: SignalRService) {
    }

    async createPeerConnection(peerId: string) {
        if (this.peerConnections.has(peerId)) {
            return this.peerConnections.get(peerId)!;
        }

        const configuration = { 
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'turn:localhost:3478', credential: 'test', username: 'test' }
            ],
        };
        const peerConnection = new RTCPeerConnection(configuration);

        peerConnection.onicecandidate = e => {
            if (e.candidate && this.callbackOnIceCandidate) {
                this.callbackOnIceCandidate(peerId, e.candidate);
            }
        };

        peerConnection.ontrack = e => {
            if (this.callbackOnTrack) {
                this.callbackOnTrack(peerId, e.streams[0]);
            }
        };

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, this.localStream!);
            });
        }

        this.peerConnections.set(peerId, peerConnection);
        return peerConnection;
    }

    setCallbackOnIceCandidate(callback: (peerId: string, candidate: RTCIceCandidate) => void): void {
        this.callbackOnIceCandidate = callback;
    }

    setCallbackOnTrack(callback: (peerId: string, stream: MediaStream) => void) {
        this.callbackOnTrack = callback;
    }

    async getLocalStream(): Promise<MediaStream> {
        if (this.localStream) {
            return Promise.resolve(this.localStream);
        }

        return await navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then(stream => {
                this.localStream = stream;
                return stream;
            });
    }

    async startCall(meetingId: string) {
        try {
            if (!this.localStream) {
                this.localStream = await navigator.mediaDevices
                    .getUserMedia({ video: true, audio: true });
            }
        }
        catch(error) {
            console.error(`Error starting call: ${error}`);
            throw error;
        }
    }

    async createOfferForPeer(peerId: string) {
        const peerConnection = await this.createPeerConnection(peerId);
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        this.signalRService.sendOffer(peerId, JSON.stringify(offer));
    }

    async receiveOffer(from: string, sdp: string) {
        var peerConnection = await this.createPeerConnection(from);

        await peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp }));

        const stbObj = typeof sdp === 'string' ? JSON.parse(sdp) : sdp;

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        this.signalRService.sendAnswer(from, JSON.stringify(answer));
    }

    async receiveAnswer(from: string, sdp: string) {
        const peerConnection = await this.createPeerConnection(from);

        if (!peerConnection) {
            console.error(`Peer connection not found for ${from}`);
            return;
        }

        await peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp }));
    }

    async addIce(from: string, candidate: string) {
        const peerConnection = await this.peerConnections.get(from);

        if (!peerConnection) {
            console.error(`Peer connection not found for ${from}`);
            return;
        }

        await peerConnection.addIceCandidate(JSON.parse(candidate));
    }

    removePeer(peerId: string) {
        const peerConnection = this.peerConnections.get(peerId);
        if (peerConnection) {
            peerConnection.close();
            this.peerConnections.delete(peerId);
        }
    }

    async cleanup() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        this.peerConnections.forEach(peerConnection => peerConnection.close());
    }
}