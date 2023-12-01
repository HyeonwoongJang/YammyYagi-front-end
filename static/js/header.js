const frontendBaseUrl = "http://127.0.0.1:5501";
const backendBaseUrl = "http://127.0.0.1:8000";

// header 적용
async function injectHeader() {
  fetch("../header.html")
    .then((response) => response.text())
    .then((data) => {
      document.querySelector("header").innerHTML = data;

      const loginButton = document.getElementById("login-hamburger-button");
      const logoutButton = document.getElementById("nav-right-logout");
      const create_story_button = document.getElementById("create-story-button");
      const payload = localStorage.getItem("payload");
      if (payload) {
        // 로그인 상태일 때
        loginButton.style.display = "block";
        logoutButton.style.display = "none";
        create_story_button.style.display = "block";
      } else {
        // 로그아웃 상태일 때
        loginButton.style.display = "none";
        logoutButton.style.display = "block";
        create_story_button.style.display = "none";
      }
      loginButton.addEventListener("click", function () {
        // 로그인시 모달
        updateLoginModal();
        $("#myLoginModal").modal("show");
      });
    })
    .catch((error) => {
      console.error("Error injecting header:", error);
    });
}
injectHeader();

// 로그인 모달 값 가져오기
async function updateLoginModal() {
  try {
    const response = await fetch(`${backendBaseUrl}/user/mypage/`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("access"),
        "Content-Type": "application/json",
      },
    });
    if (response.status == 200) {
      const response_json = await response.json();

      const modalProfileImg = document.getElementById("modalProfileImg");
      const modalNickname = document.querySelector(".modal-nickname");
      const modalUserEmail = document.querySelector(".modal-useremail");

      modalProfileImg.src = `${backendBaseUrl}` + response_json.my_data.profile_img;
      modalNickname.textContent = response_json.my_data.nickname;
      modalUserEmail.textContent = response_json.my_data.email;

      return response_json;
    } else {
      alert("유저 정보를 불러오는데 실패했습니다");
    }
  } catch (error) {
    alert("새로고침 후 다시 시도해주세요.");
  }
}

// 로그아웃 (handleLogout()는 navbar.js에 있음)
function handleLogout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("payload");
  localStorage.removeItem("code");
  location.reload();
  window.location.replace(`${frontendBaseUrl}/`);
}

// 1시간 후 자동 로그아웃 설정
function setAutoLogout() {
  setTimeout(function () {
    alert("로그인 1시간 초과로 자동 로그아웃 됐습니다.");
    handleLogout();
  }, 60 * 60 * 1000); // 밀리초 단위로 적어야 함
}
setAutoLogout();

function ticketPurchasing() {
  window.open(
    "../user/payment.html",
    "티켓 결제 페이지",
    "width=700, height=700, top=50%, left=50%, transform=translate(-50%, -50%)"
  );
}

//티켓 수량을 불러오는 함수
const payload = localStorage.getItem("payload");
if (payload) {
  fetch(`${backendBaseUrl}/user/usertickets/`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("access"),
    },
  })
    .then((response) => response.json())
    .then((ticketData) => {
      const goldenTicketCount = ticketData.golden_ticket_count;
      const silverTicketCount = ticketData.silver_ticket_count;
      const pinkTicketCount = ticketData.pink_ticket_count;

      document.getElementById("golden-ticket-count").innerText = goldenTicketCount;
      document.getElementById("silverticket-count").innerText = silverTicketCount;
      document.getElementById("pink-ticket-count").innerText = pinkTicketCount;
    })
    .catch((error) => console.error("Error:", error));
}
