window.onload = async function () {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const code = urlParams.get('code');

  if (code){
    kakaoLoginApi(code)
}
};


// 카카오 로그인 페이지로 이동
async function kakaoLogin() {
  const response = await fetch(`${backend_base_url}/user/social/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "social": "kakao" }),
    });
    const data_url = await response.json();
    const response_url = data_url.url;
    window.location.href = response_url;
  }

// 카카오 로그인 데이터 서버로 전송
async function kakaoLoginApi(code) {

    const response = await fetch(`${backend_base_url}/user/kakao/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ "code": code }),
    })
    response_json = await response.json()
  
    if (response.status === 200) {
      localStorage.setItem("access", response_json.access);
      localStorage.setItem("refresh", response_json.refresh);

      const base64Url = response_json.access.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(function (c) {
          return '%' + (
            '00' + c.charCodeAt(0).toString(16)
          ).slice(-2);
        }).join('')
      );
      localStorage.setItem("payload", jsonPayload);
      window.location.href = `${frontend_base_url}`
    } else {
      alert(response_json['error'])
      window.location.href = `${frontend_base_url}`
    }
  }


// 로그인 처리
if (localStorage.getItem("kakao")) {
  window.onload.href = `${frontend_base_url}`
} else if (location.href.split('=')[1]) {
  const currentUrl = location.href;
  console.log("url", currentUrl);

  // 현재 URL에서 쿼리스트링 파라미터 추출
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const state = location.href.split('=')[2];

  // 로그인을 위한 인가 코드 추출
  const code = urlParams.get('code');

  if (code) {
    // 로컬 스토리지에 인가 코드 저장
    localStorage.setItem('code', code);
      console.log('인가 코드:', code);
      localStorage.setItem('code', code);
      kakaoLoginApi(code);
    }
  } else {
    console.log('인가 코드가 존재하지 않습니다.');
  }


// 만약 로그인 후에 패스워드 만료 여부를 확인해야 한다면
if (localStorage.getItem("payload")) {
  if (JSON.parse(localStorage.getItem("payload")).password_expired == true) {
    expired_password_confirm();
  }
}



