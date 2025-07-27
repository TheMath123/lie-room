export type ErrorPriorityType = 'low' | 'medium' | 'high' | 'critical';

export interface IAppError {
  id?: string;
  name: string;
  message: string;
  description?: string | null;
  statusCode?: string | number | null;
  priority: ErrorPriorityType;
  tag?: string;
  url?: string;
  data?: any;
  method?: string;
  stack?: string;
  instrumentation: boolean;
}

export interface IBaseCustomErrorParams extends Partial<IAppError> {}
export interface IBaseCustomErrorObject extends Partial<IAppError> {}
