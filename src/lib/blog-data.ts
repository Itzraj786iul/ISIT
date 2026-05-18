export type BlogPost = {
  id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  description: string;
  content: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'featured',
    title: '10 Essential Tips to Master Full Stack Development in 2026',
    category: 'Study Tips',
    author: 'Dr. Amit Kumar',
    date: 'January 15, 2025',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    description:
      'Discover the most effective strategies and best practices to become a proficient full stack developer.',
    content: [
      'Full Stack Development continues to be one of the most in-demand skills in 2026. The key is depth over breadth: master one frontend and one backend stack before chasing every new framework.',
      'Build a strong foundation in HTML, CSS, JavaScript, and at least one modern framework such as React or Next.js.',
      'On the backend, understand REST APIs, authentication, and how databases model real-world relationships.',
      'Practice with projects that solve real problems — a todo app is fine for week one; by month two you should ship something someone else can use.',
      'Use an AI tutor to unblock yourself, but always explain your reasoning out loud so you actually learn.',
      'Review mistakes from practice sessions weekly; patterns in errors reveal what to study next.',
      'Collaborate or get code review from peers; schools using ISIC can pair students for accountability.',
      'Finally, continuous learning beats cramming: short daily sessions outperform occasional marathons.',
    ],
  },
  {
    id: '1',
    title: 'How to Transition from Non-Tech to Tech Career',
    category: 'Career Advice',
    author: 'Priya Mehta',
    date: 'January 12, 2025',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
    description: 'A practical guide for professionals switching into technology roles.',
    content: [
      'Changing careers is challenging but absolutely achievable with a structured plan.',
      'Start by identifying which tech path fits you: engineering, data, product, or design.',
      'Build a portfolio of 2–3 projects that demonstrate problem-solving, not tutorial clones.',
      'Network with practitioners and ask for informational interviews — most people are happy to help.',
      'Use adaptive learning tools to close knowledge gaps efficiently rather than re-watching passive videos.',
    ],
  },
  {
    id: '2',
    title: 'Active Learning Beats Passive Watching',
    category: 'Study Tips',
    author: 'ISIC Learning Team',
    date: 'January 8, 2025',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    description: 'Why doing, reflecting, and teaching back beats binge-watching lectures.',
    content: [
      'Research consistently shows that retrieval practice and spaced repetition improve long-term retention.',
      'After each lesson, write three questions you could ask a friend about the topic.',
      'Use short AI-tutor sessions to test understanding, not to copy answers.',
      'Schedule weekly review blocks before exams instead of cramming the night before.',
    ],
  },
  {
    id: '3',
    title: 'How Schools Can Use AI Tutors Responsibly',
    category: 'Industry Trends',
    author: 'ISIC Editorial',
    date: 'January 3, 2025',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7',
    description: 'Guidelines for educators integrating AI companions in K–12 and higher ed.',
    content: [
      'AI tutors should augment teachers, not replace human judgment or pastoral care.',
      'Set clear policies on when students may use AI for homework vs exams.',
      'Use mastery dashboards to see where classes struggle — intervene in person where AI usage spikes without score gains.',
      'Train teachers on prompt design so they can model good questions for students.',
      'Protect student data: choose platforms with transparent data handling and school-level controls.',
    ],
  },
];

export function getBlogPostById(id: string): BlogPost | undefined {
  if (id === 'featured') return BLOG_POSTS[0];
  return BLOG_POSTS.find((p) => p.id === id);
}

export function getRelatedPosts(currentId: string, limit = 3): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.id !== currentId).slice(0, limit);
}
