const frontend_base_url = "http://127.0.0.1:5501";
const backend_base_url = "http://127.0.0.1:8000";

window.onload = () => {
    console.log("로그인 페이지 로드됨.")

    if (localStorage.getItem("access")) {
        alert("잘못된 접근입니다.")
        window.location.href = `${frontend_base_url}/story/`
    }
}

async function handleLogin() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email && !password) {
        alert("모든 필수 정보를 입력해주세요.")
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
        console.log(response_json)
        if (response_json["status"] == "404") {
            alert(`${response_json["error"]}`)
            return;
        } else if (response_json["status"] == "401") {
            alert(`${response_json["error"]}`)
            return;
        } else if (response_json["status"] == "403") {
            alert(`${response_json["error"]}`)
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
            window.location.replace(`${frontend_base_url}/story/`);
            return;
        }
    } catch (error) {
      alert("새로고침 후 다시 시도해주세요.");
    }



}
