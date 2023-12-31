const frontendBaseUrl = "http://127.0.0.1:5501";
const backendBaseUrl = "http://127.0.0.1:8000";

// 로그인 체크
function checkLogin() {
  const payload = localStorage.getItem("payload");
  if (payload) {
    window.location.replace(`${frontendBaseUrl}/`);
  }
}
checkLogin();

// 회원가입
async function handleSignin() {
  try {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordCheck = document.getElementById("password-check").value;
    const nickname = document.getElementById("nickname").value;
    const country = document.getElementById("country").value;
    const passwordPattern = /^(?=.*\d)(?=.*[~!@#$%^&amp;*]).{8,20}$/;

    const formData = new FormData();

    if (email == "" || password == "" || passwordCheck == "" || nickname == "" || country == "") {
      alert("모든 필수 정보를 입력해주세요.");
      return;
    }
    if (password != passwordCheck) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!passwordPattern.test(password)) {
      alert("비밀번호는 8자 이상 20자 이하 및 숫자와 특수 문자(#?!@$~%^&*-)를 하나씩 포함시켜야 합니다.");
      return;
    }
    formData.append("email", email);
    formData.append("password", password);
    formData.append("password_check", passwordCheck);
    formData.append("nickname", nickname);
    formData.append("country", country);

    const profileImageInput = document.getElementById("image");
    if (profileImageInput.files.length > 0) {
      formData.append("profile_img", profileImageInput.files[0]);
    }

    const response = await fetch(`${backendBaseUrl}/user/register/`, {
      method: "POST",
      body: formData,
    });
    return response;
  } catch (error) {
    alert("잘못된 접근입니다.");
  }
}

// 회원가입 버튼
async function handleSigninButton() {
  const response = await handleSignin();
  const responseJson = await response.json();

  if (response.status == 400 && responseJson["error"]["email"]) {
    alert(`이메일 에러 : ${responseJson["error"]["email"]}`);
    return;
  } else if (response.status == 400 && responseJson["error"]["nickname"]) {
    alert(`닉네임 에러 : ${responseJson["error"]["nickname"]}`);
    return;
  } else if (response.status == 400 && responseJson["error"]["password"]) {
    alert(`패스워드 에러 : ${responseJson["error"]["password"]}`);
    return;
  } else if (response.status == 400 && responseJson["error"]["country"]) {
    alert(`국가 선택 에러 : ${responseJson["error"]["country"]}`);
    return;
  } else if (response.status == 400) {
    alert(responseJson["error"]);
    return;
  } else if (response.status == 201) {
    alert("가입한 이메일로 인증 이메일이 발송되었습니다. 이메일을 확인해주세요.");
    window.location.replace(`${frontendBaseUrl}/user/login.html`);
    return;
  }
}
