// 카카오 로그인 페이지로 이동
async function kakaoLogin() {
    const response = await fetch(`${backend_base_url}/user/social/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ social: "kakao" }),
    });
    const data_url = await response.json();
    const response_url = data_url.url;
    window.location.href = response_url;
  }
  
  // 구글 로그인 페이지로 이동
  async function googleLogin() {
    const response = await fetch(`${backend_base_url}/user/social/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ social: "google" }),
    });
    const data_url = await response.json();
    const response_url = data_url.url;
    window.location.href = response_url;
  }
  
  // 네이버 로그인 페이지로 이동
  async function naverLogin() {
    const response = await fetch(`${backend_base_url}/user/social/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ social: "naver" }),
    });
    const data_url = await response.json();
    const response_url = data_url.url;
    window.location.href = response_url;
  }
  