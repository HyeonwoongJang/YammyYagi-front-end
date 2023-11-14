const frontend_base_url = "http://127.0.0.1:5501"
const backend_base_url = "http://127.0.0.1:8000"


// username 가져오기
async function fetchUsernameFromDatabase() {
    const accessToken = localStorage.getItem("access");
    try {
        const response = await fetch(`${backend_base_url}/user/`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const user = await response.json();
            return user.username;
        } else {
            console.error("Error fetching username:", response.statusText);
            return null;
        }
    } catch (error) {
        console.error("Error fetching username:", error);
        return null;
    }
}


// header 적용
async function injectHeader() {
    fetch("../header.html").then(response=>{
        return response.text()
    })
        .then(data=>{
            document.querySelector("header").innerHTML=data;

            const modalButton = document.getElementById("hamburger-button");
            modalButton.addEventListener("click", function () {
                // 모달을 표시하는 Bootstrap 함수
                $('#myModal').modal('show');
            });
        })
        .catch(error => {
            console.error("Error injecting header:", error);
        });

    let headerHtml = await fetch("../header.html")
    let data = await headerHtml.text()
    document.querySelector("header").innerHTML = data;
}

injectHeader();