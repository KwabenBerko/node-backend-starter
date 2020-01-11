
export namespace MessageUtil {

    //USER
    export const INVALID_REQUEST_DATA = "One or more data is missing in the request.";
    export const INVALID_FIRST_NAME = "Invalid first name.";
    export const INVALID_LAST_NAME = "Invalid last name.";
    export const INVALID_GENDER = "Invalid gender. Must be either 'm' or 'f'";
    export const INVALID_EMAIL_ADDRESS = "Invalid email address.";
    export const INVALID_PHONE_NUMBER = "Invalid phone number."
    export const INVALID_PASSWORD = "Password must be at least 6 characters.";
    export const PASSWORDS_DO_NOT_MATCH = "Passwords do not match.";
    export const USER_ALREADY_EXISTS = "An user with this email already exists."
    export const INVALID_CREDENTIALS = "Invalid credentials."
    export const INVALID_OAUTH_PROVIDER = "Invalid Oauth Provider. Must either be 'google' or 'facebook'";
    export const USER_NOT_FOUND = "User not found.";
    export const USER_DISABLED = "This account has been disabled. Kindly contact an Administrator.";
    export const USER_ALREADY_VERIFIED = "This user has already been verified.";
    export const USER_NOT_VERIFIED = `This account has not been verified. Please verify with the token that was sent to you, or request a new token.`
    export const INVALID_VERIFICATION_TOKEN = "The verification is invalid or has expired.";
    export const INVALID_RESET_PASSWORD_TOKEN = "The password reset token is invalid or has expired.";


    //ROLES AND PERMISSIONS
    export const ROLE_NOT_FOUND = "Role not found.";
    export const ROLE_IN_USE = "Role cannot be deleted as it's still in use by other accounts. Unassign this role from these accounts and try again.";
    export const INVALID_PERMISSIONS_LENGTH = "A role must have at least one permission.";
    export const PERMISSION_NOT_FOUND = "Permission not found.";
    export const PERMISSION_DENIED = "You do not have permission to perform this operation. Kindly contact an administrator.";
    export const ROLE_ALREADY_EXISTS = "An role with this name already exists.";

    //SMS UTIL
    export const INVALID_SMS_MESSAGE_LENGTH = "Sms messages must have between 3 and 161 characters";

    //FILE UTIL
    export const INVALID_FILE_NAME = "File name must have an extension";
    export const INVALID_FILE_SIZE = "File size must be at most 4MB";

    //MAILER UTIL
    export const UNSUPPORTED_MAIL_TYPE = "Mail type is not supported";
    export const VERIFY_ACCOUNT_TITLE = "Verify Account";
    export const VERIFY_ACCOUNT_MESSAGE = function(data: {
        firstName: string, 
        link: string
        companyName: string,
        expiresInFromNow: string,
    }): string {
		return (
			"Hello " +
			data.firstName +
			",\n\n" +
			"Thank you for signing up with " +
			data.companyName +
			". In order to complete your registration, please click the link below or paste into your browser:\n\n" +
			data.link +
			"\n\n" +
			"NB: Please note that your account will be removed if its not confirmed "+ data.expiresInFromNow +".\n"
		);
    }
    
    export const FORGOT_PASSWORD_TITLE = "Forgot Password";

}

