import http from "k6/http";
import { check, group, sleep, fail } from "k6";

export const TITLE_ID = "ED903";
export const BASE_URL = `https://${TITLE_ID}.playfabapi.com/Client`;
export const BASE_CLOUD_SCRIPT_URL = `https://${TITLE_ID}.playfabapi.com/ExecuteCloudScript`;

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
    { duration: "1m", target: 200 }, // simulate ramp-up of traffic from 1 to 100 users over 5 minutes.
    { duration: "2m", target: 1000 }, // stay at 100 users for 10 minutes
    { duration: "2m", target: 0 }, // ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(99)<1500"], // 99% of requests must complete below 1.5s
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

export const options = {
  vus: 1,
  duration: "3s",
};

const USERNAME = "Test2";
const PASSWORD = "123456";

export default () => {
  group("simple user journey", function () {
    // login
    const params = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const payload = JSON.stringify({
      TitleId: TITLE_ID,
      username: USERNAME,
      password: PASSWORD,
    });

    const loginRes = http.post(`${BASE_URL}/LoginWithPlayFab`, payload, params);
    const respSuccess = loginRes.json();

    const isSuccess = check(loginRes, {
      "logged in successfully": (resp) => resp.json("code") === 200,
    });

    if (!isSuccess) {
      fail("Login fall", loginRes);
    }

    const { SessionTicket, PlayFabId } = respSuccess.data;

    params.headers["X-Authorization"] = SessionTicket;

    // get user's inventory & category items
    const responses = http.batch([
      ["POST", `${BASE_URL}/GetUserInventory`, null, params],
      [
        "POST",
        `${BASE_URL}/GetCatalogItems`,
        JSON.stringify({ CatalogVersion: "Power-ups" }),
        params,
      ],
    ]);
    check(responses[0], {
      "GetUserInventory 200": (res) => {
        const data = res.json();
        return data.code === 200;
      },
    });
    check(responses[1], {
      "Category 200": (res) => {
        const data = res.json();
        return data.code === 200;
      },
    });

    // call start game
    const resStartGame = http.post(
      `${BASE_CLOUD_SCRIPT_URL}`,
      JSON.stringify({
        FunctionName: "ClientStartGame",
      }),
      params
    );
    check(resStartGame, {
      "resStartGame 200": (res) => {
        const data = res.json();
        return data.code === 200;
      },
    });

    sleep(12);

    // call end game
    const callEndGame = http.post(
      `${BASE_CLOUD_SCRIPT_URL}`,
      JSON.stringify({
        FunctionName: "ClientWinGame",
        FunctionParameter: {
          TokenInGame: 1,
          IdTest: PlayFabId,
        },
      }),
      params
    );
    check(callEndGame, {
      "callEndGame 200": (res) => {
        const data = res.json();
        return data.code === 200;
      },
    });
  });
};
