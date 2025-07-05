// ActivityLogDTO interfaces
export interface ActivityLogDTO {
  id: number;
  entityName: string;
  entityId: string;
  actionType: string; // Enum as string
  oldValues?: string;
  newValues?: string;
  systemComment?: string;
  userComment?: string;
  performedByUserId: string;
  performedByUserName: string;
  performedAt: string; // ISO date
}

export interface ActivityLogViewDTO {
  actionType: string;
  userComment?: string;
  performedByUserName: string;
  performedAt: string; // ISO date
}

export interface ActivityLogCreateDTO {
  entityName: string;
  entityId: string;
  actionType: string; // Enum as string
  oldValues?: string;
  newValues?: string;
  systemComment?: string;
  userComment?: string;
  performedByUserId: string;
  performedByUserName: string;
}
