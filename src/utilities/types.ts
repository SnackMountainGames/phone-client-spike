export interface ServerMessage {
    type: string;
    roomCode?: string;
    room?: any[];
    players?: Player[];
    text?: string;
    from?: string;
}

export interface Player {
    connectionId: string;
    name: string;
}