// This script adds the ABIM episodes with their watched dates
// Run: node add-episodes.js

const episodes = [
  { number: 1, title: 'Episode 1', date: '2026-01-13' },
  { number: 2, title: 'Episode 2', date: '2026-01-20' },
  { number: 3, title: 'Episode 3', date: '2026-01-27' },
  { number: 4, title: 'Episode 4', date: '2026-02-03' },
  { number: 5, title: 'Episode 5', date: '2026-02-10' },
  { number: 6, title: 'Episode 6', date: '2026-02-17' },
  { number: 7, title: 'Episode 7', date: '2026-02-24' }
];

console.log('Episodes to add to ABIM:');
console.log(JSON.stringify(episodes, null, 2));
console.log('\nYou can now go to Admin Panel > Edit Episodes for ABIM');
console.log('And add these episodes with their dates through the UI');
