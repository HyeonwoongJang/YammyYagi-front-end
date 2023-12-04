const frontendBaseUrl = "http://127.0.0.1:5501";
const backendBaseUrl = "http://127.0.0.1:8000";

window.onload = async function () {
  startSocialLogin();
};

async function startSocialLogin() {
  if (location.href.split("=")[1]) {
    // 현재 URL에서 쿼리스트링 파라미터 추출
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get("code");

    if (code) {
      localStorage.setItem("code", code);
      socialLoginAPI(code);
    }
  }
}

// 소셜 로그인
const currentUrl = location.href;
async function socialLoginAPI(code) {
  if (currentUrl.includes("state")) {
    naverLoginApi(code);
  } else if (currentUrl.includes("scope")) {
    googleLoginApi(code);
  } else {
    kakaoLoginApi(code);
  }
}

// 카카오 로그인 데이터 서버로 전송
async function kakaoLoginApi(code) {
  try {
    const response = await fetch(`${backendBaseUrl}/user/kakao/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: code }),
    });
    responseJson = await response.json();
    if (!response.ok) {
      alert(responseJson["error"]);
      window.location.href = `${frontendBaseUrl}`;
      return;
    }
    saveToken(responseJson);
  } catch (error) {
    console.log(error);
  }
}

// 네이버 로그인 데이터 서버로 전송
async function naverLoginApi(code) {
  try {
    const response = await fetch(`${backendBaseUrl}/user/naver/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: code }),
    });
    responseJson = await response.json();
    if (!response.ok) {
      alert(responseJson["error"]);
      window.location.href = `${frontendBaseUrl}`;
      return;
    }
    saveToken(responseJson);
  } catch (error) {
    console.log(error);
  }
}

// 구글 로그인 데이터 서버로 전송
async function googleLoginApi(code) {
  try {
    const response = await fetch(`${backendBaseUrl}/user/google/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: code }),
    });
    responseJson = await response.json();
    if (!response.ok) {
      alert(responseJson["error"]);
      window.location.href = `${frontendBaseUrl}`;
      return;
    }
    saveToken(responseJson);
  } catch (error) {
    console.log(error);
  }
}

// access, refresh, payload localstorage에 저장
async function saveToken(responseJson) {
  localStorage.setItem("access", responseJson.access);
  localStorage.setItem("refresh", responseJson.refresh);
  const base64Url = responseJson.access.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  localStorage.setItem("payload", jsonPayload);
  window.location.href = `${frontendBaseUrl}`;
}
