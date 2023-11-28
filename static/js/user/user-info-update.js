window.onload = () => {
  console.log("회원정보 수정 페이지 로드됨.");
  renderPage();
};

async function renderPage() {
  try {
    // 로그인 체크
    if (localStorage.getItem("access")) {
      const payload = localStorage.getItem("payload");
      const payload_parse = JSON.parse(payload);
      const request_user_email = payload_parse.email;

      const response = await fetch(`${backend_base_url}/user/info/`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("access"),
        },
      });

      const response_json = await response.json();
      const data = response_json.user_info;

      document.getElementById("current-profile-img").src = `${backend_base_url}/${data["profile_img"]}`;
      document.getElementById("email").value = request_user_email;
      document.getElementById("nickname").value = data["nickname"];

      const my_country = data["country"];
      const country_select = document.getElementById("country");

      for (let i = 0; i < country_select.options.length; i++) {
        if (country_select.options[i].value === my_country) {
          country_select.options[i].selected = true;
          break;
        }
      }
    } else {
      alert("잘못된 접근입니다.");
      window.location.href = `${frontend_base_url}/index.html`;
    }
    // 프로필사진 미리보기
    const profile_img_input = document.getElementById("profile-img");
    profile_img_input.addEventListener("change", handleImagePreview);
  } catch (error) {
    alert("잘못된 접근입니다.");
  }
}

// 프로필사진 미리보기
function handleImagePreview() {
  const profile_img_input = document.getElementById("profile-img");
  const preview_img = document.getElementById("current-profile-img");
  const payload = localStorage.getItem("payload");
  const payload_parse = JSON.parse(payload);

  if (profile_img_input.files && profile_img_input.files[0]) {
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      preview_img.src = target.result;
    };
    reader.readAsDataURL(profile_img_input.files[0]);
  }
  // '선택된 파일 없음'일 때, 현재 프로필사진
  else {
    preview_img.src = `${backend_base_url}` + payload_parse.profile_img;
  }
}

// 비밀번호 수정 모달
function openPasswordUpdateModal() {
  const password_modal = document.getElementById("password-modal");

  if (password_modal.style.display == "none") {
    password_modal.style.display = "block";
  } else if (password_modal.style.display == "block") {
    password_modal.style.display = "none";

    document.getElementById("current-password").value = "";
    document.getElementById("new-password").value = "";
    document.getElementById("new-password-check").value = "";
  }
}

// 비밀번호 수정
async function updatePasswordButton() {
  const current_password = document.getElementById("current-password").value;
  const new_password = document.getElementById("new-password").value;
  const new_password_check = document.getElementById("new-password-check").value;
  const password_pattern = /^(?=.*\d)(?=.*[~!@#$%^&amp;*]).{8,20}$/;

  if (!current_password || !new_password || !new_password_check) {
    alert("모든 필수 정보를 입력해주세요.");
    return;
  }
  if (new_password != new_password_check) {
    alert("새 비밀번호가 새 비밀번호 확인과 일치하지 않습니다.");
    return;
  }
  if (!password_pattern.test(new_password)) {
    alert("비밀번호는 8자 이상 20자 이하 및 숫자와 특수 문자(#?!@$~%^&*-)를 하나씩 포함시켜야 합니다.");
    return;
  }
  try {
    const response = await fetch(`${backend_base_url}/user/info/`, {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("access"),
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        current_password: current_password,
        new_password: new_password,
        new_password_check: new_password_check,
      }),
    });
    const response_json = await response.json();
    const status = response_json["status"];

    if (status == "200" && response.status == 200) {
      alert(`${response_json["success"]}`);
      openPasswordUpdateModal(); // 수정 성공 시에만 모달 닫기
      return;
    } else if (status == "400" && response.status == 400 && response_json["error"]["password"]) {
      alert(`${response_json["error"]["password"]}`);
      return;
    } else if (status == "400" && response.status == 400) {
      alert(`${response_json["error"]}`);
      return;
    } else if (status == "401" && response.status == 401) {
      alert(`${response_json["error"]}`);
      return;
    }
  } catch (error) {
    alert("새로고침 후 다시 시도해주세요.");
  }
}

// 회원 탈퇴 모달
function openUserDeleteModal() {
  const delete_modal = document.getElementById("delete-modal");

  if (delete_modal.style.display == "none") {
    delete_modal.style.display = "block";
    return;
  } else if (delete_modal.style.display == "block") {
    delete_modal.style.display = "none";

    document.getElementById("password").value = "";
    return;
  }
}

// 회원 탈퇴
async function userDeleteButton() {
  const password = document.getElementById("password").value;

  try {
    if (password != "") {
      const response = await fetch(`${backend_base_url}/user/info/`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("access"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: password }),
      });

      const response_json = await response.json();
      const status = response_json["status"];

      if (status == "204") {
        alert(`${response_json["success"]}`);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("payload");
        localStorage.removeItem("code");
        window.location.replace(`${frontend_base_url}/index.html`);
        return;
      } else if (status == "400" && response.status == 400) {
        alert(`${response_json["error"]}`);
        return;
      } else if (status == "401" && response.status == 401) {
        alert(`${response_json["error"]}`);
        return;
      }
    } else {
      alert("비밀번호를 입력해주세요.");
      return;
    }
  } catch (error) {
    alert("다시 시도해주세요.");
  }
}

// 회원 정보 수정
async function handleUpdate() {
  const nickname = document.getElementById("nickname").value;
  const country = document.getElementById("country").value;

  if (nickname.trim() == "") {
    alert("닉네임을 입력해주세요");
    return;
  }

  const data = new FormData();
  data.append("nickname", nickname);
  data.append("country", country);

  const profileImageInput = document.getElementById("profile-img");
  if (profileImageInput.files.length > 0) {
    data.append("profile_img", profileImageInput.files[0]);
  }

  try {
    const response = await fetch(`${backend_base_url}/user/info/`, {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("access"),
      },
      body: data,
    });

    return response;
  } catch (error) {
    console.error("오류", error);
  }
}

async function updateButton() {
  const response = await handleUpdate();
  const response_json = await response.json();
  const status = response_json["status"];

  if (status == "200" && response.status == 200) {
    alert(`${response_json["success"]}`);
    window.location.replace(`${frontend_base_url}/user/user-info-update.html`);
  } else if (status == "400" && response.status == 400 && response_json["error"]["nickname"]) {
    alert(`${response_json["error"]["nickname"]}`);
  }
}
