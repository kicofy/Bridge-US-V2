import { Post } from '../components/PostCard';

export const mockPosts: Post[] = [
  {
    id: '1',
    title: 'F-1 Visa: Complete Guide to OPT Extension Process',
    preview: 'After working with immigration advisors and going through the process myself, here\'s a comprehensive guide on how to extend your OPT. Important deadlines and common mistakes to avoid included.',
    tags: ['Visa', 'OPT', 'F-1', 'Immigration'],
    author: {
      name: 'Sarah Chen',
      verified: true,
      credibilityScore: 92,
      helpfulnessScore: 88,
    },
    accuracyScore: 95,
    helpfulCount: 147,
    replyCount: 23,
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    title: 'Affordable Housing Near UCLA - My Experience',
    preview: 'Spent 3 months searching for affordable housing in Westwood. Here are the best neighborhoods, average prices, and tips for negotiating with landlords as an international student.',
    tags: ['Housing', 'UCLA', 'Los Angeles', 'Budget'],
    author: {
      name: 'Marcus Liu',
      verified: true,
      credibilityScore: 85,
      helpfulnessScore: 91,
    },
    accuracyScore: 89,
    helpfulCount: 98,
    replyCount: 34,
    timestamp: '5 hours ago',
  },
  {
    id: '3',
    title: 'Health Insurance: International Student Options Compared',
    preview: 'I compared 5 different health insurance plans available for F-1 students. Here\'s a detailed breakdown of coverage, costs, and what\'s actually worth it based on my research and experience.',
    tags: ['Health', 'Insurance', 'F-1', 'Resources'],
    author: {
      name: 'Priya Patel',
      verified: true,
      credibilityScore: 88,
      helpfulnessScore: 85,
    },
    accuracyScore: 93,
    helpfulCount: 156,
    replyCount: 45,
    timestamp: '1 day ago',
  },
  {
    id: '4',
    title: 'Campus Part-Time Jobs: What You Need to Know',
    preview: 'Working on-campus as an F-1 student has specific rules. I\'ve compiled everything about CPT, work hour limits, and the best departments to apply to based on feedback from 50+ students.',
    tags: ['Work', 'Campus Life', 'CPT', 'Part-time'],
    author: {
      name: 'Alex Kim',
      verified: false,
      credibilityScore: 72,
      helpfulnessScore: 78,
    },
    accuracyScore: 87,
    helpfulCount: 67,
    replyCount: 19,
    timestamp: '2 days ago',
  },
  {
    id: '5',
    title: 'Mental Health Resources for International Students',
    preview: 'Adjusting to life in the US can be challenging. This post covers free and low-cost mental health resources, campus counseling services, and support groups specifically for international students.',
    tags: ['Health', 'Mental Health', 'Support', 'Wellness'],
    author: {
      name: 'Emma Zhang',
      verified: true,
      credibilityScore: 94,
      helpfulnessScore: 96,
    },
    accuracyScore: 91,
    helpfulCount: 203,
    replyCount: 56,
    timestamp: '3 days ago',
  },
  {
    id: '6',
    title: 'H-1B Lottery: Understanding Your Chances and Preparing',
    preview: 'The H-1B process can be stressful. Here\'s statistical analysis of approval rates, tips for finding sponsoring employers, and backup plans if you don\'t get selected in the lottery.',
    tags: ['Visa', 'H-1B', 'Work', 'Immigration'],
    author: {
      name: 'Raj Sharma',
      verified: true,
      credibilityScore: 89,
      helpfulnessScore: 87,
    },
    accuracyScore: 94,
    helpfulCount: 189,
    replyCount: 67,
    timestamp: '4 days ago',
  },
  {
    id: '7',
    title: 'Building Credit History as an International Student',
    preview: 'Started with zero credit history and now have a 750 credit score. Step-by-step guide on secured cards, student cards, and financial habits that actually work for international students.',
    tags: ['Finance', 'Credit', 'Resources', 'Campus Life'],
    author: {
      name: 'David Wong',
      verified: true,
      credibilityScore: 81,
      helpfulnessScore: 83,
    },
    accuracyScore: 88,
    helpfulCount: 124,
    replyCount: 41,
    timestamp: '5 days ago',
  },
  {
    id: '8',
    title: 'Internship Search Timeline: When and How to Apply',
    preview: 'Got offers from 3 tech companies after applying strategically. This timeline covers when to start looking, how to handle visa sponsorship questions, and red flags to watch for.',
    tags: ['Work', 'Internship', 'Career', 'Timeline'],
    author: {
      name: 'Lisa Park',
      verified: true,
      credibilityScore: 86,
      helpfulnessScore: 89,
    },
    accuracyScore: 90,
    helpfulCount: 142,
    replyCount: 38,
    timestamp: '1 week ago',
  },
];

// Additional post templates for infinite scroll
const additionalPostTemplates = [
  {
    title: 'Tax Filing Guide for International Students on F-1 Visa',
    preview: 'Filing taxes for the first time as an international student? Here\'s everything about 1040-NR, tax treaties, and common deductions you might be eligible for.',
    tags: ['Finance', 'Tax', 'F-1', 'Resources'],
    author: {
      name: 'Michael Torres',
      verified: true,
      credibilityScore: 87,
      helpfulnessScore: 84,
    },
  },
  {
    title: 'Finding Roommates: Red Flags and Green Flags',
    preview: 'Lived with 6 different roommates during my time here. This guide helps you identify compatible roommates and avoid problematic living situations before signing a lease.',
    tags: ['Housing', 'Roommates', 'Campus Life', 'Tips'],
    author: {
      name: 'Sofia Rodriguez',
      verified: true,
      credibilityScore: 79,
      helpfulnessScore: 82,
    },
  },
  {
    title: 'Converting F-1 to Green Card: My Journey',
    preview: 'Successfully transitioned from F-1 to permanent residency. Here\'s the timeline, costs, and critical decisions I made along the way, plus common pitfalls to avoid.',
    tags: ['Visa', 'Immigration', 'Green Card', 'F-1'],
    author: {
      name: 'Kevin Zhang',
      verified: true,
      credibilityScore: 91,
      helpfulnessScore: 89,
    },
  },
  {
    title: 'Grocery Shopping on a Student Budget',
    preview: 'Save hundreds per month with these grocery shopping strategies. Including best stores for international ingredients, meal prep tips, and budget-friendly recipes.',
    tags: ['Finance', 'Budget', 'Campus Life', 'Food'],
    author: {
      name: 'Aisha Mohammed',
      verified: false,
      credibilityScore: 76,
      helpfulnessScore: 81,
    },
  },
  {
    title: 'Understanding CPT vs OPT: Complete Breakdown',
    preview: 'Confused about CPT and OPT? This comprehensive guide explains the differences, application processes, and how to maximize your work authorization options.',
    tags: ['Work', 'CPT', 'OPT', 'F-1'],
    author: {
      name: 'James Lee',
      verified: true,
      credibilityScore: 93,
      helpfulnessScore: 90,
    },
  },
  {
    title: 'Dealing with Homesickness: Practical Advice',
    preview: 'Homesickness is real. Here are evidence-based strategies that helped me and others cope with being far from home while succeeding academically.',
    tags: ['Health', 'Mental Health', 'Wellness', 'Support'],
    author: {
      name: 'Yuki Tanaka',
      verified: true,
      credibilityScore: 85,
      helpfulnessScore: 92,
    },
  },
  {
    title: 'Networking as an International Student',
    preview: 'Built a professional network of 200+ contacts in 2 years. Strategies for LinkedIn, career fairs, and informational interviews that actually work for international students.',
    tags: ['Career', 'Networking', 'Work', 'Campus Life'],
    author: {
      name: 'Carlos Mendez',
      verified: true,
      credibilityScore: 82,
      helpfulnessScore: 86,
    },
  },
  {
    title: 'Best Bank Accounts for International Students 2026',
    preview: 'Compared 10 major banks based on fees, requirements, and international student friendliness. Here are the top 3 options with detailed pros and cons.',
    tags: ['Finance', 'Banking', 'Resources', 'Tips'],
    author: {
      name: 'Nina Patel',
      verified: true,
      credibilityScore: 88,
      helpfulnessScore: 87,
    },
  },
  {
    title: 'Summer Housing Options When Your Lease Ends',
    preview: 'Don\'t get stuck without a place to stay. Guide to subletting, summer storage, and temporary housing options for international students staying in the US.',
    tags: ['Housing', 'Summer', 'Storage', 'Planning'],
    author: {
      name: 'Tom Wilson',
      verified: false,
      credibilityScore: 74,
      helpfulnessScore: 79,
    },
  },
  {
    title: 'STEM OPT Extension: Complete Application Guide',
    preview: 'Qualified for 24-month STEM extension? Here\'s the step-by-step process, required documents, common mistakes, and timeline expectations based on recent approvals.',
    tags: ['Visa', 'OPT', 'STEM', 'Immigration'],
    author: {
      name: 'Rachel Kim',
      verified: true,
      credibilityScore: 90,
      helpfulnessScore: 88,
    },
  },
  {
    title: 'Campus Emergency Resources Every Student Should Know',
    preview: 'Compiled a comprehensive list of emergency contacts, 24/7 resources, and crisis management services available on campus and in the local community.',
    tags: ['Health', 'Safety', 'Resources', 'Campus Life'],
    author: {
      name: 'Daniel Brown',
      verified: true,
      credibilityScore: 86,
      helpfulnessScore: 91,
    },
  },
  {
    title: 'Transportation Options: Cars vs Public Transit',
    preview: 'Analyzed the costs and benefits of owning a car versus using public transportation in different cities. Includes insurance considerations for international students.',
    tags: ['Transport', 'Budget', 'Campus Life', 'Finance'],
    author: {
      name: 'Maria Garcia',
      verified: true,
      credibilityScore: 80,
      helpfulnessScore: 83,
    },
  },
];

// Function to generate posts dynamically for infinite scroll
export function generateMorePosts(startIndex: number, count: number): Post[] {
  const posts: Post[] = [];
  
  for (let i = 0; i < count; i++) {
    const templateIndex = (startIndex + i) % additionalPostTemplates.length;
    const template = additionalPostTemplates[templateIndex];
    
    const timeUnits = ['hours', 'days', 'weeks', 'months'];
    const timeUnit = timeUnits[Math.floor(Math.random() * timeUnits.length)];
    const timeValue = Math.floor(Math.random() * 10) + 1;
    
    posts.push({
      id: `post-${startIndex + i + 9}`,
      title: template.title,
      preview: template.preview,
      tags: template.tags,
      author: template.author,
      accuracyScore: Math.floor(Math.random() * 15) + 80,
      helpfulCount: Math.floor(Math.random() * 150) + 20,
      replyCount: Math.floor(Math.random() * 50) + 5,
      timestamp: `${timeValue} ${timeUnit} ago`,
    });
  }
  
  return posts;
}