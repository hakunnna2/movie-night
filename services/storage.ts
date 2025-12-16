import { MovieEntry } from '../types';

// 📝 EDIT THIS ARRAY TO ADD YOUR MOVIES
export const BLOG_ENTRIES: MovieEntry[] = [
  {
    id: '1',
    title: 'Exit 2019 ',
    type: 'movie',
    status: 'watched',
    date: '2025-12-04',
    rating: 4,
    story: "We expected a light and funny movie night, but EXIT surprised us. When a strange toxic gas spreads through the city, two ordinary people are forced to escape using creativity, teamwork, and courage. The movie balances tension and humor really well, keeping us stressed and smiling at the same time. By the end, it felt hopeful and energetic, the kind of movie that makes a movie night memorable.",
    posterUrl: '/assets/exit 2019.jpg'
  },
  {
    id: '2',
    title: 'Tunnel 2016',
    type: 'movie',
    status: 'watched',
    date: '2025-12-12',
    rating: 4,
    story: "What started as a normal drive quickly turned into a tense movie night. After a tunnel suddenly collapses, one man is trapped underground with limited time and hope. While rescue teams struggle outside, the movie focuses on patience, mental strength, and the quiet fight to stay alive. It’s a slow, heavy story that left us silent for a moment after it ended.",
    posterUrl: '/assets/tunnel 2016.jpg'
  },
  {
    id: '3',
    title: 'Walking to School 2009',
    type: 'movie',
    status: 'upcoming',
    date: '2025-12-18',
    rating: 4,
    story: "This movie felt simple and quiet, but it stayed with us. It follows two children whose daily walk to school is full of challenges, turning an ordinary routine into a test of courage and responsibility. The story shows childhood, family care, and the value of education in a very honest way. It’s calm, emotional, and reminds you how small efforts can mean everything.",
    posterUrl: '/assets/walking to school 2009.jpg'
  },
  
  
];

// Helper to get entries (now just returns the static array)
export const getEntries = (): MovieEntry[] => {
  return BLOG_ENTRIES;
};

// No-op for saveEntries since we are using static code
export const saveEntries = (entries: MovieEntry[]): void => {
  console.log("Static blog mode: changes are not saved to local storage.");
};