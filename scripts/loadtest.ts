import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const filmEndpointDuration = new Trend('film_endpoint_duration');
const filmErrorRate = new Rate('film_endpoint_errors');

export const options = {
  stages: [
    { duration: '30s', target: 10 },  
    { duration: '1m', target: 100 },    
    { duration: '2m', target: 1000 },   
    { duration: '5m', target: 1000 },   
    { duration: '2m', target: 100 },  
    { duration: '1m', target: 10 },    
    { duration: '30s', target: 0 }       
  ],
  thresholds: {
    'film_endpoint_duration': ['p(95)<500'], 
    'film_endpoint_errors': ['rate<0.01']    
  }
};

const BASE_URL = 'http://localhost:3000/api/';

// Prioritized endpoints
const criticalEndpoints = [
  '/films',              
  '/films/popular',     
  '/films/search',       
  '/films/top10',  
  '/announcements',
  '/announcements/retrieve',
  '/recommendations'     
];

export default function () {
  group('Film Endpoints Performance', () => {
    criticalEndpoints.forEach((endpoint) => {
      const url = `${BASE_URL}${endpoint}`;
      const res = http.get(url);
      
      // Track performance metrics
      filmEndpointDuration.add(res.timings.duration);
      
      const checkResult = check(res, {
        [`${endpoint} - status 200`]: (r) => r.status === 200,
        [`${endpoint} - response time < 500ms`]: (r) => r.timings.duration < 500,
      });
      
      // Track error rate
      filmErrorRate.add(!checkResult);
      
      sleep(1);
    });
  });
}
