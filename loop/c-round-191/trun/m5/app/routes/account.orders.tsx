import { Calendar, ChevronDown, ChevronUp, CreditCard, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { RequireAuth } from '~/components/auth';
import { useAuth } from '~/hooks';
import { apiClient, type Order } from '~/services/api/client';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

function formatPrice(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}

function getStatusBadge(status: string) {
  const statusMap: Record<string, { bg: string; text: string; label: string }> = {
    Paid: { bg: 'bg-brand/10', text: 'text-brand', label: 'Paid' },
    Pending: { bg: 'bg-accent/10', text: 'text-accent', label: 'Pending' },
    Failed: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Failed' },
    Refunded: { bg: 'bg-muted-bg', text: 'text-muted', label: 'Refunded' },
  };

  const style = statusMap[status] || { bg: 'bg-muted-bg', text: 'text-muted', label: status };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

interface OrderCardProps {
  order: Order;
}

function OrderCard({ order }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-elevated border border-outline rounded-lg overflow-hidden">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 md:p-6 cursor-pointer hover:bg-surface/50 transition-colors"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-brand" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-semibold text-foreground">
                  Order #{order.orderNumber}
                </h3>
                {getStatusBadge(order.paymentStatus)}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(order.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  {formatPrice(order.total, order.currency)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">
              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-outline">
          <div className="p-4 md:p-6 space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 bg-surface rounded-lg">
                <div className="w-16 h-16 bg-background rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <Package className="w-6 h-6 text-muted" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-foreground font-medium truncate">{item.productTitle}</h4>
                  {item.variantName && <p className="text-sm text-muted">{item.variantName}</p>}
                  <p className="text-xs text-muted">
                    {item.licenseType} License &middot; Qty: {item.quantity}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-foreground font-medium">
                    {formatPrice(item.unitPrice, order.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 md:px-6 pb-4 md:pb-6">
            <div className="flex justify-between items-center pt-4 border-t border-outline">
              <span className="text-muted font-medium">Total</span>
              <span className="text-xl font-bold text-foreground">
                {formatPrice(order.total, order.currency)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrders() {
      if (!user?.accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        apiClient.setAccessToken(user.accessToken);
        const result = await apiClient.getMyOrders(1, 50);
        if (cancelled) return;
        setOrders(result.items);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to fetch orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [user?.accessToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="skeleton-shimmer h-10 w-48 rounded mb-2" />
            <div className="skeleton-shimmer h-5 w-72 rounded" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-32 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto text-center py-16">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Orders</h1>
          <p className="text-muted">View your transaction history and order details</p>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-elevated rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-muted" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No orders yet</h3>
            <p className="text-muted mb-6">
              When you make a purchase, your orders will appear here.
            </p>
            <a
              href="/music"
              className="inline-block px-6 py-3 bg-brand text-foreground font-medium rounded-lg hover:bg-brand/90 transition-colors"
            >
              Browse Music
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <RequireAuth>
      <OrdersContent />
    </RequireAuth>
  );
}
