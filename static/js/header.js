const frontend_base_url = "http://127.0.0.1:5501";
const backend_base_url = "http://127.0.0.1:8000";


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
function updateLoginModal() {
    const modalProfileImg = document.getElementById("modalProfileImg");
    const modalNickname = document.querySelector(".modal-nickname");
    const modalUserEmail = document.querySelector(".modal-useremail");

    const payload = localStorage.getItem("payload");
    const payload_parse = JSON.parse(payload);

    if (payload) {
        modalProfileImg.src = `${backend_base_url}` + payload_parse.profile_img;
        modalNickname.textContent = payload_parse.nickname;
        modalUserEmail.textContent = payload_parse.email;
    }
}