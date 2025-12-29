export type CreateMeetingRequest = {
    clientName: string;
    maxParticipants: number;
    startTime: Date;
    password?: string;
}

export type CreateMeetingResponse = {
    id: string;
    clientId: string;
}