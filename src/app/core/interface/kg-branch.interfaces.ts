export interface KindergartenDTO {
  id: number;
  nameAr: string;
  nameEn: string;
  kgCode: string;
  address: string;
  branches: BranchDTO[];
}

export interface KindergartenCreateDTO {
  id: number;
  nameAr: string;
  nameEn: string;
  address: string;
  branches?: BranchCreateDTO[];
}

export interface KindergartenUpdateDTO {
  id: number;
  nameAr: string;
  nameEn: string;
  address: string;
  kgCode: string;
  branches: BranchUpdateDTO[];
}

export interface KindergartenFullDTO {
  id: number;
  nameAr: string;
  nameEn: string;
  kgCode: string;
  address: string;
  branches: BranchDTO[];
}

export interface BranchDTO {
  id: number;
  nameAr: string;
  nameEn: string;
  address: string;
  phone: string;
  email: string;
  branchCode?: string;
  kindergartenId: number;
}

export interface BranchCreateDTO {
  id: number;
  nameAr: string;
  nameEn: string;
  address: string;
  phone: string;
  email: string;
}

export interface BranchUpdateDTO {
  id: number;
  nameAr: string;
  nameEn: string;
  address: string;
  phone: string;
  email: string;
}

export interface KGBranchDTO {
  kg: KindergartenDTO;
  branches: BranchDTO[];
}
