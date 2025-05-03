export const captions = {
  en: [
    "In a world of endless possibilities, find your inner peace.",
    "Capture the magic in everyday moments, just like Ghibli does.",
    "Life moves pretty fast. If you don't stop and look around once in a while, you could miss it.",
    "Some things in life are worth waiting for, like a Ghibli sunset.",
    "The most beautiful things in life aren't things. They're moments, memories, and feelings.",
    "Find beauty in the ordinary, magic in the mundane.",
    "Let your spirit soar like the wind across Ghibli landscapes.",
    "Not all who wander are lost; some are just finding their Ghibli moment.",
    "Dream big, live simply, love deeply - the Ghibli way.",
    "There's a little magic everywhere, if you know where to look."
  ],
  zh: [
    "平凡的日子里藏着吉卜力的魔法，抬头就能遇见。",
    "这世界比想象中更美好，只要你愿意用心感受。",
    "所有的相遇都是久别重逢，所有的美好都值得等待。",
    "生活不只有眼前的苟且，还有吉卜力的诗和远方。",
    "愿你有能力爱自己，有余力爱世界，像吉卜力电影里的主角一样勇敢。",
    "这一刻的心情，藏在这吉卜力风的画面里，以后会成为永恒。",
    "把握生活里的每一个瞬间，因为那些都是组成回忆的碎片。",
    "有些风景，只能用心才能看见；有些美好，只有吉卜力才能表达。",
    "云会带走你的思念，风会带来新的开始，就像每一部吉卜力电影告诉我们的那样。",
    "愿你的生活，如吉卜力的世界般充满诗意与惊喜。"
  ]
};

export const getRandomCaption = (locale: string = 'en'): string => {
  const captionList = locale === 'zh' ? captions.zh : captions.en;
  const randomIndex = Math.floor(Math.random() * captionList.length);
  return captionList[randomIndex];
}; 