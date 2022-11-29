export const TITLE_ID = "ED903";
export const BASE_URL = `https://${TITLE_ID}.playfabapi.com/Client`;

export const STRESS_TEST_OPTIONS = {
  stages: [
    { duration: "10s", target: 100 }, // below normal load
    { duration: "1m", target: 100 },
    { duration: "10s", target: 1400 }, // spike to 1400 users
    { duration: "3m", target: 1400 }, // stay at 1400 for 3 minutes
    { duration: "10s", target: 100 }, // scale down. Recovery stage.
    { duration: "3m", target: 100 },
    { duration: "10s", target: 0 },
  ],

  thresholds: {
    http_req_duration: ["p(99)<1500"], // 99% of requests must complete below 1.5s
  },
};

export const LOAD_TEST_OPTIONS = {
  stages: [
    { duration: "5m", target: 100 }, // simulate ramp-up of traffic from 1 to 100 users over 5 minutes.
    { duration: "10m", target: 100 }, // stay at 100 users for 10 minutes
    { duration: "5m", target: 0 }, // ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(99)<1500"], // 99% of requests must complete below 1.5s
    "logged in successfully": ["p(99)<1500"], // 99% of requests must complete below 1.5s
  },
};

export const RAMP_UP_OPTIONS = {
  stages: [
    { duration: "5m", target: 60 }, // simulate ramp-up of traffic from 1 to 60 users over 5 minutes.
    { duration: "10m", target: 60 }, // stay at 60 users for 10 minutes
    { duration: "3m", target: 100 }, // ramp-up to 100 users over 3 minutes (peak hour starts)
    { duration: "2m", target: 100 }, // stay at 100 users for short amount of time (peak hour)
    { duration: "3m", target: 60 }, // ramp-down to 60 users over 3 minutes (peak hour ends)
    { duration: "10m", target: 60 }, // continue at 60 for additional 10 minutes
    { duration: "5m", target: 0 }, // ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(99)<1500"], // 99% of requests must complete below 1.5s
  },
};
