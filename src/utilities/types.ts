export interface ServerMessage {
    type: string;
    roomCode?: string;
    room?: any[];
    players?: Player[];
}

export interface Player {
    connectionId: string;
    name: string;
}