export interface BiometricResultEventDetail {
  status: "success" | "failure";
  message?: string;
  biometric_token?: string;
}
