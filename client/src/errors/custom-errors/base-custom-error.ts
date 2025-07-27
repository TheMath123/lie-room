import type {
  ErrorPriorityType,
  IAppError,
  IBaseCustomErrorObject,
  IBaseCustomErrorParams,
} from './base-custom-error-protocols';

export class BaseCustomError extends Error implements IAppError {
  private _description?: string;
  readonly id?: string;
  readonly statusCode?: string | number;
  readonly priority: ErrorPriorityType = 'low';
  readonly tag?: string;
  readonly url?: string;
  readonly data?: any;
  readonly method?: string;
  readonly instrumentation: boolean = false;

  constructor(params: IBaseCustomErrorParams) {
    super(params.message);
    this.id = params.id;
    this._description = params.description || undefined;
    this.statusCode = params.statusCode || undefined;
    this.name = params.name || 'BaseCustomError';
    this.tag = params.tag;
    this.priority = params.priority || 'low';
    this.url = params.url || '';
    this.data = params.data || null;
    this.method = params.method || '';
    this.instrumentation = params.instrumentation ?? false;
  }
  get message() {
    return super.message;
  }

  get description() {
    return this._description;
  }

  get object(): IBaseCustomErrorObject {
    return {
      id: this.id,
      message: this.message,
      description: (this._description ?? '').toString(),
      statusCode: this.statusCode,
      tag: this.tag,
      name: this.name,
      method: this.method,
      priority: this.priority,
      url: this.url,
      data: this.data,
      instrumentation: this.instrumentation,
    };
  }
}
