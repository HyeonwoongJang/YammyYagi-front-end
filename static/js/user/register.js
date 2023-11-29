const frontend_base_url = "http://127.0.0.1:5501";
const backend_base_url = "http://127.0.0.1:8000";

// 로그인 체크
function checkLogin() {
  const payload = localStorage.getItem("payload");
  if (payload) {
    window.location.replace(`${frontend_base_url}/`);
  }
}
checkLogin();

// 회원가입
async function handleSignin() {
  try {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const password_check = document.getElementById("password_check").value;
    const nickname = document.getElementById("nickname").value;
    const country = document.getElementById("country").value;
    const password_pattern = /^(?=.*\d)(?=.*[~!@#$%^&amp;*]).{8,20}$/;

    const formData = new FormData();

    if (email == "" || password == "" || password_check == "" || nickname == "" || country == "") {
      alert("모든 필수 정보를 입력해주세요.");
      return;
    }
    if (password != password_check) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!password_pattern.test(password)) {
      alert("비밀번호는 8자 이상 20자 이하 및 숫자와 특수 문자(#?!@$~%^&*-)를 하나씩 포함시켜야 합니다.");
      return;
    }
    formData.append("email", email);
    formData.append("password", password);
    formData.append("password_check", password_check);
    formData.append("nickname", nickname);
    formData.append("country", country);

    const profileImageInput = document.getElementById("image");
    if (profileImageInput.files.length > 0) {
      formData.append("profile_img", profileImageInput.files[0]);
    }

    const social_code = localStorage.getItem("code");

    if (social_code) {
      const response = await fetch(`${backend_base_url}/user/social-register/`, {
        method: "POST",
        body: formData,
      });
      return response;
    } else {
      const response = await fetch(`${backend_base_url}/user/register/`, {
        method: "POST",
        body: formData,
      });
      return response;
    }
  } catch (error) {
    alert("잘못된 접근입니다.");
  }
}

// 회원가입 버튼
async function handleSigninButton() {
  const code = localStorage.getItem("code");
  const response = await handleSignin();
  response_json = await response.json();

  if (response.status == 400 && response_json["error"]["email"]) {
    alert(`이메일 에러 : ${response_json["error"]["email"]}`);
    return;
  } else if (response.status == 400 && response_json["error"]["nickname"]) {
    alert(`닉네임 에러 : ${response_json["error"]["nickname"]}`);
    return;
  } else if (response.status == 400 && response_json["error"]["password"]) {
    alert(`패스워드 에러 : ${response_json["error"]["password"]}`);
    return;
  } else if (response.status == 400 && response_json["error"]["country"]) {
    alert(`국가 선택 에러 : ${response_json["error"]["country"]}`);
    return;
  } else if (response.status == 400) {
    alert(response_json["error"]);
    return;
  } else if (response.status == 201) {
    if (code) {
      alert("회원가입이 완료되었습니다. 소셜 로그인과 연동되었습니다.");
      window.location.replace(`${frontend_base_url}/user/login.html`);
      return;
    } else {
      alert("가입한 이메일로 인증 이메일이 발송되었습니다. 이메일을 확인해주세요.");
      window.location.replace(`${frontend_base_url}/user/login.html`);
      return;
    }
  }
}

// // 카카오 로그인 페이지로 이동
// async function kakaoLogin() {
//   const response = await fetch(`${backend_base_url}/user/social/`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ social: "kakao" }),
//   });
//   const data_url = await response.json();
//   const response_url = data_url.url;
//   window.location.href = response_url;
// }

// // 구글 로그인 페이지로 이동
// async function googleLogin() {
//   const response = await fetch(`${backend_base_url}/user/social/`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ social: "google" }),
//   });
//   const data_url = await response.json();
//   const response_url = data_url.url;
//   window.location.href = response_url;
// }

// // 네이버 로그인 페이지로 이동
// async function naverLogin() {
//   const response = await fetch(`${backend_base_url}/user/social/`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ social: "naver" }),
//   });
//   const data_url = await response.json();
//   const response_url = data_url.url;
//   window.location.href = response_url;
// }
