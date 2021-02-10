export interface UserDto {
  userId: string; // public-key
  username: string;
  firstName: string;
  lastName: string;
  organization?: string;
  subscribedChannels: string[];
  registrationDate: string; // DD-MM-YYYY
  verification: VerificationDto;
}

export interface VerificationDto {
  verified: boolean;
  verificationIssuer?: string; // public-key
  verificationDate?: string; // DD-MM-YYYY
}

export interface User {
  userId: string; // public-key
  username: string;
  firstName: string;
  lastName: string;
  organization?: string;
  subscribedChannels: string[];
  verification?: Verification;
  registrationDate?: Date;
}

export interface Verification {
  verified: boolean;
  verificationIssuer?: string; // public-key
  verificationDate?: Date;
}
