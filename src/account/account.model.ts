export enum Gender {
    M = "m",
    F = "f"
}

export enum OauthProvider {
    GOOGLE = "google",
    FACEBOOK = "facebook"
}

export enum TransmissionMedium {
    EMAIL = "email",
    SMS = "sms"
}

export interface Account {
    id: number,
    oauthId?: string,
    oauthProvider?: OauthProvider,
    firstName: string;
    lastName: string;
    gender?: Gender,
    email?: string;
    phoneNumber?: string;
    password?: string;
    enabled: boolean;
    confirmedAt?: boolean;
    confirmationToken?: string;
    confirmationTokenExpiresOn?: number;
    resetPasswordToken?: string;
    resetPasswordTokenExpiresOn?: number;
    createdAt: number;
    updatedAt: number;
}