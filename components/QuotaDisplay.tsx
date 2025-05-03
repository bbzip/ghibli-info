import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { ZapIcon } from 'lucide-react';
import Cookies from 'js-cookie';
import { getRemainingFreeGenerations, getCredits, getTotalRemainingGenerations } from '../utils/quota';

interface QuotaDisplayProps {
  freeRemaining?: number;
  credits?: number;
  totalRemaining?: number;
}

const QuotaDisplay: React.FC<QuotaDisplayProps> = ({ 
  freeRemaining = 0,
  credits = 0,
  totalRemaining = 0
}) => {
  const { t } = useTranslation('common');
  const [clientTotal, setClientTotal] = useState<number | null>(null);
  
  // 在客户端执行后获取真实的值
  useEffect(() => {
    // 使用传入的props值或从utils/quota中获取的值
    const displayFree = typeof freeRemaining === 'number' && freeRemaining > 0 
      ? freeRemaining 
      : getRemainingFreeGenerations();
      
    const displayCredits = typeof credits === 'number' && credits > 0
      ? credits
      : getCredits();
      
    const total = typeof totalRemaining === 'number' && totalRemaining > 0
      ? totalRemaining
      : getTotalRemainingGenerations();
      
    setClientTotal(total);
  }, [freeRemaining, credits, totalRemaining]);

  // 在客户端渲染前使用传入的props值，避免水合错误
  const displayTotal = clientTotal !== null ? clientTotal : (
    typeof totalRemaining === 'number' && totalRemaining > 0
      ? totalRemaining
      : 0 // 服务器端渲染时使用保守默认值
  );

  return (
    <div className="flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-md border border-white/30">
      <div className="flex items-center text-sm">
        <div className="w-7 h-7 bg-[#f58f3a]/20 rounded-full flex items-center justify-center mr-2">
          <ZapIcon size={14} className="text-[#f58f3a]" />
        </div>
        <div className="font-medium text-[#5a3c2e]">
          {clientTotal === null ? (
            // 在客户端加载前不显示具体数字，避免水合错误
            <span>{t('quota.loading')}</span>
          ) : displayTotal > 0 ? (
            <span>
              {t('quota.generations_remaining', { count: displayTotal })}
            </span>
          ) : (
            <span className="text-red-500">
              {t('quota.no_generations')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotaDisplay; 