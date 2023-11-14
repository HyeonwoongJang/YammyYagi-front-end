backend_base_url = "http://127.0.0.1:8000"
frontend_base_url = "http://127.0.0.1:5501"

window.onload = () => {
    console.log("회원정보 수정 페이지 로드됨.")
    renderPage();
}

async function renderPage() {
    try {
        if (localStorage.getItem("access")) {
            const payload = localStorage.getItem("payload")
            const payload_parse = JSON.parse(payload)
            const request_user_email = payload_parse.email
        
            const response = await fetch(`${backend_base_url}/user/info/`, {
                method : "GET",
                headers : {
                    "Authorization" : "Bearer " + localStorage.getItem("access")
                },
            })
        
            const response_json = await response.json()
            const data = response_json.success
        
            document.getElementById("current-profile-img").src = `${backend_base_url}/${data["profile_img"]}`
            document.getElementById("email").value = request_user_email
            document.getElementById("nickname").value = data["nickname"]
            
            const my_country = data["country"]
            const country_options = document.getElementByTagName("option")
        
            if (country_options[i].value == my_country) {
                country_options[i].selected = true;
            }
        } else {
            alert("잘못된 접근입니다.")
            window.location.href = `${frontend_base_url}/story/index.html`
        }
    } catch (error) {
        alert("잘못된 접근입니다.");
    }
}

function openPasswordUpdateModal() {
    const password_modal=document.getElementById("password-modal")

    if (password_modal.style.display == "none") {
        password_modal.style.display="block"
        
    } else if (password_modal.style.display == "block") {
        password_modal.style.display="none"

        document.getElementById("current-password").value=""
        document.getElementById("new-password").value=""
        document.getElementById("new-password-check").value=""
    }
}

async function updatePasswordButton() {
    const current_password = document.getElementById("current-password").value
    const new_password =  document.getElementById("new-password").value
    const new_password_check =  document.getElementById("new-password-check").value

    try {
        if (current_password == "" || new_password == "" || new_password_check == "") {
            alert("모든 필수 정보를 입력해주세요.")
        }
        if (new_password != new_password_check) {
            alert("새 비밀번호가 새 비밀번호 확인과 일치하지 않습니다.")
        }
        if (current_password != "" && new_password == new_password_check) {
            const response = await fetch(`${backend_base_url}/user/info/`, {
                method : "PATCH",
                headers : {
                    "Authorization" : "Bearer " + localStorage.getItem("access"),
                    "Content-type" : "application/json",
                },
                body : JSON.stringify({
                    "current_password" : current_password,
                    "new_password" : new_password,
                    "new_password_check" : new_password_check
                })
            })
            const response_json = await response.json()
            const status = response_json["status"]

            if (status == "200" && response.status == 200) {
                alert(`${response_json["success"]}`)
            } else if (status == "400" && response.status == 400 && response_json["error"]["password"]) {
                alert(`${response_json["error"]["password"]}`)
            } else if(status == "400" && response.status == 400) {
                alert(`${response_json["error"]}`)
            } else if(status == "401" && response.status == 401) {
                alert(`${response_json["error"]}`)
            }
        }
    } catch (error) {
        alert("새로고침 후 다시 시도해주세요.");
    }
} 

function openUserDeleteModal() {
    const delete_modal=document.getElementById("delete-modal")

    if (delete_modal.style.display == "none") {
        delete_modal.style.display="block"
        
    } else if (delete_modal.style.display == "block") {
        delete_modal.style.display="none"

        document.getElementById("password").value=""
    }
}

async function userDeleteButton() {
    const password = document.getElementById("password").value;

    try {
        if (password != "") {
            const response = await fetch(`${backend_base_url}/user/info/`, {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("access"),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({"password": password}),
            });
            
            const response_json = await response.json()
            const status = response_json["status"]

            if (status == "204") {
                alert(`${response_json["success"]}`)
                window.location.replace(`${frontend_base_url}/story/index.html`)
            } else if (status == "400" && response.status == 400) {
                alert(`${response_json["error"]}`)
            } else if(status == "401" && response.status == 401) {
                alert(`${response_json["error"]}`)
            }
        } else {
            alert("비밀번호를 입력해주세요.")
        }
    } catch (error) {
        alert("다시 시도해주세요.");
    }
}

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

    const profileImageInput = document.getElementById("image");
    if (profileImageInput.files.length > 0) {
        data.append("image", profileImageInput.files[0]);
    }
    
    try {
        const response = await fetch(`${backend_base_url}/user/info/`, {
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("access"),
            },
            body: data
        });
    
        return response;
    } catch (error) {
        console.error("오류", error);
    }
}

async function updateButton() {
    const response = await handleUpdate();
    const response_json = await response.json()
    const status = response_json["status"]

    if (status == "200" && response.status == 200){
        alert(`${response_json["success"]}`)    
        window.location.replace(`$frontend_base_url}/user-info-update.html`);
    } else if (status == "400" && response.status == 400 && response_json["error"]["nickname"]) {
        alert(`${response_json["error"]["nickname"]}`)
    }
}

