export type QuoteCategory = 'money' | 'productivity' | 'motivation';

export interface DayFlowQuote {
  id: string;
  category: QuoteCategory;
  text: string;
  author: string;
}

const QUOTE_CONTINUATIONS: Record<QuoteCategory, string[]> = {
  money: [
    'Small, steady choices can build lasting security.',
    'A clear plan gives every dollar a purpose.',
    'Patience often outperforms a rush for quick wins.',
    'Learning one useful habit can change your financial path.',
    'Progress grows when spending reflects what matters most.',
    'A thoughtful pause can protect tomorrow from impulse.',
    'Consistency turns modest steps into meaningful progress.',
    'Knowing your numbers makes better choices possible.',
    'A resilient future is built one decision at a time.',
    "Your next choice matters more than yesterday's mistake.",
  ],
  productivity: [
    'Give your attention to one meaningful thing at a time.',
    'A small finished step is better than a perfect unfinished plan.',
    'Make room for deep work by protecting your focus.',
    'Clear priorities make it easier to say no to distractions.',
    'Rest is part of the work, not a reward for exhaustion.',
    'A repeatable system can carry you when motivation fades.',
    'Start with the task that makes the rest of the day easier.',
    'Progress becomes visible when you make time to review it.',
    'A calm pace can still take you somewhere remarkable.',
    'Your calendar should reflect your values, not just your demands.',
  ],
  motivation: [
    'Courage is often a quiet decision to begin again.',
    'You can move forward without having every answer.',
    'A setback is an event, not your identity.',
    'The effort you make today is a gift to your future self.',
    'You are allowed to grow at a pace that is sustainable.',
    'Keep going; even an imperfect step changes your direction.',
    'Your potential is not limited by one difficult chapter.',
    'Celebrate the progress that no one else can see.',
    'You do not need permission to choose a better path.',
    'Begin where you are, and let practice build your confidence.',
  ],
};

const QUOTE_OPENERS: Record<QuoteCategory, string[]> = {
  money: [
    'Wealth begins with awareness.',
    'Financial freedom is built, not found.',
    'Your budget is a map for your priorities.',
    'Saving is a promise to your future self.',
    'Money works best when it serves your values.',
    'A healthy relationship with money starts with honesty.',
    'Every purchase is a small vote for a kind of life.',
    'Security grows from thoughtful habits.',
    'Financial progress is personal, not a competition.',
    'The strongest money plan is one you can sustain.',
  ],
  productivity: [
    'Focus is a resource worth protecting.',
    'Good work starts with a clear next step.',
    'Productivity is about intention, not motion.',
    'A useful routine makes good choices easier.',
    'Attention is the beginning of meaningful progress.',
    'Your best work needs space to breathe.',
    'A plan is helpful when it leaves room to adapt.',
    'Momentum is built through small completions.',
    'Doing less can make room for what matters.',
    'A thoughtful pause can sharpen your priorities.',
  ],
  motivation: [
    'Every fresh start begins with one choice.',
    'Confidence grows through promises kept to yourself.',
    'You are stronger than a single hard day.',
    'Small acts of bravery add up.',
    'Growth rarely follows a perfectly straight line.',
    'The person you are becoming is shaped by practice.',
    'A slow season can still be a growing season.',
    'Your story is still being written.',
    'Hope is a reason to take the next step.',
    'There is strength in beginning again.',
  ],
};

export const INSPIRATIONAL_QUOTES: DayFlowQuote[] = (
  Object.keys(QUOTE_OPENERS) as QuoteCategory[]
).flatMap((category) =>
  QUOTE_OPENERS[category].flatMap((opener, openerIndex) =>
    QUOTE_CONTINUATIONS[category].map((continuation, continuationIndex) => ({
      id: `${category}-${openerIndex}-${continuationIndex}`,
      category,
      text: `${opener} ${continuation}`,
      author: 'DayFlow',
    }))
  )
);

const LAST_QUOTE_STORAGE_KEY = 'dayflow_last_reflection_quote';

export function getNextQuote(): DayFlowQuote {
  let previousQuoteId: string | null = null;
  try {
    previousQuoteId = localStorage.getItem(LAST_QUOTE_STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to read the previous reflection quote:', error);
  }

  const choices = INSPIRATIONAL_QUOTES.filter((quote) => quote.id !== previousQuoteId);
  const quote = choices[Math.floor(Math.random() * choices.length)];
  try {
    localStorage.setItem(LAST_QUOTE_STORAGE_KEY, quote.id);
  } catch (error) {
    console.warn('Unable to save the reflection quote:', error);
  }
  return quote;
}
