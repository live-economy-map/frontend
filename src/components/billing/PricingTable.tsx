import { useQuery, useMutation } from '@tanstack/react-query';

import { billingApi } from '@/api/billing.api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatApiError } from '@/lib/axios';
import { Check, Sparkles, Shield, Zap, Building, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Plan, PlanTier } from '@/types';

interface PricingTableProps {
  onPlanSelected?: (plan: Plan) => void;
}

const DEFAULT_PLANS: Plan[] = [
  {
    id: 'plan_free',
    name: 'Free Explorer',
    tier: 'FREE',
    priceEtb: 0,
    billingInterval: 'monthly',
    features: [
      'Interactive Addis Ababa heatmap',
      'Recent composite activity scores',
      'Up to 3 bookmarked saved areas',
      'Public case study validations',
      'Standard community support',
    ],
  },
  {
    id: 'plan_pro',
    name: 'Analyst Pro',
    tier: 'PRO',
    priceEtb: 2500,
    billingInterval: 'monthly',
    features: [
      'Everything in Free, plus:',
      'Full historical CSV & JSON spatial data export',
      '10 custom spatial anomaly threshold alerts',
      'Priority turnaround on custom report requests',
      'Granular VIIRS, GHSL & RWI multi-signal breakdowns',
      'Detailed corridor sparkline trajectory analytics',
    ],
  },
  {
    id: 'plan_enterprise',
    name: 'Institutional Enterprise',
    tier: 'ENTERPRISE',
    priceEtb: 15000,
    billingInterval: 'monthly',
    features: [
      'Everything in Analyst Pro, plus:',
      '50 spatial anomaly alerts & multi-cell watchlists',
      'Developer API platform access (300 RPM limit)',
      'Multi-member institutional organization workspaces',
      'Dedicated spatial data engineer consultation',
      'Custom spatial resolution & priority satellite feeds',
    ],
  },
];

export default function PricingTable({ onPlanSelected }: PricingTableProps) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { toast } = useToast();
  const { data: remotePlans } = useQuery({
    queryKey: ['billing-plans'],
    queryFn: () => billingApi.getPlans(),
  });

  const { data: subscription } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: () => billingApi.getMySubscription(),
    enabled: isAuthenticated,
  });

  const checkoutMutation = useMutation({
    mutationFn: (planId: string) =>
      billingApi.createCheckout({
        planId,
        successUrl: `${window.location.origin}/billing/success`,
        cancelUrl: `${window.location.origin}/pricing`,
      }),
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.info('Redirecting to secure Chapa payment portal…');
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (err) => {
      toast.error(formatApiError(err), { title: 'Checkout Failed' });
    },
  });

  const plans = remotePlans && remotePlans.length > 0 ? remotePlans : DEFAULT_PLANS;

  const handleSelectPlan = (plan: Plan) => {
    if (onPlanSelected) {
      onPlanSelected(plan);
      return;
    }

    if (!isAuthenticated) {
      openAuthModal('register');
      return;
    }

    if (plan.tier === 'FREE') {
      toast.info('You are already on the Free tier.');
      return;
    }

    checkoutMutation.mutate(plan.id);
  };

  const currentTier: PlanTier = (subscription?.plan?.tier as PlanTier) || 'FREE';

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
          Transparent Spatial Intelligence Plans
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Flexible Pricing for Analysts, Developers & Institutions
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          From neighborhood exploration to institutional satellite surveillance and automated REST
          API pipelines. Local payment processed securely via Chapa.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => {
          const isPro = plan.tier === 'PRO';
          const isEnterprise = plan.tier === 'ENTERPRISE';
          const isCurrentPlan = currentTier === plan.tier;

          return (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-300 border bg-white dark:bg-gray-900 shadow-sm',
                isPro
                  ? 'border-blue-600 ring-4 ring-blue-100 dark:ring-blue-950 shadow-xl md:-translate-y-2'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300',
                isCurrentPlan && 'bg-blue-50/20'
              )}
            >
              {isPro && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[11px] uppercase tracking-wider rounded-full shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Most Popular for Analysts</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                  {isEnterprise ? (
                    <Building className="w-6 h-6 text-indigo-600" />
                  ) : isPro ? (
                    <Zap className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Shield className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                      {plan.priceEtb === 0 ? 'Free' : `${plan.priceEtb.toLocaleString()} ETB`}
                    </span>
                    {plan.priceEtb > 0 && (
                      <span className="text-xs text-gray-500 font-semibold">/ month</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {plan.tier === 'FREE'
                      ? 'No credit card required'
                      : 'Billed monthly via Chapa (Telebirr, CBE, Cards)'}
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    What's included:
                  </p>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300 leading-snug"
                      >
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={checkoutMutation.isPending || isCurrentPlan}
                  className={cn(
                    'w-full py-3 px-4 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer',
                    isCurrentPlan
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-default'
                      : isPro
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : isEnterprise
                          ? 'bg-gradient-to-r from-gray-900 to-indigo-950 text-white hover:opacity-90'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200'
                  )}
                >
                  {checkoutMutation.isPending && checkoutMutation.variables === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrentPlan ? (
                    'Current Active Plan'
                  ) : plan.tier === 'FREE' ? (
                    'Get Started Free'
                  ) : (
                    <>
                      <span>Upgrade to {plan.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
