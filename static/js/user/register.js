const frontend_base_url = "http://127.0.0.1:5501";
const backend_base_url = "http://127.0.0.1:8000";


// 로그인 체크
window.onload = () => { 
    if (localStorage.getItem("access")) {
        alert("잘못된 접근입니다.")
        window.location.href = `${frontend_base_url}/story/`
    }
}


// 회원가입
async function handleSignin() {
    try {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const password_check = document.getElementById("password_check").value;
        const nickname = document.getElementById("nickname").value;
        const country = document.getElementById("country").value;
        const password_pattern = /^(?=.*\d)(?=.*[~!@#$%^&amp;*]).{8,20}$/
    
        const formData = new FormData();
    
        if (email == "" || password == "" || password_check == "" || nickname == "" || country == "") {
            alert("모든 필수 정보를 입력해주세요.")
            return;
        }
        if (password != password_check) {
            alert("비밀번호가 일치하지 않습니다.")
            return;
        }
        if (!password_pattern.test(password)) {
            alert("비밀번호는 8자 이상 20자 이하 및 숫자와 특수 문자(#?!@$~%^&*-)를 하나씩 포함시켜야 합니다.")
            return;
        }
        formData.append("email", email);
        formData.append("password", password);
        formData.append("password_check", password_check);
        formData.append("nickname", nickname);
        formData.append("country", country);
    
        const profileImageInput = document.getElementById("image");
        if (profileImageInput.files.length > 0) {
            formData.append("image", profileImageInput.files[0]);
        }
        const response = await fetch(`${backend_base_url}/user/register/`, {
            method: "POST",
            body: formData,
        });
        return response;

    } catch (error) {
        alert("잘못된 접근입니다.");
    }
}


// 회원가입 버튼
async function handleSigninButton(){
    const response = await handleSignin();
    response_json = await response.json()

    if (response.status == 201){
        alert("회원가입을 축하드립니다.")
        window.location.replace(`${frontend_base_url}/user/login.html`)
    }
    else if(response.status==400 && response_json['error']['email']){
        alert(`이메일 에러 : ${response_json['error']['email']}`)
    }
    else if(response.status==400 && response_json['error']['nickname']){
        alert(`닉네임 에러 : ${response_json['error']['nickname']}`)
    }
    else if(response.status==400 && response_json['error']['password']){
        alert(`패스워드 에러 : ${response_json['error']['password']}`)
    }
    else if(response.status==400 && response_json['error']['country']){
        alert(`국가 선택 에러 : ${response_json['error']['country']}`)
    }
    else if(response.status==400){
        alert(response_json['error'])
    }
}