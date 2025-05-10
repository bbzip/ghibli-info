import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Image from 'next/image';
import { canGenerate, incrementUsage, getRemainingFreeGenerations, getCredits, getTotalRemainingGenerations, FREE_QUOTA, setIpHash, getIpHash } from '../utils/quota';
import { addImageToHistory } from '../utils/imageHistory';
import Layout from '../components/Layout';
import TotoroLoader from '../components/TotoroLoader';
import SubscriptionModal from '../components/SubscriptionModal';
import BackgroundSelector from '../components/BackgroundSelector';
import LanguageSwitcher from '../components/LanguageSwitcher';
import QuotaDisplay from '../components/QuotaDisplay';
import ImageCarousel from '../components/ImageCarousel';
import { CloudUpload, Upload, Zap, ArrowRight, Plus, ChevronDown, Download, Sparkles } from 'lucide-react';

const Home = () => {
  const { t } = useTranslation('common');
  
  // 基本状态
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 背景选择状态
  const [backgroundSelectorOpen, setBackgroundSelectorOpen] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState('bg-1');
  
  // 订阅状态
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [canGenerateImage, setCanGenerateImage] = useState(true);
  
  // 剩余次数状态
  const [freeRemaining, setFreeRemaining] = useState<number>(0);
  const [creditsRemaining, setCreditsRemaining] = useState<number>(0);
  const [totalRemaining, setTotalRemaining] = useState<number>(0);
  
  // 文件上传引用
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 添加 IP 验证和检查，在组件加载时进行
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 首先检查和验证用户 IP
      const verifyUser = async () => {
        try {
          const response = await fetch('/api/verify-user');
          const data = await response.json();
          
          if (data.verified && data.ipHash) {
            // 存储 IP 哈希以便后续使用
            setIpHash(data.ipHash); // 假设我们已经导入了这个函数
          }
        } catch (error) {
          console.error('Error verifying user:', error);
        }
      };
      
      verifyUser();
      
      const free = getRemainingFreeGenerations();
      const credits = getCredits();
      const total = getTotalRemainingGenerations();
      
      setCanGenerateImage(canGenerate());
      setFreeRemaining(free);
      setCreditsRemaining(credits);
      setTotalRemaining(total);
      
      // 如果是全新用户，显示欢迎消息
      if (free === FREE_QUOTA && credits === 0) {
        console.log('新用户欢迎');
      }
    }
  }, []);

  const handleImageSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSelectedImage(e.target.result as string);
        setGeneratedImage(null);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageSelected(e.target.files[0]);
    }
  };

  const handleGenerateImage = async () => {
    if (!selectedImage) return;
    
    // 检查用户是否还能生成更多图片
    if (!canGenerateImage) {
      setSubscriptionModalOpen(true);
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // 获取 IP 哈希值
      const ipHash = getIpHash();
      
      // 记录使用情况
      if (ipHash) {
        await fetch('/api/record-usage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ipHash }),
        });
      }
      
      // 增加本地使用计数
      incrementUsage();
      
      // 调用 API 生成图片
      const response = await axios.post('/api/generate', {
        imageUrl: selectedImage,
        background: selectedBackground,
      });
      
      if (response.data.success) {
        const generatedImageUrl = response.data.imageUrl;
        setGeneratedImage(generatedImageUrl);
        
        // 将生成的图片添加到历史记录
        addImageToHistory(selectedImage, generatedImageUrl, selectedBackground);
      } else {
        throw new Error(response.data.error || '图片生成失败');
      }
    } catch (err) {
      console.error('生成图片出错:', err);
      setError(err instanceof Error ? err.message : '发生未知错误');
    } finally {
      setIsGenerating(false);
      
      // 更新生成状态和剩余次数
      setCanGenerateImage(canGenerate());
      setFreeRemaining(getRemainingFreeGenerations());
      setCreditsRemaining(getCredits());
      setTotalRemaining(getTotalRemainingGenerations());
    }
  };

  const handleNewImage = () => {
    setSelectedImage(null);
    setGeneratedImage(null);
    setError(null);
  };

  // 订阅模态窗口关闭后更新状态
  const handleModalClose = () => {
    setSubscriptionModalOpen(false);
    refreshQuotaInfo();
  };

  // 刷新配额信息的函数
  const refreshQuotaInfo = () => {
    setCanGenerateImage(canGenerate());
    setFreeRemaining(getRemainingFreeGenerations());
    setCreditsRemaining(getCredits());
    setTotalRemaining(getTotalRemainingGenerations());
  };

  // 背景选择器相关
  const handleOpenBackgroundSelector = () => {
    setBackgroundSelectorOpen(true);
  };

  const handleCloseBackgroundSelector = () => {
    setBackgroundSelectorOpen(false);
  };

  const handleSelectBackground = (bgId: string) => {
    setSelectedBackground(bgId);
  };

  // 打开购买积分模态框
  const handleOpenSubscription = () => {
    setSubscriptionModalOpen(true);
  };

  // 示例转换图片 - 增加更多示例
  const exampleImages = [
    {
      original: '/assets/sample-before.jpg',
      transformed: '/assets/sample-after.jpg',
      title: '原始照片',
      transformedTitle: '吉卜力风格'
    },
    {
      original: '/assets/sample-before.jpg',
      transformed: '/assets/sample-after.jpg',
      title: '原始照片',
      transformedTitle: '吉卜力风格'
    },
    {
      original: '/assets/sample-before.jpg',
      transformed: '/assets/sample-after.jpg',
      title: '原始照片',
      transformedTitle: '吉卜力风格'
    },
    {
      original: '/assets/sample-before.jpg',
      transformed: '/assets/sample-after.jpg',
      title: '原始照片',
      transformedTitle: '吉卜力风格'
    }
  ];

  // 特点列表
  const features = [
    {
      title: '高级风格转换技术',
      description: '我们的AI经过数千张吉卜力电影场景训练，能够准确捕捉水彩质感、光效和人物设计，完美重现宫崎骏的魔幻世界'
    },
    {
      title: '照片转换 & 文字生成',
      description: '上传照片将其转为吉卜力风格，或通过详细文本描述创建全新场景，灵活创作属于你的想象世界'
    },
    {
      title: '高分辨率艺术作品',
      description: '生成高达2048×2048分辨率的精美图像，完美适合数字分享和打印，即使放大也能保留精细细节'
    }
  ];

  return (
    <>
      <Head>
        <title>{t('site.title')}</title>
        <meta name="description" content={t('site.description')} />
      </Head>
      
      <div className="ghibli-bg min-h-screen">
        {/* 顶部导航 - 添加语言切换器 */}
        <header className="py-5 px-4 md:px-8 max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-[#f58f3a] rounded-full flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
            <h1 className="text-xl font-wenkai font-bold text-[#5a3c2e] drop-shadow-sm">{t('site.title')}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <a 
              href="/my-gallery" 
              className="text-[#5a3c2e] hover:text-[#f58f3a] transition flex items-center space-x-1 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm shadow-sm border border-white/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>{t('gallery.title')}</span>
            </a>
            <LanguageSwitcher />
          </div>
        </header>
        
        {/* 英雄区 */}
        <section className="pt-8 pb-8 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-[#5a3c2e] mb-4 drop-shadow-sm">
              {t('site.title')}
            </h1>
            <p className="text-lg text-ghibli-gray mb-4 drop-shadow-sm">
              {t('site.description')}
            </p>
            <p className="text-md text-gray-600 mb-8 italic">
              {t('site.upload_instruction')}
            </p>
            
            {/* 新用户免费次数说明 */}
            {freeRemaining > 0 && (
              <div className="text-center mb-8 text-[#5a3c2e] drop-shadow-sm bg-white/50 backdrop-blur-sm rounded-full py-2 px-4 inline-block">
                <p>
                  {t('locale') === 'zh' 
                    ? `🎉 新用户可免费生成${freeRemaining}次吉卜力风格图片 🎉` 
                    : `🎉 New users get ${freeRemaining} free generations 🎉`}
                </p>
              </div>
            )}
            
            {!selectedImage && !generatedImage && (
              <div className="flex justify-center mt-8">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#f58f3a] hover:bg-[#f5a254] text-white px-8 py-3 rounded-full font-medium text-lg flex items-center gap-2 transition shadow-xl"
                >
                  {t('generate.button')} <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
          
          {/* 吉卜力风格示例区域 - 新版本 */}
          {!selectedImage && !generatedImage && (
            <section className="max-w-6xl mx-auto mt-16 px-6">
              <div className="bg-white/70 backdrop-blur rounded-3xl shadow-md p-8">
                <h2 className="text-2xl font-semibold text-[#5a3c2e] text-center flex items-center justify-center">
                  <span className="mr-2">✨</span> 
                  {t('example.title')}
                </h2>
                
                <p className="text-center text-gray-600 mt-3 max-w-2xl mx-auto mb-6">
                  {t('example.description')}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                  {/* 示例图1 */}
                  <div className="transform transition-transform hover:scale-105 duration-300">
                    <div className="rounded-xl overflow-hidden shadow-md">
                      <img 
                        src="/images/ghibli-example-1.jpg" 
                        alt="Ghibli Example 1" 
                        className="w-full h-full object-cover aspect-square"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-2 italic">
                      {t('example.caption1')}
                    </p>
                  </div>
                  
                  {/* 示例图2 */}
                  <div className="transform transition-transform hover:scale-105 duration-300">
                    <div className="rounded-xl overflow-hidden shadow-md">
                      <img 
                        src="/images/ghibli-example-2.jpg" 
                        alt="Ghibli Example 2" 
                        className="w-full h-full object-cover aspect-square"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-2 italic">
                      {t('example.caption2')}
                    </p>
                  </div>
                  
                  {/* 示例图3 */}
                  <div className="transform transition-transform hover:scale-105 duration-300">
                    <div className="rounded-xl overflow-hidden shadow-md">
                      <img 
                        src="/images/ghibli-example-3.jpg" 
                        alt="Ghibli Example 3" 
                        className="w-full h-full object-cover aspect-square"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-2 italic">
                      {t('example.caption3')}
                    </p>
                  </div>
                  
                  {/* 示例图4 */}
                  <div className="transform transition-transform hover:scale-105 duration-300">
                    <div className="rounded-xl overflow-hidden shadow-md">
                      <img 
                        src="/images/ghibli-example-4.jpg" 
                        alt="Ghibli Example 4" 
                        className="w-full h-full object-cover aspect-square"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-2 italic">
                      {t('example.caption4')}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}
          
          {/* 上传/生成区域 */}
          {!selectedImage && !generatedImage && !isGenerating ? (
            <section className="mt-12 mb-16 max-w-3xl mx-auto px-4">
              <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-white/20">
                <h2 className="text-xl text-[#5a3c2e] font-bold mb-4 text-center">
                  {t('upload.your_own_photo')}
                </h2>
                
                {/* 添加剩余次数和购买积分到上传区域 */}
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
                  <QuotaDisplay 
                    freeRemaining={freeRemaining}
                    credits={creditsRemaining}
                    totalRemaining={totalRemaining}
                  />
                  <button 
                    onClick={handleOpenSubscription}
                    className="inline-flex items-center bg-[#f58f3a] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[#f5a254] transition"
                  >
                    <Zap size={16} className="mr-2" />
                    {t('subscription.buy_more_credits')}
                  </button>
                </div>
                
                <div 
                  className="border-2 border-dashed border-white/60 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-[#7aaedb] transition-colors mb-8 bg-white/80 backdrop-blur-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="bg-blue-50 p-4 rounded-full mb-4 shadow-md">
                    <CloudUpload className="h-12 w-12 text-[#7aaedb]" />
                  </div>
                  
                  <p className="font-medium text-[#5a3c2e] mb-2 drop-shadow-sm">{t('upload.drag_drop')}</p>
                  <p className="text-sm text-ghibli-gray">{t('upload.supported_formats')}</p>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/png"
                    onChange={handleFileInput}
                  />
                </div>
                
                {/* 移除上传按钮，只保留点击上方区域触发上传 */}
                
              </div>
            </section>
          ) : null}
          
          {/* 选中图片后的界面 */}
          {selectedImage && !generatedImage && !isGenerating && (
            <section className="mt-12 mb-16 max-w-4xl mx-auto px-4">
              <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-white/20">
                <h2 className="text-xl text-[#5a3c2e] font-bold mb-6 text-center">
                  {t('generate.create_image')}
                </h2>
                
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full max-w-sm transition-transform duration-300 hover:scale-105">
                      <div className="rounded-xl overflow-hidden shadow-inner border border-orange-200 min-h-[300px] flex items-center justify-center">
                        <img 
                          src={selectedImage} 
                          alt={t('upload.title')} 
                          className="max-w-full max-h-[400px] object-contain"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{t('upload.title')}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <button
                        onClick={handleGenerateImage}
                        className="w-full py-3 bg-[#f58f3a] hover:bg-[#f5a254] text-white rounded-full font-medium flex items-center justify-center transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
                        disabled={isGenerating || !canGenerateImage}
                      >
                        <Sparkles className="h-5 w-5 mr-2" />
                        {t('generate.button')}
                      </button>
                      
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="w-full py-2 border border-[#7aaedb] text-[#7aaedb] bg-transparent rounded-full text-sm hover:bg-[#7aaedb] hover:text-white transition-colors"
                      >
                        {t('upload.try_again')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
          
          {/* 加载状态 */}
          {isGenerating && (
            <section className="mt-12 mb-16 max-w-4xl mx-auto px-4">
              <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-white/20 text-center">
                <div className="flex flex-col items-center justify-center py-8">
                  <TotoroLoader />
                  <p className="mt-6 text-[#5a3c2e] font-medium text-lg drop-shadow-sm">
                    {t('generate.processing')}
                  </p>
                  <p className="mt-2 text-gray-500 text-sm max-w-md mx-auto">
                    {t('locale') === 'zh' ? 
                      '我们正在将您的照片变成魔幻的吉卜力风格，这通常需要15-30秒' : 
                      'We are transforming your photo into magical Ghibli style, this usually takes 15-30 seconds'}
                  </p>
                </div>
              </div>
            </section>
          )}
          
          {/* 错误状态 */}
          {error && (
            <section className="mt-12 mb-16 max-w-4xl mx-auto px-4">
              <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-white/20 text-center">
                <div className="text-red-500 mb-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-12 w-12 mx-auto mb-2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                    />
                  </svg>
                  <h3 className="text-xl font-medium">{t('generate.failed')}</h3>
                  <p className="mt-2">{error}</p>
                </div>
                <button
                  onClick={handleNewImage}
                  className="px-6 py-2 bg-[#7aaedb] hover:bg-[#7aaedb]/90 text-white rounded-full font-medium transition-colors shadow-md"
                >
                  {t('upload.try_again')}
                </button>
              </div>
            </section>
          )}
          
          {/* 结果状态 - 改进下载按钮 */}
          {generatedImage && !isGenerating && (
            <section className="mt-12 mb-16 max-w-4xl mx-auto px-4">
              <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-white/20">
                <h2 className="text-xl text-[#5a3c2e] font-bold mb-6 text-center">
                  {t('result.title')}
                </h2>
                
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full max-w-sm transition-transform duration-300 hover:scale-105">
                      <div className="rounded-xl overflow-hidden shadow-inner border border-orange-200 min-h-[300px] flex items-center justify-center">
                        <img 
                          src={selectedImage || ''} 
                          alt={t('preview.before')} 
                          className="max-w-full max-h-[400px] object-contain"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{t('preview.before')}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full max-w-sm transition-transform duration-300 hover:scale-105">
                      <div className="rounded-xl overflow-hidden shadow-xl border border-orange-200 min-h-[300px] flex items-center justify-center">
                        <img 
                          src={generatedImage} 
                          alt={t('preview.after')} 
                          className="max-w-full max-h-[400px] object-contain"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-orange-600 font-medium">{t('preview.after')}</p>
                    </div>
                  </div>
                </div>
                
                {/* 下载按钮区域 */}
                <div className="mt-6 flex justify-center">
                  <a 
                    href={generatedImage} 
                    download="ghibli-style.jpg"
                    className="bg-[#7aaedb] hover:bg-[#7aaedb]/90 text-white px-6 py-3 rounded-full font-medium flex items-center justify-center transition shadow-md"
                  >
                    <Download size={18} className="mr-2" />
                    {t('result.download')}
                  </a>
                </div>
                
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={handleNewImage}
                    className="px-6 py-3 bg-[#7aaedb] hover:bg-[#7aaedb]/90 text-white rounded-full font-medium flex items-center justify-center transition shadow-md"
                  >
                    <Plus size={18} className="mr-2" />
                    {t('result.new_image')}
                  </button>
                  
                  <button 
                    onClick={handleOpenSubscription}
                    className="px-6 py-3 bg-[#f58f3a] hover:bg-[#f5a254] text-white rounded-full font-medium transition shadow-md"
                  >
                    {t('subscription.buy_more_credits')}
                  </button>
                </div>
                
                <div className="mt-6 text-center text-sm text-gray-500">
                  <p>{t('result.share_tip')}</p>
                </div>
              </div>
            </section>
          )}
        </section>
        
        {/* 特点展示区 */}
        {!selectedImage && !generatedImage && !isGenerating && (
          <section className="py-16 px-4 md:px-8 bg-white/80 backdrop-blur-sm mt-8">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-[#5a3c2e] mb-12 text-center drop-shadow-sm">
                {t('feature.title')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 transition-transform hover:scale-105 duration-300">
                    <h3 className="text-xl font-semibold text-[#5a3c2e] mb-3 drop-shadow-sm">
                      {feature.title === '高级风格转换技术' ? t('feature.advanced_style') :
                       feature.title === '照片转换 & 文字生成' ? t('feature.photo_transformation') :
                       t('feature.high_resolution')}
                    </h3>
                    <p className="text-ghibli-gray">
                      {feature.title === '高级风格转换技术' ? t('feature.advanced_style_desc') :
                       feature.title === '照片转换 & 文字生成' ? t('feature.photo_transformation_desc') :
                       t('feature.high_resolution_desc')}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-16 text-center">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#f58f3a] hover:bg-[#f5a254] text-white px-6 py-3 rounded-full font-medium text-lg transition shadow-lg"
                >
                  {t('generate.button')}
                </button>
              </div>
            </div>
          </section>
        )}
        
        {/* 计数器 */}
        <div className="py-8 bg-white/70 backdrop-blur-sm text-center">
          <p className="text-[#5a3c2e] font-wenkai drop-shadow-sm">
            {t('site.user_count')}
          </p>
        </div>
        
        {/* 版权信息 */}
        <footer className="py-6 bg-[#5a3c2e] text-white text-center text-sm">
          <p>© 2024 {t('site.copyright')} | {t('site.all_rights')}</p>
        </footer>
      </div>
      
      {/* 订阅模态窗口 */}
      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={handleModalClose}
        onCreditsUpdated={refreshQuotaInfo}
      />
      
      {/* 背景选择器 */}
      <BackgroundSelector 
        isOpen={backgroundSelectorOpen}
        onClose={handleCloseBackgroundSelector}
        onSelectBackground={handleSelectBackground}
        selectedBackground={selectedBackground}
      />
    </>
  );
};

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
};

export default Home;
