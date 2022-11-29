import http from "k6/http";
import { check, group, sleep, fail } from "k6";
import { LOAD_TEST_OPTIONS, BASE_URL } from "./config";
export const options = LOAD_TEST_OPTIONS;

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

    check(loginRes, {
      "logged in successfully": (resp) => resp.json("status") === "OK",
    });
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
      "GetUserInventory 200": (res) => res.status === 200,
    });
    check(responses[1], {
      "main page status was 200": (res) => res.status === 200,
    });
  });
};
