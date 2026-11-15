export type Tone = 'green' | 'lavender' | 'peach' | 'pink' | 'blue' | 'yellow';

export type Lesson = {
  id: string;
  title: string;
  minutes: number;
};

export type Chapter = {
  id: string;
  title: string;
  description: string;
  tone: Tone;
  lessons: Lesson[];
};

const lessons = (chapterId: string, items: [string, number][]): Lesson[] =>
  items.map(([title, minutes], index) => ({
    id: `${chapterId}-${index + 1}`,
    title,
    minutes,
  }));

export const chapters: Chapter[] = [
  {
    id: 'everyday',
    title: 'Meet your everyday English',
    description: 'Introductions, routines & the little things',
    tone: 'green',
    lessons: lessons('everyday', [
      ['A little about you', 10],
      ['Your perfect morning', 8],
      ['Your usual, please', 8],
    ]),
  },
  {
    id: 'possibilities',
    title: 'A world of possibilities',
    description: 'Travel, new places & new connections',
    tone: 'lavender',
    lessons: lessons('possibilities', [
      ['Where will you go?', 10],
      ['Make yourself at home', 8],
      ['Stories worth sharing', 10],
    ]),
  },
  {
    id: 'professional',
    title: 'Find your professional voice',
    description: 'Ideas, interviews & meaningful work',
    tone: 'peach',
    lessons: lessons('professional', [
      ['Make an impression', 12],
      ['Make your case', 10],
      ['Your next big idea', 8],
    ]),
  },
  {
    id: 'shopping',
    title: 'Spend smart',
    description: 'Shopping, money & good deals',
    tone: 'peach',
    lessons: lessons('shopping', [
      ['Is this on sale?', 8],
      ['Returns made easy', 10],
      ['Budget like a pro', 10],
    ]),
  },
  {
    id: 'home',
    title: 'Home sweet home',
    description: 'Homes, neighbours & everyday fixes',
    tone: 'lavender',
    lessons: lessons('home', [
      ['Finding a flat', 10],
      ['Fixing little problems', 8],
      ['Meet the neighbours', 8],
    ]),
  },
  {
    id: 'friends',
    title: 'Make plans, make friends',
    description: 'Social life, invitations & small talk',
    tone: 'pink',
    lessons: lessons('friends', [
      ['Are you free on Friday?', 8],
      ['Party small talk', 10],
      ['Saying sorry, sincerely', 10],
    ]),
  },
  {
    id: 'directions',
    title: 'Find your way',
    description: 'Getting around towns & cities',
    tone: 'blue',
    lessons: lessons('directions', [
      ['Which way to the station?', 8],
      ['Taking a taxi', 8],
      ['Lost and found', 10],
    ]),
  },
  {
    id: 'career',
    title: 'Grow your career',
    description: 'Feedback, negotiation & presentations',
    tone: 'lavender',
    lessons: lessons('career', [
      ['Ask for feedback', 10],
      ['Negotiate your salary', 12],
      ['Present your project', 12],
    ]),
  },
  {
    id: 'services',
    title: 'Get it sorted',
    description: 'Services, appointments & complaints',
    tone: 'pink',
    lessons: lessons('services', [
      ['Booking an appointment', 8],
      ['At the bank', 10],
      ['Making a complaint', 10],
    ]),
  },
  {
    id: 'feelings',
    title: 'Say what you feel',
    description: 'Feelings, advice & celebrations',
    tone: 'peach',
    lessons: lessons('feelings', [
      ['Talking about feelings', 10],
      ['Giving advice', 10],
      ['Celebrating good news', 8],
    ]),
  },
  {
    id: 'conversation',
    title: 'Join the conversation',
    description: 'News, opinions & persuasion',
    tone: 'green',
    lessons: lessons('conversation', [
      ['What’s in the news?', 10],
      ['Agree to disagree', 12],
      ['Persuade your audience', 12],
    ]),
  },
  {
    id: 'hobbies',
    title: 'Do what you love',
    description: 'Hobbies, free time & passions',
    tone: 'yellow',
    lessons: lessons('hobbies', [
      ['Weekend plans', 8],
      ['Your favourite hobby', 10],
      ['Join the club', 10],
    ]),
  },
  {
    id: 'culture',
    title: 'Stories on screen and page',
    description: 'Films, music, books & culture',
    tone: 'lavender',
    lessons: lessons('culture', [
      ['Movie night', 10],
      ['Music that moves you', 8],
      ['Book club', 12],
    ]),
  },
  {
    id: 'online',
    title: 'Life online',
    description: 'Technology, apps & digital habits',
    tone: 'blue',
    lessons: lessons('online', [
      ['Tech support, please', 10],
      ['Digital habits', 10],
      ['Social media: friend or foe?', 12],
    ]),
  },
  {
    id: 'environment',
    title: 'A greener tomorrow',
    description: 'Weather, nature & the environment',
    tone: 'green',
    lessons: lessons('environment', [
      ['Weather talk', 8],
      ['Small steps for the planet', 10],
      ['Into the wild', 10],
    ]),
  },
  {
    id: 'food',
    title: 'Flavours worth sharing',
    description: 'Food, cooking & eating out',
    tone: 'peach',
    lessons: lessons('food', [
      ['What’s cooking tonight?', 8],
      ['A table for two', 10],
      ['Recipes from home', 10],
    ]),
  },
  {
    id: 'wellbeing',
    title: 'Feel good, inside and out',
    description: 'Health, fitness & wellbeing',
    tone: 'pink',
    lessons: lessons('wellbeing', [
      ['At the doctor’s', 10],
      ['Move your body', 8],
      ['Rest and recharge', 8],
    ]),
  },
  {
    id: 'study',
    title: 'Never stop learning',
    description: 'School, study skills & studying abroad',
    tone: 'blue',
    lessons: lessons('study', [
      ['First day of class', 8],
      ['Study smarter', 10],
      ['Applying abroad', 12],
    ]),
  },
  {
    id: 'teamwork',
    title: 'Teamwork every day',
    description: 'Colleagues, meetings & everyday work',
    tone: 'yellow',
    lessons: lessons('teamwork', [
      ['Meet the team', 8],
      ['Running a meeting', 12],
      ['Calling a client', 10],
    ]),
  },
  {
    id: 'future',
    title: 'Your future, your words',
    description: 'Dreams, goals & your English story',
    tone: 'lavender',
    lessons: lessons('future', [
      ['Five years from now', 10],
      ['Your dream trip', 10],
      ['Tell your English story', 12],
    ]),
  },
];

// Unit sequence and the previously unseen lessons are verified against the
// supplemental app walkthrough. IDs remain stable for saved progress.
const unitOrder = ['everyday', 'possibilities', 'professional', 'food', 'wellbeing', 'shopping', 'home', 'friends', 'directions', 'hobbies', 'culture', 'online', 'environment', 'study', 'teamwork', 'career', 'services', 'feelings', 'conversation', 'future'];
chapters.sort((a, b) => unitOrder.indexOf(a.id) - unitOrder.indexOf(b.id));

export type WordStatus = 'New' | 'Learning' | 'Mastered';

export type Word = {
  id: string;
  word: string;
  definition: string;
  example: string;
  status: WordStatus;
  collection: string;
  due: boolean;
};

export const initialWords: Word[] = [
  {
    id: 'departure',
    word: 'departure',
    definition: 'the act or time of leaving',
    example: 'Check the departure time before you leave for the airport.',
    status: 'New',
    collection: 'Travel smart',
    due: true,
  },
  {
    id: 'reservation',
    word: 'reservation',
    definition: 'an arrangement to keep a place for you',
    example: 'I have a reservation for two nights.',
    status: 'New',
    collection: 'Travel smart',
    due: true,
  },
  {
    id: 'itinerary',
    word: 'itinerary',
    definition: 'a plan for a journey',
    example: 'Our itinerary includes three days by the sea.',
    status: 'New',
    collection: 'Travel smart',
    due: true,
  },
  {
    id: 'serendipity',
    word: 'serendipity',
    definition: 'A happy discovery you weren’t looking for.',
    example: 'Finding that little bookshop was pure serendipity.',
    status: 'New',
    collection: 'My words',
    due: true,
  },
  {
    id: 'perspective',
    word: 'perspective',
    definition: 'A particular way of seeing or thinking about something.',
    example: 'Travelling gives you a different perspective on life.',
    status: 'Learning',
    collection: 'Everyday essentials',
    due: true,
  },
  {
    id: 'make-the-most-of',
    word: 'make the most of',
    definition: 'To use something in the best possible way.',
    example: 'Let’s make the most of this sunny afternoon.',
    status: 'New',
    collection: 'Everyday essentials',
    due: true,
  },
  {
    id: 'thoughtful',
    word: 'thoughtful',
    definition: 'Showing care and consideration for others.',
    example: 'It was thoughtful of you to remember my birthday.',
    status: 'Learning',
    collection: 'Everyday essentials',
    due: true,
  },
];

export type Scenario = {
  id: string;
  type: 'Roleplay' | 'Interview' | 'Debate' | 'Discussion';
  title: string;
  description: string;
  level: string;
  minutes: number;
  tone: Tone;
  asset: string;
};

export const scenarios: Scenario[] = [
  {
    id: 'usual',
    type: 'Roleplay',
    title: 'Your usual, please',
    description: 'Order a coffee and make a little small talk.',
    level: 'A2–B1',
    minutes: 8,
    tone: 'peach',
    asset: 'house.webp',
  },
  {
    id: 'anywhere',
    type: 'Roleplay',
    title: 'Next stop: anywhere',
    description: 'Make your next adventure a conversation starter.',
    level: 'A2–B1',
    minutes: 10,
    tone: 'blue',
    asset: 'plane.webp',
  },
  {
    id: 'impression',
    type: 'Interview',
    title: 'Make a great first impression',
    description: 'Walk into your next interview with confidence.',
    level: 'B1–B2',
    minutes: 12,
    tone: 'lavender',
    asset: 'briefcase.webp',
  },
  {
    id: 'remote',
    type: 'Debate',
    title: 'Is working from home better?',
    description: 'Pick a side. Make your point. Find your voice.',
    level: 'B1–B2',
    minutes: 10,
    tone: 'green',
    asset: 'books.webp',
  },
  {
    id: 'habits',
    type: 'Discussion',
    title: 'Small habits, big changes',
    description: 'Talk about the habits that make you feel good.',
    level: 'A2–B1',
    minutes: 8,
    tone: 'yellow',
    asset: 'plant.webp',
  },
];

export type Tutor = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  accent: string;
};

// Tutor choices and descriptions verified against the supplemental walkthrough.
export const tutors: Tutor[] = [
  {
    id: 'skye',
    name: 'Skye',
    tagline: 'Your biggest cheerleader',
    description: 'Turn everyday conversations into little wins.',
    accent: 'American English',
  },
  {
    id: 'camila',
    name: 'Camila',
    tagline: 'Your friendly conversation partner',
    description: 'Find your voice with relaxed conversations and a little extra encouragement.',
    accent: 'American English',
  },
  {
    id: 'henry',
    name: 'Henry',
    tagline: 'Curious & creative',
    description: 'Big ideas, interesting stories, and a fresh perspective on your English.',
    accent: 'British English',
  },
  {
    id: 'dwayne',
    name: 'Dwayne',
    tagline: 'Focused & motivating',
    description: 'Build confidence for the conversations that matter, one practical step at a time.',
    accent: 'American English',
  },
];
