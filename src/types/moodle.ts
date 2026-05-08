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

// --- Notes Feature Types ---

export interface MoodleCourseFile {
    filename: string;
    fileurl: string;
    filesize: number;
    mimetype: string;
    timemodified: number;
}

export interface MoodleCourseModule {
    id: number;
    name: string;
    modname: string;        // "resource", "folder", "url", "page", etc.
    description?: string;
    contents?: MoodleCourseFile[];
}

export interface MoodleCourseSection {
    id: number;
    name: string;
    summary: string;
    modules: MoodleCourseModule[];
}

export interface EnrolledCourse {
    id: number;
    fullname: string;
    shortname: string;
}

export interface MoodleSiteInfo {
    userid: number;
    username: string;
    fullname: string;
    sitename: string;
}
