export const USER_EVENTS = {
    CREATED: 'user.created',
    UPDATED: 'user.updated',
    DELETED: 'user.deleted',
}

export const AUTH_EVENTS= {
    LOGIN : 'auth.Login',
    LOGOUT: 'auth.logout',
    TOKEN_REFRESHED : 'auth.token.refreshed',
    TOKEN_REVOKED : 'auth.token.revoked',
    PASSWORD_CHANGED: 'auth.passwod.changed',
    EMAIL_VERIFIED: 'auth.email.verified',
    PASSWORD_RESET_REQUESTED: 'auth.password.reset.requested'
}

export const EMAIL_EVENTS = {
    WELCOME: "email.Welcome",
    PASSWORD_RESET: 'email.password.reset',
    VERIFY_EMAIL: 'email.verity'
}