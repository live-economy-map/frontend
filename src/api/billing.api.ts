// src/api/billing.api.ts
import api from '@/lib/axios';
import type {
  Plan,
  Subscription,
  CheckoutDTO,
  CheckoutResponse,
  VerifyCheckoutResponse,
} from '@/types';

export const billingApi = {
  async getPlans(): Promise<Plan[]> {
    const response = await api.get<Plan[]>('/plans');
    return response.data;
  },

  async createCheckout(data: CheckoutDTO): Promise<CheckoutResponse> {
    const response = await api.post<CheckoutResponse>('/billing/checkout', data);
    return response.data;
  },

  async verifyCheckout(txRef: string): Promise<VerifyCheckoutResponse> {
    const response = await api.get<VerifyCheckoutResponse>(`/billing/verify/${txRef}`);
    return response.data;
  },

  async getMySubscription(): Promise<Subscription | null> {
    const response = await api.get<Subscription | null>('/me/subscription');
    return response.data;
  },
};
