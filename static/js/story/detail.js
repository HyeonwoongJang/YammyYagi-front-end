// URL 매개변수에서 story_id를 추출하는 함수
function storyIdSearch() {
    const url_params = new URLSearchParams(window.location.search);
    const story_id = url_params.get("story_id");

    return story_id
}

// 창이 로드될 때의 이벤트 핸들러
window.onload = () => {
    renderPage();       // 페이지의 주요 내용을 렌더링
    loadComments();     // 댓글을 로드하고 표시
}

// 페이지의 주요 내용을 렌더링하는 비동기 함수
async function renderPage() {

    try {
        const story_id = storyIdSearch()
        const response = await fetch(`${backend_base_url}/story/${story_id}/`, {
            method : "GET",
        })

        const response_json = await response.json()
        const story_data = response_json["detail"]
        const story_paragraph = story_data["story_paragraph_list"]

        // Story 제목 설정
        document.getElementById("title").innerText = story_data["story_title"]

        const story_content = document.getElementById("content")
        
        // 각 페이지를 렌더링
        story_paragraph.forEach(page => {
            const page_div = document.createElement("div")
            const page_img = document.createElement("img")
            const page_content = document.createElement("p")

            page_img.src = `${backend_base_url}${page["story_image"]}`
            page_content.innerText = page["paragraph"]

            
            page_div.appendChild(page_img)
            page_div.appendChild(page_content)
            story_content.appendChild(page_div)

            page_img.classList.add("page-img")
        })

    } catch (error) {
        alert("페이지 로드 실패")
    }
}

// 댓글을 로드하는 비동기 함수
async function loadComments() {

    try {
        const story_id = storyIdSearch()    // 현재 스토리의 ID를 가져옴
        const response = await fetch(`${backend_base_url}/story/${story_id}/comment/`, {
            method : "GET"
        })

        const response_json = await response.json()

        const comment_data = response_json["comments"]

        const comment_list = document.getElementById("comment-list")
        comment_list.innerHTML = "";

        // 각 댓글을 렌더링
        comment_data.forEach(comment => {
            const single_comment = document.createElement("div")
            const author_info = document.createElement("div")
            const author_profile = document.createElement("img")
            const author_nickname = document.createElement("p")
            const delete_button = document.createElement("button")
            const content = document.createElement("p")

            single_comment.classList.add("single_comment")

            author_info.classList.add("comment_author_info")

            author_profile.src = `${backend_base_url}${comment["author_profile"]}`
            author_profile.classList.add("comment_author_profile")
            author_nickname.innerText = comment["author_nickname"]

            delete_button.classList.add("btn-close")
            delete_button.onclick = function() {
                deleteComment(comment["comment_id"]);
            };
            
            content.innerText = comment["content"]
            content.classList.add("comment_content")

            author_info.appendChild(author_profile)
            author_info.appendChild(author_nickname)

             // 현재 사용자가 로그인되어 있고, 댓글 작성자가 현재 사용자인 경우 삭제 버튼 추가
            if (localStorage.getItem("access")) {
                const payload = localStorage.getItem("payload")
                const payload_parse = JSON.parse(payload)
                const comment_author = payload_parse.nickname
                if (comment["author_nickname"] == comment_author) {
                    author_info.appendChild(delete_button)
                }
            }

            single_comment.appendChild(author_info)
            single_comment.appendChild(content)
            
            comment_list.appendChild(single_comment)
        })

    } catch (error) {
        alert("댓글 로드 실패")
    }
}

// 댓글을 삭제하는 비동기 함수
async function deleteComment(comment_id) {
    
    try {
        const story_id = storyIdSearch()                            // 현재 스토리의 ID를 가져옴
        const response = await fetch(`${backend_base_url}/story/${story_id}/comment/${comment_id}/`, {
            method : "DELETE",
            headers: {
                "content-type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("access")
            }
        })

        const response_json = await response.json()
        const status = response_json["status"]

        if (status == "204") {
            alert(`${response_json["success"]}`)
            loadComments(story_id);                                 // 댓글이 삭제되면 업데이트된 댓글 목록을 로드
            return;
        } else if(status == "401" && response.status == 401) {
            alert(`${response_json["error"]}`)                      // 권한이 없는 경우
            return;
        } else if(status == "403" && response.status == 403) {      // 금지된 요청인 경우
            alert(`${response_json["error"]}`)
            return;
        }
    } catch (error) {
        alert("댓글 삭제 실패")
    }
}
