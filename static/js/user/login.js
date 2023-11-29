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

async function handleLogin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email && !password) {
    alert("모든 필수 정보를 입력해주세요.");
    return;
  }

  try {
    const response = await fetch(`${backend_base_url}/user/login/`, {
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const response_json = await response.json();
    if (response_json["status"] == "404") {
      alert(`${response_json["error"]}`);
      return;
    } else if (response_json["status"] == "401") {
      alert(`${response_json["error"]}`);
      return;
    } else if (response_json["status"] == "403") {
      alert(`${response_json["error"]}`);
      return;
    } else if (response.status == 200) {
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
      alert("환영합니다.");
      window.location.replace(`${frontend_base_url}`);
      return;
    }
  } catch (error) {
    alert("새로고침 후 다시 시도해주세요.");
  }
}

// 비밀번호 재설정 팝업을 열기 위한 비동기 함수
async function resetPassword() {
  // 새 창으로 열기
  window.open("pop-up.html", "비밀번호 찾기", "width=400, height=300, top=10, left=10");
}

// 비밀번호 재설정 링크를 이메일로 보내는 비동기 함수
async function sendEmail() {
  // 이메일 입력 필드에서 이메일 값 가져오기
  const email = document.getElementById("email-for-pw").value;

  const response = await fetch(`${backend_base_url}/user/pwd-reset/`, {
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      email: email,
    }),
  });
  const response_json = await response.json();
  if (response_json["status"] == "400") {
    alert(`${response_json["error"]}`);
    return;
  } else if (response_json["status"] == "200") {
    alert(`${response_json["success"]}`);
    return;
  }
}
