export interface Paginator {
    page: number; // start: 1;
    limit: number;
    total?: number;
}

export interface ListResponse {
    total: number;
    paginator?: Paginator;
}

export interface OperationTimestampResponse {
    createdAt: Date;
    updatedAt: Date;
}