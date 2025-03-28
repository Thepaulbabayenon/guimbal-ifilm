import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },  
    { duration: '5m', target: 1000 }, 
    { duration: '3m', target: 100 }, 
    { duration: '1m', target: 0 },   
  ],
};

const pages = [
  '/home',
  '/home/announcements',
  '/home/films',
  '/home/playlist',
  '/home/recently',
  '/home/recommendations',
];

export default function () {
  const params = {
    timeout: '120s', 
    redirects: 5, 
    tags: { name: 'LoadTest' },
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Connection': 'keep-alive',
    },
    http2: true,
    insecureSkipTLSVerify: true,
  };

  pages.forEach((page) => {
    const res = http.get(`https://www.thebantayanfilmfestival.com${page}`, params);

    check(res, {
      [`${page} status is 200`]: (r) => r.status === 200,
      [`${page} response time < 1000ms`]: (r) => r.timings.duration < 1000,
    });

    sleep(1);
  });
}
