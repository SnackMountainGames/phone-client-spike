export interface ServerMessage {
    type: string;
    roomCode?: string;
    room?: any[];
    players?: Player[];
    text?: string;
    from?: string;
    mimeType?: string;
    data?: string;
}

export interface Player {
    connectionId: string;
    name: string;
}