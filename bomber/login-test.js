import http from "k6/http";
import { check, group, sleep, fail } from "k6";

export const options = {
  vus: 3, // X user looping for Y seconds
  duration: "3s",
};

const TITLE_ID = "ED903";
const BASE_URL = `https://${TITLE_ID}.playfabapi.com/Client`;
const USERNAME = "Test2";
const PASSWORD = "123456";

export const setup = () => {
  console.log("START LOGIN TEST");
};

export default () => {
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
  console.log("status", respSuccess.status);
  check(loginRes, {
    "logged in successfully": (resp) => resp.json("status") === "OK",
  });

  sleep(1);
};
