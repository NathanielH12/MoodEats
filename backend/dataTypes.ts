interface User {
    userId: number,
    nameFirst: string,
    nameLast: string,
    email: string,
    password: string,
}

interface Session {
    nameFirst: string,
    userId: number
}

interface Data {
    users: User[],
    // Record<string, Session> means: "an object where every key is a string (the UUID token) and every value is a Session.
    sessions: Record<string, Session>
}

export type {
    Data,
    User,
    Session
};