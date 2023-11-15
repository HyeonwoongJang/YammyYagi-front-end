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

// 댓글을 생성하는 비동기 함수
async function postComment() {
    
    try {
        if (localStorage.getItem("access")) {                       // 로그인되어 있는 경우에만 댓글을 작성할 수 있도록 확인

            const story_id = storyIdSearch();                       // 현재 스토리의 ID를 가져옴
            const comment_content = document.getElementById("comment-input").value

            const response = await fetch(`${backend_base_url}/story/${story_id}/comment/`, {
                method : "POST",
                headers: {
                    "content-type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("access")
                },
                body: JSON.stringify({"content":comment_content})
            })

            document.getElementById("comment-input").value = ""     // 댓글 작성 후 입력란 비우기

            const response_json = await response.json()
            const status = response_json["status"]

            if (status == "201" && response.status == 201) {
                alert(`${response_json["success"]}`)
                loadComments()                                      // 댓글이 성공적으로 생성되면 업데이트된 댓글 목록을 로드
                return;
            } else if(status == "401" && response.status == 401) {
                alert(`${response_json["error"]}`)
                return;
            } else if(status == "403" && response.status == 403) {
                alert(`${response_json["error"]}`)
                return;
            } 
        } else {
            alert("로그인 후 이용해주세요.")
        }
    } catch (error) {
        alert("댓글 생성 실패")
    }
}

// 현재 페이지 URL을 클립보드에 복사하는 비동기 함수
async function copyLink() {

    try {
        // 현재 페이지 URL을 클립보드에 복사
        await navigator.clipboard.writeText(window.location.href);
        alert("링크 복사 성공")
    } catch (error) {
        alert("링크 복사 실패")
    }
}

// 페이스북 공유 링크를 새 창으로 열어주는 비동기 함수
async function shareFacebook() {
    try {
        // 현재 페이지 URL을 인코딩
        const url = encodeURI(window.location.href)

        // 페이스북 공유 링크를 새 창으로 열기
        window.open("http://www.facebook.com/sharer/sharer.php?u=" + url);
        alert("페이스북 공유 성공")

    } catch (error) {
        alert("페이스북 공유 실패")
    }
}

// 카카오톡 공유 링크를 새 창으로 열어주는 비동기 함수
async function shareKakao() {
    try {
        // 데이터를 가져오기 위한 fetch 요청
        const response = await fetch(`${backend_base_url}/story/kakao/`, {
            method: "GET",
            headers: {
                "content-type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("access")
            },
        });

        // fetch의 결과를 처리하고 필요한 데이터 추출
        const response_json = await response.json();

        // kakao api key 가져오기
        const kakao_api_key = response_json.kakao_api_key

        // Kakao Link 공유
        window.Kakao.init(kakao_api_key);
        window.Kakao.Link.sendDefault({
            objectType: "feed",
            content: {
                title: "YummyYagi",                                                 // 공유할 콘텐츠의 제목
                description: "동화책을 공유합니다.",                                // 공유할 콘텐츠의 설명
                imageUrl: frontend_base_url + "/static/img/yummy_yagi_logo.jpg",    // 썸네일 이미지 URL
                link: {
                    webUrl: window.location.href,                                   // 웹 URL
                },
            },
            buttons: [
                {
                    title: "동화책 열람하기",
                    link: {
                        webUrl: window.location.href,                              // 버튼 클릭 시 이동할 URL
                    },
                },
            ],
        });
    } catch (error) {
        alert("카카오 공유 실패");
    }
}

// 트위터 공유 링크를 새 창으로 열어주는 비동기 함수
async function shareTwitter() {
    try {
        window.open("https://X.com/intent/tweet"
			+"?via="                                            // 트위터 계정 추가 (via)
			+"&text="                                           // 트윗 내용 추가 (text)
			+"&url="+encodeURIComponent(window.location.href)   // 현재 페이지의 URL을 인코딩하여 추가
	)
    } catch (error) {
        alert("페이스북 공유 실패")
    }
}

// 스토리를 북마크하거나 북마크를 취소하는 비동기 함수
async function bookmarkStory() {
    
    try {
        if (localStorage.getItem("access")) {
            const story_id = storyIdSearch()
            const response = await fetch(`${backend_base_url}/story/${story_id}/bookmark/`, {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("access"),
                    "Content-Type": "application/json",
                }
            });
            const response_json = await response.json();
            const status = response_json["status"];
            
            const bookmarked_icon = document.getElementById("bookmarked-icon")          // 북마크된 아이콘
            const not_bookmarked_icon = document.getElementById("not-bookmarked-icon")  // 북마크되지 않은 아이콘

            // 북마크 상태에 따라 아이콘 표시 변경
            if (status == "200" && response_json["success"] == "북마크") {
                alert(`${response_json["success"]}`);
                bookmarked_icon.style.display = "";
                not_bookmarked_icon.style.display = "none";
                return;
            } else if (status == "200" && response_json["success"] == "북마크 취소") {
                alert(`${response_json["success"]}`);
                bookmarked_icon.style.display = "none";
                not_bookmarked_icon.style.display = "";
                return;
            } else if (status == "404" && response.status == 404) {
                alert(`${response_json["error"]}`);
                return;
            } else if (status == "401" && response.status == 401) {
                alert(`${response_json["error"]}`);
                return;
            } 
        } else {
            alert("로그인 후 이용해주세요.")
        }
    } catch (error) {
        alert("북마크 실패")
    }
}

// 스토리를 좋아요하거나 좋아요를 취소하는 비동기 함수
async function likeStory() {
    
    try {
        if (localStorage.getItem("access")) {
            const story_id = storyIdSearch()
            const response = await fetch(`${backend_base_url}/story/${story_id}/like/`, {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("access"),
                    "Content-Type": "application/json",
                }
            });
            const response_json = await response.json();
            const status = response_json["status"];
            const like_count = document.getElementById("like-count")            // 좋아요 수를 나타내는 엘리먼트

            // 좋아요 성공 시 좋아요 수 업데이트
            if (status == "200" && response.status == 200) {
                alert(`${response_json["success"]}`);
                like_count.innerText = response_json["like_count"] + " likes"   // 좋아요 수 업데이트
                return;
            } else if (status == "404" && response.status == 404) {
                alert(`${response_json["error"]}`);
                return;
            } else if (status == "401" && response.status == 401) {
                alert(`${response_json["error"]}`);
                return;
            } 
        } else {
            alert("로그인 후 이용해주세요.")
        }
    } catch (error) {
        alert("좋아요 실패")
    }
}