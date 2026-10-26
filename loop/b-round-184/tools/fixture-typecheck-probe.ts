import type { Product } from '/home/runner/czaba-project/store/app/services/api/client';
interface PagedResult<T> { items: T[]; totalCount: number; pageNumber: number; pageSize: number; }
interface ApiResponse<T> { data: T; success: boolean; message?: string; errors?: string[]; }
const ok: ApiResponse<PagedResult<Product>> = { success: true, data: { items: [{ id: 1, title: 't', category: 'Track', handle: 'h', isNew: false, isPremium: false, isActive: true, createdAt: '2026-01-01T00:00:00Z', catalogueNumber: 'CZ-1' }], totalCount: 1, pageNumber: 1, pageSize: 20 } };
export { ok };
