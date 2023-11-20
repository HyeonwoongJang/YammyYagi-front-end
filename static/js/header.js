const frontend_base_url = "https://www.yummyyagi.com";
const backend_base_url = "https://api.yummyyagi.com";

// header 적용
async function injectHeader() {
    fetch("../header.html")
        .then(response => response.text())
        .then(data => {
            document.querySelector("header").innerHTML = data;

            const loginButton = document.getElementById("login-hamburger-button");
            const logoutButton = document.getElementById("logout-hamburger-button");
            const payload = localStorage.getItem("payload");
            if (payload) {
                // 로그인 상태일 때
                loginButton.style.display = "block";
                logoutButton.style.display = "none";
            } else {
                // 로그아웃 상태일 때
                loginButton.style.display = "none";
                logoutButton.style.display = "block";
            }
            loginButton.addEventListener("click", function () {
                // 로그인시 모달
                updateLoginModal();
                $('#myLoginModal').modal('show');
            });
        
            logoutButton.addEventListener("click", function () {
                // 로그아웃시 모달
                $('#myLogoutModal').modal('show');
            });
        })
        .catch(error => {
            console.error("Error injecting header:", error);
        });
}
injectHeader();

// 로그인 모달 값 가져오기
async function updateLoginModal() {
    try {
        const response = await fetch(`${backend_base_url}/user/mypage/`, {
            method: "GET",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("access"),
                "Content-Type": "application/json",
                },
            })
        if (response.status == 200) {
            const response_json = await response.json()

            const modalProfileImg = document.getElementById("modalProfileImg");
            const modalNickname = document.querySelector(".modal-nickname");
            const modalUserEmail = document.querySelector(".modal-useremail");
        
            modalProfileImg.src = `${backend_base_url}` + response_json.my_data.profile_img;
            modalNickname.textContent = response_json.my_data.nickname;
            modalUserEmail.textContent = response_json.my_data.email;

            return response_json
        } else {
            alert("유저 정보를 불러오는데 실패했습니다")
        }
    } catch (error) {
        alert("새로고침 후 다시 시도해주세요.");
    }


}

// 로그아웃 (handleLogout()는 navbar.js에 있음)
function handleLogout() {
    localStorage.removeItem("access")
    localStorage.removeItem("refresh")
    localStorage.removeItem("payload")
    location.reload()
    window.location.replace(`${frontend_base_url}/story/`)
}