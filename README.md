# WebRTC Conference Application

A real-time video conferencing application built with Angular and WebRTC, using SignalR for signaling and peer-to-peer communication.

## Overview

This application enables multiple users to join video conferences with real-time audio/video streaming. The architecture uses WebRTC for peer-to-peer media streaming and SignalR for signaling (exchanging connection metadata between peers).

## Technologies

- **Angular 20** - Frontend framework
- **WebRTC** - Peer-to-peer video/audio communication
- **SignalR** - Real-time signaling server communication
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Styling framework

## Project Structure

```
src/app/
├── pages/
│   ├── home-page/          # Landing page with navigation
│   ├── create-meeting/     # Create a new meeting
│   ├── join-meeting/       # Join existing meeting by ID
│   └── meeting-page/       # Main conference room
├── services/
│   ├── web-rtc.service.ts  # WebRTC peer connection management
│   ├── signal-r.service.ts # SignalR hub communication
│   └── meeting.service.ts  # HTTP API for meeting creation
└── types/
    └── meetings.ts          # TypeScript interfaces
```

## How It Works

### Architecture Overview

The application uses a **hybrid signaling approach**:
- **SignalR Hub** (`meetingHub`) - Handles signaling messages (offers, answers, ICE candidates) and meeting management
- **WebRTC** - Direct peer-to-peer media streaming between clients
- **HTTP API** - Meeting creation and metadata

### WebRTC Communication Flow

#### 1. **Meeting Creation/Joining**

```
User → Create Meeting → HTTP POST /api/meeting/create
Server → Returns { meetingId, clientId }
Client → Stores IDs in localStorage → Navigates to /meeting
```

#### 2. **Connection Setup**

When a user enters the meeting page:

1. **SignalR Connection**: Establishes WebSocket connection to SignalR hub
   ```typescript
   signalRService.connect() → JoinMeeting(meetingId, clientId)
   ```

2. **Media Access**: Requests user's camera and microphone
   ```typescript
   navigator.mediaDevices.getUserMedia({ video: true, audio: true })
   ```

3. **Local Video Display**: Shows user's own video stream in `local-video` element

#### 3. **Peer Connection Establishment**

For each peer in the meeting, a separate `RTCPeerConnection` is created:

**Offer/Answer Exchange (SDP - Session Description Protocol):**

```
Peer A (Initiator):
1. Creates RTCPeerConnection
2. Adds local media tracks
3. Creates offer → setLocalDescription(offer)
4. Sends offer via SignalR → Peer B

Peer B (Receiver):
1. Receives offer via SignalR
2. Creates RTCPeerConnection for Peer A
3. setRemoteDescription(offer)
4. Creates answer → setLocalDescription(answer)
5. Sends answer via SignalR → Peer A

Peer A:
1. Receives answer
2. setRemoteDescription(answer)
3. Connection established!
```

**ICE Candidate Exchange:**

During the connection process, WebRTC discovers network paths using ICE (Interactive Connectivity Establishment):

```
Peer A:
1. onicecandidate event fires
2. Sends candidate via SignalR → Peer B

Peer B:
1. Receives candidate
2. addIceCandidate(candidate)
3. Repeats for Peer B → Peer A

This continues until optimal path is found (direct P2P or via TURN server)
```

#### 4. **Media Streaming**

Once connection is established:
- **Local tracks** are sent via `addTrack()` to peer connections
- **Remote tracks** are received via `ontrack` event
- Remote video is displayed in `remote-video` element

### Key Components

#### `WebRtcService`

Manages WebRTC peer connections:

- **`peerConnections: Map<string, RTCPeerConnection>`** - One connection per peer
- **`createPeerConnection(peerId)`** - Creates or retrieves peer connection
- **`startCall()`** - Initializes local media stream
- **`createOfferForPeer(peerId)`** - Initiates connection to a peer
- **`receiveOffer(from, sdp)`** - Handles incoming offer, creates answer
- **`receiveAnswer(from, sdp)`** - Handles incoming answer
- **`addIce(from, candidate)`** - Adds ICE candidate to peer connection
- **`cleanup()`** - Stops all tracks and closes connections

#### `SignalRService`

Handles real-time signaling:

- **Hub Connection** - Connects to `http://localhost:5256/meetingHub`
- **Methods**:
  - `sendOffer(targetId, offer)` - Send SDP offer
  - `sendAnswer(from, answer)` - Send SDP answer
  - `sendIce(targetId, candidate)` - Send ICE candidate
  - `joinMeeting(meetingId, clientId)` - Join meeting room
  - `sendMessage(meetingId, message)` - Send chat message
- **Events**:
  - `ReceiveOffer` - Incoming offer from peer
  - `ReceiveAnswer` - Incoming answer from peer
  - `ReceiveIceCandidate` - Incoming ICE candidate
  - `JoinedMeeting` - Confirmation of joining
  - `ReceiveNumberOfParticipants` - Participant count update
  - `ReceiveMessage` - Chat message received

#### `MeetingPage`

Main conference interface:

- **Left Panel (30%)**: Chat messages
- **Right Panel (70%)**: Video conference view
  - Local video (`local-video`)
  - Remote video (`remote-video`)
  - Participant count

**Lifecycle:**
1. `ngOnInit()` - Sets up SignalR callbacks, connects, joins meeting
2. After joining → Starts WebRTC call, displays local video
3. Handles incoming offers/answers/ICE candidates
4. `ngOnDestroy()` - Cleans up connections

### Signaling Flow Diagram

```
┌─────────┐                    ┌──────────┐                    ┌─────────┐
│ Peer A  │                    │ SignalR  │                    │ Peer B  │
│         │                    │  Server  │                    │         │
└────┬────┘                    └────┬─────┘                    └────┬────┘
     │                               │                               │
     │─── Connect ──────────────────>│                               │
     │                               │                               │
     │─── JoinMeeting ──────────────>│                               │
     │                               │                               │
     │<── JoinedMeeting ─────────────│                               │
     │                               │                               │
     │─── GetUserMedia ───────────────│                               │
     │                               │                               │
     │─── CreateOffer ───────────────>│─── ReceiveOffer ────────────>│
     │                               │                               │
     │                               │<── SendAnswer ────────────────│
     │<── ReceiveAnswer ─────────────│                               │
     │                               │                               │
     │─── SendIceCandidate ─────────>│─── ReceiveIceCandidate ─────>│
     │                               │                               │
     │<── ReceiveIceCandidate ───────│<── SendIceCandidate ──────────│
     │                               │                               │
     │═══════════════════════════════════════════════════════════════│
     │                    P2P Media Stream                          │
     │═══════════════════════════════════════════════════════════════│
```

## Setup & Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend SignalR server running on `http://localhost:5256`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Configuration

**SignalR Hub URL**: Edit `signal-r.service.ts`:
```typescript
.withUrl('http://localhost:5256/meetingHub', {
    withCredentials: true,
})
```

**API Base URL**: Edit `meeting.service.ts`:
```typescript
private readonly apiUrl = 'http://localhost:5256';
```

**STUN/TURN Servers**: Edit `web-rtc.service.ts`:
```typescript
iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'turn:localhost:3478', credential: 'test', username: 'test' }
]
```

## Usage

1. **Create Meeting**: Navigate to `/create-meeting`, fill form, create meeting
2. **Join Meeting**: Navigate to `/join-meeting`, enter meeting ID
3. **Conference**: Once in meeting, allow camera/microphone access
4. **Chat**: Send messages in the left panel
5. **Leave**: Close browser tab or navigate away (cleanup runs automatically)

## Features

- ✅ Real-time video/audio streaming
- ✅ Multiple participants support (one peer connection per participant)
- ✅ Chat messaging via SignalR
- ✅ Participant count tracking
- ✅ Automatic cleanup on disconnect
- ✅ Local and remote video display

## Important Notes

### Multi-Participant Architecture

The application supports multiple participants by:
- Maintaining a **Map of peer connections** (one per peer)
- Each peer connection is identified by `peerId` (clientId)
- Offers/answers/ICE candidates are routed to specific peers via SignalR

### Network Considerations

- **STUN Server**: Used for NAT traversal (finding public IP)
- **TURN Server**: Required for peers behind restrictive firewalls
- **Direct P2P**: Preferred when possible (lower latency, no server bandwidth)

### Browser Requirements

- Modern browser with WebRTC support (Chrome, Firefox, Edge, Safari)
- HTTPS required for production (or localhost for development)
- Camera and microphone permissions required

## Troubleshooting

**No video/audio:**
- Check browser permissions for camera/microphone
- Verify STUN/TURN server configuration
- Check browser console for errors

**Connection fails:**
- Ensure SignalR server is running
- Check network connectivity
- Verify meeting ID is correct

**ICE candidates not exchanging:**
- Check SignalR connection status
- Verify `sendIce()` is being called with correct `peerId`
- Check browser console for WebRTC errors
