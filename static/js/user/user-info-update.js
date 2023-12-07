window.onload = () => {
  console.log("회원정보 수정 페이지 로드됨.");
  renderPage();
};

async function renderPage() {
  try {
    // 로그인 체크
    if (localStorage.getItem("access")) {
      const payload = localStorage.getItem("payload");
      const payloadParse = JSON.parse(payload);
      const requestUserEmail = payloadParse.email;

      const response = await fetch(`${backendBaseUrl}/user/info/`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("access"),
        },
      });

      const responseJson = await response.json();
      const data = responseJson.user_info;

      document.getElementById("current-profile-img").src = `${backendBaseUrl}/${data["profile_img"]}`;
      document.getElementById("email").value = requestUserEmail;
      document.getElementById("nickname").value = data["nickname"];

      const myCountry = data["country"];
      const countrySelect = document.getElementById("country");

      for (let i = 0; i < countrySelect.options.length; i++) {
        if (countrySelect.options[i].value === myCountry) {
          countrySelect.options[i].selected = true;
          break;
        }
      }
    } else {
      window.location.href = `${frontendBaseUrl}`;
    }
    // 프로필사진 미리보기
    const profileImgInput = document.getElementById("profile-img");
    profileImgInput.addEventListener("change", handleImagePreview);
  } catch (error) {
    alert("잘못된 접근입니다.");
  }
}

// 프로필사진 미리보기
function handleImagePreview() {
  const profileImgInput = document.getElementById("profile-img");
  const previewImg = document.getElementById("current-profile-img");
  const payload = localStorage.getItem("payload");
  const payloadParse = JSON.parse(payload);

  if (profileImgInput.files && profileImgInput.files[0]) {
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      previewImg.src = target.result;
    };
    reader.readAsDataURL(profileImgInput.files[0]);
  }
  // '선택된 파일 없음'일 때, 현재 프로필사진
  else {
    previewImg.src = `${backendBaseUrl}` + payloadParse.profile_img;
  }
}

// 비밀번호 수정 모달
function openPasswordUpdateModal() {
  const passwordModal = document.getElementById("password-modal");

  if (passwordModal.style.display == "none") {
    passwordModal.style.display = "block";
  } else if (passwordModal.style.display == "block") {
    passwordModal.style.display = "none";

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
    const response = await fetch(`${backendBaseUrl}/user/info/`, {
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
    const responseJson = await response.json();
    const status = responseJson["status"];

    if (status == "200" && response.status == 200) {
      alert(`${responseJson["success"]}`);
      openPasswordUpdateModal(); // 수정 성공 시에만 모달 닫기
      return;
    } else if (status == "400" && response.status == 400 && responseJson["error"]["password"]) {
      alert(`${responseJson["error"]["password"]}`);
      return;
    } else if (status == "400" && response.status == 400) {
      alert(`${responseJson["error"]}`);
      return;
    } else if (status == "401" && response.status == 401) {
      alert(`${responseJson["error"]}`);
      return;
    }
  } catch (error) {
    alert("새로고침 후 다시 시도해주세요.");
  }
}

// 회원 탈퇴 모달
function openUserDeleteModal() {
  const deldetModal = document.getElementById("delete-modal");

  if (deldetModal.style.display == "none") {
    deldetModal.style.display = "block";
    return;
  } else if (deldetModal.style.display == "block") {
    deldetModal.style.display = "none";

    document.getElementById("password").value = "";
    return;
  }
}

// 회원 탈퇴
async function userDeleteButton() {
  const password = document.getElementById("password").value;

  try {
    if (password != "") {
      const response = await fetch(`${backendBaseUrl}/user/info/`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("access"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: password }),
      });

      const responseJson = await response.json();
      const status = responseJson["status"];

      if (status == "204") {
        alert(`${responseJson["success"]}`);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("payload");
        localStorage.removeItem("code");
        window.location.replace(`${frontendBaseUrl}/`);
        return;
      } else if (status == "400" && response.status == 400) {
        alert(`${responseJson["error"]}`);
        return;
      } else if (status == "401" && response.status == 401) {
        alert(`${responseJson["error"]}`);
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

  if (country == "") {
    alert("Please Select Your Country");
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
    const response = await fetch(`${backendBaseUrl}/user/info/`, {
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

  if (response) {
    const responseJson = await response.json();
    const status = responseJson["status"];

    if (status == "200" && response.status == 200) {
      alert(`${responseJson["success"]}`);
      window.location.replace(`${frontendBaseUrl}/user/user-info-update.html`);
    } else if (status == "400" && response.status == 400 && responseJson["error"]["nickname"]) {
      alert(`${responseJson["error"]["nickname"]}`);
    }
  }
}
