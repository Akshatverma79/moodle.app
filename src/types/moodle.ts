export interface MoodleTokenResponse {
    token: string;
    privatetoken: string | null;
    error?: string;
}

export interface AssignmentEvent {
    id: number;
    name: string;
    description: string;
    course: {
        id: number;
        fullname: string;
        shortname: string;
    };
    timesort: number; // Unix timestamp for Due Date
    url: string;
    action: {
        name: string;
        itemcount: number;
        actionable: boolean;
    };
}

export interface MoodleEventsResponse {
    events: AssignmentEvent[];
}
