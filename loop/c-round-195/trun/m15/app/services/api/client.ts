const API_BASE_URL =
  typeof window !== 'undefined'
    ? import.meta.env.VITE_API_URL || 'http://localhost:5199'
    : process.env.API_URL || 'http://localhost:5199';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'Please sign in to continue.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested item was not found.',
  408: 'Request timed out. Please try again.',
  409: 'This action conflicts with existing data.',
  422: 'Unable to process your request. Please check your input.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our end. Please try again later.',
  502: 'Service temporarily unavailable. Please try again later.',
  503: 'Service is currently unavailable. Please try again later.',
  504: 'Request timed out. Please try again later.',
};

function getHttpErrorMessage(status: number): string {
  return HTTP_ERROR_MESSAGES[status] || `An unexpected error occurred (code: ${status}).`;
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface VariantAudioMetadata {
  audioFormat: string | null;
  sampleRateHz: number | null;
  bitDepth: number | null;
  audioFileCount: number | null;
  downloadSizeBytes: number | null;
  includesStems: boolean | null;
}

export interface ProductVariant {
  audioMetadata?: VariantAudioMetadata | null;
  id: number;
  productId: number;
  name: string;
  price: number;
  sku?: string;
  fileUrl?: string;
  position: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Product {
  id: number;
  title: string;
  description?: string;
  standardPrice?: number;
  premiumPrice?: number;
  minPrice?: number;
  category: string;
  handle: string;
  imageUrl?: string;
  audioPreviewUrl?: string;
  standardFileUrl?: string;
  premiumFileUrl?: string;
  genre?: string;
  bpm?: number;
  key?: string;
  duration?: number;
  formattedDuration?: string;
  vendor?: string;
  featuredArtist?: string;
  assetType?: string;
  tags?: string;
  isNew: boolean;
  isPremium: boolean;
  isActive: boolean;
  createdAt: string;
  variants?: ProductVariant[];
}

export interface ProductFilterParams {
  category?: string;
  search?: string;
  genre?: string;
  minPrice?: number;
  maxPrice?: number;
  minBpm?: number;
  maxBpm?: number;
  isNew?: boolean;
  isPremium?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SocialLoginRequest {
  idToken: string;
}

export interface AuthResponse {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: string;
  isNewUser?: boolean;
}

export interface UserProfile {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  authProvider?: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface CartItem {
  id: number;
  productId: number;
  productVariantId?: number;
  productTitle: string;
  productHandle: string;
  productImageUrl?: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface AppliedDiscountInfo {
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
}

export interface AppliedGiftCardInfo {
  code: string;
  maskedCode: string;
  balance: number;
  amountToUse: number;
}

export interface Cart {
  id: number | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  giftCardAmount: number;
  total: number;
  appliedCoupon?: AppliedDiscountInfo;
  appliedGiftCard?: AppliedGiftCardInfo;
}

export interface AddCartItemRequest {
  productId: number;
  productVariantId?: number;
  quantity: number;
}

export interface CheckoutResponse {
  id: number;
  orderNumber: string;
  total: number;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  sessionUrl: string;
  publishableKey: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productVariantId?: number;
  productTitle: string;
  variantName?: string;
  licenseType: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  paymentTransactionId?: string;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  customerEmail?: string;
  customerNote?: string;
  createdAt: string;
  paidAt?: string;
  items: OrderItem[];
}

export interface DownloadableProduct {
  standardUpgradeCredit?: number | null;
  isAvailable: boolean;
  productId: number;
  productTitle: string;
  handle: string;
  imageUrl?: string;
  category: string;
  licenseType: string;
  purchasedAt: string;
  orderNumber: string;
}

export interface UserDownloadsResponse {
  products: DownloadableProduct[];
}

export interface ProductRecording {
  id: number;
  title: string;
  description?: string | null;
  durationMs: number;
  sampleRateHz: number;
  bitDepth: number;
  channels: number;
  position: number;
}

export interface ProductRecordingCatalog {
  productId: number;
  productTitle: string;
  licenseType: string;
  tags?: string | null;
  recordings: ProductRecording[];
}

export interface DownloadLinkResponse {
  productId: number;
  productTitle: string;
  downloadUrl: string;
  expiresAt: string;
  expiresInMinutes: number;
}

export interface ChatMessageResponse {
  id: number;
  sessionId: number;
  senderType: string;
  senderId?: number;
  senderName?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatSessionResponse {
  id: number;
  userId?: number;
  guestName?: string;
  guestEmail?: string;
  pageUrl?: string;
  status: string;
  createdAt: string;
  closedAt?: string;
  updatedAt?: string;
  displayName: string;
  displayEmail: string;
  unreadCount: number;
  lastMessage?: ChatMessageResponse;
  messages: ChatMessageResponse[];
}

export interface CreateChatSessionRequest {
  guestName?: string;
  guestEmail?: string;
  pageUrl?: string;
}

class ApiClient {
  private baseUrl: string;
  private accessToken?: string;
  private refreshPromise: Promise<AuthResponse> | null = null;
  private onTokenRefreshed?: (response: AuthResponse) => void;
  private onSessionExpired?: () => void;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  setAccessToken(token: string | undefined) {
    this.accessToken = token;
  }

  setTokenRefreshCallback(callback: (response: AuthResponse) => void) {
    this.onTokenRefreshed = callback;
  }

  setSessionExpiredCallback(callback: () => void) {
    this.onSessionExpired = callback;
  }

  private getStoredRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('auth_user');
      if (stored) {
        const user = JSON.parse(stored);
        return user.refreshToken || null;
      }
    } catch {
      // ignore
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    skipAuthRefresh = false,
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>).Authorization = `Bearer ${this.accessToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    // Handle 401 - try to refresh token
    if (response.status === 401 && !skipAuthRefresh) {
      const refreshToken = this.getStoredRefreshToken();

      if (refreshToken) {
        try {
          // Use subscriber pattern - only one refresh at a time
          if (!this.refreshPromise) {
            this.refreshPromise = this.refreshTokenInternal(refreshToken);
          }

          const authResponse = await this.refreshPromise;
          this.refreshPromise = null;

          // Update token and notify
          this.accessToken = authResponse.accessToken;
          if (this.onTokenRefreshed) {
            this.onTokenRefreshed(authResponse);
          }

          // Retry original request with new token
          (headers as Record<string, string>).Authorization = `Bearer ${authResponse.accessToken}`;
          const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
          });

          if (!retryResponse.ok) {
            const error = await retryResponse.json().catch(() => ({}));
            throw new Error(
              error.detail || error.message || getHttpErrorMessage(retryResponse.status),
            );
          }

          const retryResult: ApiResponse<T> = await retryResponse.json();
          if (!retryResult.success) {
            throw new Error(retryResult.message || 'API request failed');
          }
          return retryResult.data;
        } catch (_refreshError) {
          this.refreshPromise = null;
          // Refresh failed - session expired
          if (this.onSessionExpired) {
            this.onSessionExpired();
          }
          throw new Error('Session expired. Please sign in again.');
        }
      } else {
        // No refresh token - session expired
        if (this.onSessionExpired) {
          this.onSessionExpired();
        }
        throw new Error('Please sign in to continue.');
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = error.detail || error.message || getHttpErrorMessage(response.status);
      throw new ApiError(errorMessage, response.status);
    }

    const result: ApiResponse<T> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'API request failed');
    }

    return result.data;
  }

  private async refreshTokenInternal(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const result: ApiResponse<AuthResponse> = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Token refresh failed');
    }

    return result.data;
  }

  async getProducts(params: ProductFilterParams = {}): Promise<PagedResult<Product>> {
    const queryParams = new URLSearchParams();

    if (params.category) queryParams.set('category', params.category);
    if (params.search) queryParams.set('search', params.search);
    if (params.genre) queryParams.set('genre', params.genre);
    if (params.minPrice != null) queryParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice != null) queryParams.set('maxPrice', params.maxPrice.toString());
    if (params.minBpm != null) queryParams.set('minBpm', params.minBpm.toString());
    if (params.maxBpm != null) queryParams.set('maxBpm', params.maxBpm.toString());
    if (params.isNew !== undefined) queryParams.set('isNew', params.isNew.toString());
    if (params.isPremium !== undefined) queryParams.set('isPremium', params.isPremium.toString());
    if (params.page != null) queryParams.set('page', params.page.toString());
    if (params.pageSize != null) queryParams.set('pageSize', params.pageSize.toString());
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortDesc !== undefined) queryParams.set('sortDesc', params.sortDesc.toString());

    const query = queryParams.toString();
    return this.request<PagedResult<Product>>(`/api/products${query ? `?${query}` : ''}`);
  }

  async getProductByHandle(handle: string): Promise<Product> {
    return this.request<Product>(`/api/products/handle/${handle}`);
  }

  async getProductById(id: number): Promise<Product> {
    return this.request<Product>(`/api/products/${id}`);
  }

  async searchProducts(query: string, page = 1, pageSize = 20): Promise<PagedResult<Product>> {
    return this.getProducts({ search: query, page, pageSize });
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async socialLogin(request: SocialLoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/social', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/api/auth/profile');
  }

  async updateProfile(request: {
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  }): Promise<UserProfile> {
    return this.request<UserProfile>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async forgotPassword(email: string): Promise<void> {
    await this.request<void>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.request<void>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async getCart(sessionId?: string): Promise<Cart> {
    const headers: HeadersInit = {};
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }
    return this.request<Cart>('/api/cart', { headers, credentials: 'include' });
  }

  async addToCart(request: AddCartItemRequest, sessionId?: string): Promise<Cart> {
    const headers: HeadersInit = {};
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }
    return this.request<Cart>('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify(request),
      headers,
      credentials: 'include',
    });
  }

  async updateCartItem(itemId: number, quantity: number, sessionId?: string): Promise<Cart> {
    const headers: HeadersInit = {};
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }
    return this.request<Cart>(`/api/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
      headers,
      credentials: 'include',
    });
  }

  async removeCartItem(itemId: number, sessionId?: string): Promise<Cart> {
    const headers: HeadersInit = {};
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }
    return this.request<Cart>(`/api/cart/items/${itemId}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });
  }

  async clearCart(sessionId?: string): Promise<void> {
    const headers: HeadersInit = {};
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }
    await this.request<void>('/api/cart', {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });
  }

  async checkout(customerNote?: string): Promise<CheckoutResponse> {
    return this.request<CheckoutResponse>('/api/cart/checkout', {
      method: 'POST',
      body: JSON.stringify({ customerNote }),
      credentials: 'include',
    });
  }

  async createCheckoutSession(orderId: number): Promise<CheckoutSessionResponse> {
    return this.request<CheckoutSessionResponse>('/api/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  }

  async getMyOrders(page = 1, pageSize = 10): Promise<PagedResult<Order>> {
    return this.request<PagedResult<Order>>(`/api/orders/my?page=${page}&pageSize=${pageSize}`);
  }

  async getOrderById(id: number): Promise<Order> {
    return this.request<Order>(`/api/orders/${id}`);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order> {
    return this.request<Order>(`/api/orders/number/${orderNumber}`);
  }

  async getMyDownloads(): Promise<UserDownloadsResponse> {
    return this.request<UserDownloadsResponse>('/api/downloads');
  }

  async getSfxLibrary(): Promise<ProductRecordingCatalog[]> {
    return this.request<ProductRecordingCatalog[]>('/api/sfx-library');
  }

  async getDownloadLink(productId: number): Promise<DownloadLinkResponse> {
    return this.request<DownloadLinkResponse>(`/api/downloads/${productId}`);
  }

  async getProductRecordingCatalog(productId: number): Promise<ProductRecordingCatalog> {
    return this.request<ProductRecordingCatalog>(`/api/products/${productId}/recordings`);
  }

  async applyCoupon(code: string, sessionId?: string): Promise<Cart> {
    const headers: HeadersInit = {};
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }
    return this.request<Cart>('/api/cart/coupon', {
      method: 'POST',
      body: JSON.stringify({ code }),
      headers,
      credentials: 'include',
    });
  }

  async removeCoupon(sessionId?: string): Promise<Cart> {
    const headers: HeadersInit = {};
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }
    return this.request<Cart>('/api/cart/coupon', {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });
  }

  async applyGiftCard(code: string, sessionId?: string): Promise<Cart> {
    const headers: HeadersInit = {};
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }
    return this.request<Cart>('/api/cart/gift-card', {
      method: 'POST',
      body: JSON.stringify({ code }),
      headers,
      credentials: 'include',
    });
  }

  async removeGiftCard(sessionId?: string): Promise<Cart> {
    const headers: HeadersInit = {};
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }
    return this.request<Cart>('/api/cart/gift-card', {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });
  }

  async createChatSession(request: CreateChatSessionRequest): Promise<ChatSessionResponse> {
    return this.request<ChatSessionResponse>('/api/chat/sessions', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getChatSession(sessionId: number): Promise<ChatSessionResponse> {
    return this.request<ChatSessionResponse>(`/api/chat/sessions/${sessionId}`);
  }

  async getActiveChatSession(): Promise<ChatSessionResponse | null> {
    return this.request<ChatSessionResponse | null>('/api/chat/sessions/active');
  }

  async sendChatMessage(sessionId: number, message: string): Promise<ChatMessageResponse> {
    return this.request<ChatMessageResponse>(`/api/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getChatMessages(sessionId: number): Promise<ChatMessageResponse[]> {
    return this.request<ChatMessageResponse[]>(`/api/chat/sessions/${sessionId}/messages`);
  }

  async markChatMessagesAsRead(sessionId: number): Promise<boolean> {
    return this.request<boolean>(`/api/chat/sessions/${sessionId}/read`, {
      method: 'PATCH',
    });
  }

  getSignalRHubUrl(): string {
    return `${this.baseUrl}/hubs/chat`;
  }

  getAccessToken(): string | undefined {
    return this.accessToken;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
