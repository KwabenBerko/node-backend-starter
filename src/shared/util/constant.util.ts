export const Permissions = {
    //Users
    READ_USERS: "READ_USERS",

    //Roles
    READ_ROLES: "READ_ROLES",
    ADD_ROLES: "ADD_ROLES",
    MODIFY_ROLES: "MODIFY_ROLES",
    DELETE_ROLES: "DELETE_ROLES",
    ASSIGN_ROLES_TO_USERS: "ASSIGN_ROLES_TO_USERS",
    UNASSIGN_ROLES_FROM_USERS: "UNASSIGN_ROLES_FROM_USERS"
}

export const Tables = {
    PERMISSIONS: "permissions",
    ROLES: "roles",
    ROLES_PERMISSIONS: "roles_permissions",
    USERS: "users",
    USERS_ROLES: "users_roles",
    VERIFICATION_TOKENS: "verification_tokens",
    RESET_PASSWORD_TOKENS: "reset_password_tokens"
}

export const MailTypes = {
    ACCOUNT_VERIFICATION: "ACCOUNT_VERIFICATION",
    FORGOT_PASSWORD: "FORGOT_PASSWORD",
}