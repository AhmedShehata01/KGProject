// User management related DTOs for Angular frontend

export interface ApplicationUserDTO {
  id: string;
  userName: string;
  email: string;
  phoneNumber: string;
  isAgree: boolean;
  createdOn: string; // ISO string
}

export interface CreateApplicationUserDTO {
  userName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface UpdateApplicationUserDTO {
  id: string;
  userName: string;
  phoneNumber: string;
  isAgree: boolean;
}

export interface CreateUserByAdminDTO {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  roles: string[];
  redirectUrlAfterResetPassword: string;
}

export interface ClaimDTO {
  type: string;
  value: string;
}
