import { MovieEntry } from '../types';

// 📝 EDIT THIS ARRAY TO ADD YOUR MOVIES
export const BLOG_ENTRIES: MovieEntry[] = [
  {
    id: '1',
    title: 'Exit 2019',
    type: 'movie',
    status: 'watched',
    date: '2025-12-04',
    rating: 4,
    genres: ["Action", "Comedy", "Drama"],
    duration: "1h 43m",
    story: "We expected a light and funny movie night, but EXIT surprised us. When a strange toxic gas spreads through the city, two ordinary people are forced to escape using creativity, teamwork, and courage. The movie balances tension and humor really well, keeping us stressed and smiling at the same time. By the end, it felt hopeful and energetic, the kind of movie that makes a movie night memorable.",
    posterUrl: 'assets/exit 2019/captures/exit 2019.jpg',
    captures: [
      'assets/exit 2019/captures/exit 2019.jpg',
      'assets/exit 2019/captures/1.jpg',
      'assets/exit 2019/captures/2.jpg',
      'assets/exit 2019/captures/3.jpg',
      'assets/exit 2019/captures/4.jpg',
      'assets/exit 2019/captures/5.jpg',
      'assets/exit 2019/captures/6.jpg',
      'assets/exit 2019/captures/7.jpg',
      'assets/exit 2019/captures/8.jpg'
    ],
    videos: [
      { title: 'Official Trailer', url: 'https://www.youtube.com/embed/UXVk_04Ul3M?si=LbE6N6qF2elec3LC' }
    ]
  },
  {
    id: '2',
    title: 'Tunnel 2016',
    type: 'movie',
    status: 'watched',
    date: '2025-12-12',
    rating: 4,
    genres: ["Drama", "Thriller"],
    duration: "2h 06m",
    story: "What started as a normal drive quickly turned into a tense movie night. After a tunnel suddenly collapses, one man is trapped underground with limited time and hope. While rescue teams struggle outside, the movie focuses on patience, mental strength, and the quiet fight to stay alive. It’s a slow, heavy story that left us silent for a moment after it ended.",
    posterUrl: 'assets/tunnel 2016/captures/tunnel 2016.jpg',
    captures: [
      'assets/tunnel 2016/captures/tunnel 2016.jpg',
      'assets/tunnel 2016/captures/1.jpg',
      'assets/tunnel 2016/captures/2.jpg',
      'assets/tunnel 2016/captures/3.jpg',
      
    ],
    videos: [
      { title: 'Official Trailer', url: 'https://www.youtube.com/embed/GTsY-ol1ays?si=GLvHU9n5JgDgbvnK' }
    ]
  },
  {
    id: '3',
    title: 'Walking to School 2009',
    type: 'movie',
    status: 'watched',
    rating: 5,
    date: '2025-12-20',
    genres: ["Drama", "Children"],
    duration: "1h 20m",
    story: "This movie felt simple and quiet, but it stayed with us. It follows two children whose daily walk to school is full of challenges, turning an ordinary routine into a test of courage and responsibility. The story shows childhood, family care, and the value of education in a very honest way. It’s calm, emotional, and reminds you how small efforts can mean everything.",
    posterUrl: 'assets/walking to school 2009/captures/walking to school 2009.jpg',
    captures: [
      'assets/walking to school 2009/captures/walking to school 2009.jpg'
    ],
    videos: [
      { title: 'Official Trailer', url: 'https://www.youtube.com/embed/MyGef-nOr40?si=oqtNarlRWFjdnDrZ' }
    ]
  },
  {
    id: '4',
    title: 'Home Alone 1990',
    type: 'movie',
    rating: 5,
    status: 'watched',
    date: '2025-12-27',
    genres: ["Comedy", "Family"],
    duration: "1h 43m",
    story: "Watching Home Alone was pure fun and nostalgia. Kevin, left home alone by accident, uses clever tricks and his imagination to protect his house from two clumsy burglars. The movie is full of laughter, surprises, and heartwarming moments that make you cheer for him. It’s playful, funny, and perfect for a cozy movie night with a friend.",
    posterUrl: 'assets/home alone 1990/captures/home alone 1990.jpg',
    captures: [
      'assets/home alone 1990/captures/home alone 1990.jpg'
    ],
    videos: [
      { title: 'Classic Trailer', url: 'https://www.youtube.com/embed/jEDaVHmw7r4?si=VxcSSOUYB9iBseGG' }
    ]
  },
  {
    id: '5',
    title: 'Like Stars on Earth 2007',
    type: 'movie',
    status: 'upcoming',
    date: '2026-01-01',
    genres: ["Drama", "Family"],
    duration: "2h 42m",
    story: "Like Stars on Earth touched us deeply. It tells the story of a young boy struggling at school, misunderstood by everyone around him, until a caring teacher helps him discover his true potential. The movie is emotional, inspiring, and beautifully reminds us that everyone shines in their own way. It’s thoughtful, heartwarming, and perfect for a reflective movie night with a friend.",
    posterUrl: 'assets/like on stars on earth 2007/captures/Like Stars on Earth 2007.jpg',
    captures: [
      'assets/like on stars on earth 2007/captures/Like Stars on Earth 2007.jpg'
    ],
    videos: [
      { title: 'Official Trailer', url: 'https://www.youtube.com/embed/2LEyl7GGU38?si=YAGLonJlUtzAa1SU' }
    ]
  }
];

// Helper to get entries
export const getEntries = (): MovieEntry[] => {
  return BLOG_ENTRIES;
};

// No-op for saveEntries since we are using static code
export const saveEntries = (entries: MovieEntry[]): void => {
  console.log("Static blog mode: changes are not saved to local storage.");
};