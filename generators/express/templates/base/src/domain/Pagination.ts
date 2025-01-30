export interface PaginationData<T> {
    filters: Partial<T> | null;
    range: [number, number] | null,
    sort: {
        field: keyof T,
        order: 'ASC' | 'DESC',
    } | null,
}
