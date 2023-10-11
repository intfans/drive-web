export interface loginResponse {
    hasKeys: boolean;
    sKey: string;
    tfa: null | any; // You can replace `any` with a more specific type if needed
  }