const frontend_base_url = "http://127.0.0.1:5501";
const backend_base_url = "http://127.0.0.1:8000";

//  회원가입
async function handleSignin() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const password_check = document.getElementById("password_check").value;
    const nickname = document.getElementById("nickname").value;
    const country = document.getElementById("country").value;
    console.log(country)

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("password_check", password_check);
    formData.append("nickname", nickname);
    if (country !== "") {
        formData.append("country", country);
    }

    const profileImageInput = document.getElementById("image");
    if (profileImageInput.files.length > 0) {
        formData.append("image", profileImageInput.files[0]);
    }
    const response = await fetch(`${backend_base_url}/user/register/`, {
        method: 'POST',
        body: formData,
    });

    return response;
}

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