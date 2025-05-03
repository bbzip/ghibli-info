import { useTranslation } from 'next-i18next';
import { useState, useEffect } from 'react';
import { addCredits, getTotalRemainingGenerations } from '../utils/quota';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/router';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreditsUpdated?: () => void; // 新增回调函数用于通知父组件更新配额显示
}

interface PricePlan {
  id: string;
  name: string;
  price: string;
  credits: number;
  description: string;
  stripePriceId: string; // Stripe Price ID for each plan
}

// Load stripe outside of component render cycle
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// 用于防止重复处理同一个会话ID
const processedSessions = new Set<string>();

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onCreditsUpdated }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>('basic');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [updatedCredits, setUpdatedCredits] = useState(0);

  // Check for returning Stripe session
  useEffect(() => {
    // Check if we have a payment success from Stripe redirect
    if (typeof window !== 'undefined') {
      const query = new URLSearchParams(window.location.search);
      const sessionId = query.get('session_id');
      const cancelled = query.get('cancelled');
      
      // 处理取消支付的情况
      if (cancelled === 'true') {
        setIsPurchasing(false);
        // 清除URL中的cancelled参数
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      
      if (sessionId && !processedSessions.has(sessionId) && !isProcessingPayment) {
        setIsProcessingPayment(true);
        setIsPurchasing(true);
        processedSessions.add(sessionId);
        
        // Verify payment with server
        fetch('/api/stripe/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              // Add credits to user account
              const newTotal = addCredits(data.credits);
              setUpdatedCredits(newTotal);
              setPurchaseComplete(true);
              setIsPurchasing(false);
              
              // 通知父组件更新配额显示
              if (onCreditsUpdated) {
                onCreditsUpdated();
              }
              
              // Clean the URL to remove the session_id parameter
              window.history.replaceState({}, document.title, window.location.pathname);
            } else {
              setIsPurchasing(false);
              console.log('Payment verification failed:', data.error);
              // 避免弹出警告框，以免打扰用户体验
              // alert('Payment verification failed. Please contact support.');
            }
            setIsProcessingPayment(false);
          })
          .catch(error => {
            console.error('Payment verification error:', error);
            setIsPurchasing(false);
            setIsProcessingPayment(false);
            // 避免弹出警告框，以免打扰用户体验
            // alert('An error occurred during payment verification. Please contact support.');
          });
      }
      
      // 处理从Stripe页面回退的情况
      window.addEventListener('popstate', function(event) {
        // 重置购买状态，防止回退时出现错误
        setIsPurchasing(false);
      });
      
      return () => {
        window.removeEventListener('popstate', function(event) {
          setIsPurchasing(false);
        });
      };
    }
  }, [isProcessingPayment, onCreditsUpdated]);

  if (!isOpen) {
    return null;
  }

  const pricePlans: PricePlan[] = [
    {
      id: 'basic',
      name: t('subscription.basic_plan'),
      price: '$5.00',
      credits: 4,
      description: t('subscription.basic_description'),
      stripePriceId: 'price_1RK0Pv07pXrOGn2pBX2MuGPy' // Replace with your actual basic price ID
    },
    {
      id: 'standard',
      name: t('subscription.standard_plan'),
      price: '$10.00',
      credits: 10,
      description: t('subscription.standard_description'),
      stripePriceId: 'price_1RK0Qn07pXrOGn2poAZE4Omv' // Replace with your actual standard price ID
    },
    {
      id: 'premium',
      name: t('subscription.premium_plan'),
      price: '$20.00',
      credits: 25,
      description: t('subscription.premium_description'),
      stripePriceId: 'price_1RK0Qn07pXrOGn2pNYqnMD8y' // Replace with your actual premium price ID
    }
  ];

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    
    const selectedPlanObj = pricePlans.find(plan => plan.id === selectedPlan);
    
    if (!selectedPlanObj || !selectedPlanObj.stripePriceId) {
      alert('Invalid plan selected');
      setIsPurchasing(false);
      return;
    }
    
    try {
      // Create a Checkout Session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: selectedPlanObj.stripePriceId,
          planId: selectedPlanObj.id,
          credits: selectedPlanObj.credits
        }),
      });
      
      const session = await response.json();
      
      if (session.error) {
        console.error('Error creating checkout session:', session.error);
        alert('Something went wrong with the payment. Please try again.');
        setIsPurchasing(false);
        return;
      }
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe!.redirectToCheckout({
        sessionId: session.id
      });
      
      if (error) {
        console.error('Stripe redirect error:', error);
        alert('Payment failed to initialize. Please try again.');
        setIsPurchasing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('An error occurred during payment. Please try again.');
      setIsPurchasing(false);
    }
  };

  const handleCloseAfterPurchase = () => {
    setPurchaseComplete(false);
    onClose();
    
    // 刷新页面以确保所有组件都获取最新的配额信息
    router.reload();
  };

  // 支付成功后的界面
  if (purchaseComplete) {
    const selectedPlanObj = pricePlans.find(plan => plan.id === selectedPlan);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fadeIn">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif text-ghibli-brown">{t('subscription.purchase_success')}</h2>
            <p className="text-ghibli-gray mt-2">
              {t('subscription.credits_added', { count: updatedCredits })}
            </p>
          </div>
          
          <button
            onClick={handleCloseAfterPurchase}
            className="w-full py-3 bg-[#f58f3a] hover:bg-[#f5a254] text-white rounded-full font-medium shadow-md transition"
          >
            {t('subscription.continue_creating')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fadeIn">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-serif text-ghibli-brown">{t('subscription.title')}</h2>
          <p className="text-ghibli-gray mt-2">{t('subscription.description')}</p>
        </div>

        <div className="space-y-4 mb-6">
          {pricePlans.map((plan) => (
            <div 
              key={plan.id}
              className={`border rounded-xl p-4 cursor-pointer transition-all ${
                selectedPlan === plan.id 
                  ? 'border-ghibli-blue bg-blue-50' 
                  : 'border-gray-200 hover:border-ghibli-blue'
              }`}
              onClick={() => handlePlanSelection(plan.id)}
            >
              <div className="flex items-center">
                <div className={`h-5 w-5 rounded-full border flex-shrink-0 flex items-center justify-center ${
                  selectedPlan === plan.id ? 'border-ghibli-blue' : 'border-gray-300'
                }`}>
                  {selectedPlan === plan.id && (
                    <div className="h-3 w-3 rounded-full bg-ghibli-blue"></div>
                  )}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h3 className="font-medium truncate">{plan.name}</h3>
                    <span className="font-medium text-ghibli-brown ml-2 flex-shrink-0">{plan.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 break-words">{plan.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={handlePurchase}
            className="w-full py-3 bg-[#f58f3a] hover:bg-[#f5a254] text-white rounded-full font-medium shadow-md transition"
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('subscription.processing')}
              </span>
            ) : (
              t('subscription.button_buy')
            )}
          </button>
          
          <button
            onClick={onClose}
            className="text-ghibli-gray hover:text-ghibli-blue transition-colors text-sm"
            disabled={isPurchasing}
          >
            {t('locale') === 'zh' ? '暂不需要，返回' : 'Not now, go back'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal; 