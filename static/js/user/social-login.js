// 카카오 로그인 데이터 서버로 전송
async function kakaoLoginApi(code) {
  try {
    const response = await fetch(`${backend_base_url}/user/kakao/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: code }),
    });
    response_json = await response.json();
    if (response.status === 200) {
      localStorage.setItem("access", response_json.access);
      localStorage.setItem("refresh", response_json.refresh);
      const base64Url = response_json.access.split(".")[1];
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
      window.location.href = `${frontend_base_url}`;
    } else {
      alert(response_json["error"]);
      window.location.href = `${frontend_base_url}`;
    }
  } catch {
    window.location.href = `${frontend_base_url}/user/social-register.html`;
  }
}

// 네이버 로그인 데이터 서버로 전송
async function naverLoginApi(code) {
  try {
    const response = await fetch(`${backend_base_url}/user/naver/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: code }),
    });
    response_json = await response.json();
    if (response.status === 200) {
      localStorage.setItem("access", response_json.access);
      localStorage.setItem("refresh", response_json.refresh);
      const base64Url = response_json.access.split(".")[1];
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
      window.location.href = `${frontend_base_url}`;
    } else {
      alert(response_json["error"]);
      window.location.href = `${frontend_base_url}`;
    }
  } catch {
    window.location.href = `${frontend_base_url}/user/social-register.html`;
  }
}

// 로그인 처리
const currentUrl = location.href;

if (location.href.split("=")[1]) {
  // 현재 URL에서 쿼리스트링 파라미터 추출
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  // 로그인을 위한 인가 코드 추출
  const code = urlParams.get("code");
  console.log(code);

  if (code) {
    localStorage.setItem("code", code);
    if (currentUrl.includes("state")) {
      naverLoginApi(code);
    } else {
      kakaoLoginApi(code);
    }
  }
}
