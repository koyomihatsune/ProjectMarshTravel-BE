export interface LoginDTO {
  token: string;
}

export interface LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  isNewAccount: boolean;
}
