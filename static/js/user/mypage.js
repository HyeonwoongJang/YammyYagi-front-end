// 로그인 여부 체크
window.onload = () => { 
    if (!localStorage.getItem("access")) {
        alert("잘못된 접근입니다.")
        window.location.href = `${frontend_base_url}/story/`
    }
}

function storyDetail(story_id) {
    window.location.href = `${frontend_base_url}/story/detail.html?story_id=${story_id}`;
}

// 마이페이지 get api
function getMyPage() {
    const access_token = localStorage.getItem("access");
    fetch(`${backend_base_url}/user/mypage/`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
            },
        })
        .then((response) => response.json())
        .then((user) => {
            // user 정보 가져오기
            const data = user.my_data;
            document.getElementById("nickname").textContent = data.nickname;
            document.getElementById("email").textContent = data.email;
            document.getElementById("country").textContent = data.country;

            const user_image = document.getElementById("user-profile");
            if (data.profile_img) {
            user_image.setAttribute("src", `${backend_base_url}${data.profile_img}`);
            } else {
                user_image.setAttribute("src", `${backend_base_url}/media/user/default_profile.jpg`);
            }

            // 북마크 목록 불러오기
            const bookmarks = data.bookmark_story_list;
            bookmarks.reverse()
            const bookmark_list = document.getElementById("bookmark-story");
            bookmark_list.innerHTML = "";

            bookmarks.forEach((bookmark) => {
                const bookmark_element = document.createElement("div");
                bookmark_element.setAttribute("onclick", `storyDetail(${bookmark.story_id})`);

                bookmark_element.innerHTML = `
                <div class="bookmark-card">
                  <img src="${backend_base_url}${bookmark.content.story_image}" width="240px" height="150px";/>
                  <div class="card-text">
                  <p class="title">${bookmark.story_title}</p>
                  <p class="content">${bookmark.content.story_first_paragraph}</p>
                  <hr>
                  <div class="card_bottom">
                    <p class="country">${bookmark.author_country}
                    <span class="like">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-suit-heart-fill" viewBox="0 0 16 16">
                    <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1z"/>
                    </svg>${bookmark.like_user_list.length}
                    </span></p>
                  </div> 
                </div>
                `;

                bookmark_list.appendChild(bookmark_element);
            });

            // 내가 작성한 동화 목록 불러오기
            const stories = data.my_story_list;
            stories.reverse()
            const story_list = document.getElementById("my-story");
            story_list.innerHTML = "";

            stories.forEach((story) => {
                const story_element = document.createElement("div");
                story_element.setAttribute("onclick", `storyDetail(${story.story_id})`);

                story_element.innerHTML = `
                <div class="my-story-card">
                          <img src="${backend_base_url}${story.content.story_image}" width="240px" height="150px";/>
                          <div class="card-text">
                            <p class="title">${story.story_title}</p>
                            <p class="content">${story.content.story_first_paragraph}</p>
                            <hr>
                            <div class="card_bottom">
                                <p class="country">${story.author_country}
                                <span class="like">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-suit-heart-fill" viewBox="0 0 16 16">
                                <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1z"/>
                                </svg>${story.like_user_list.length}
                                </span></p>
                            </div>
                          </div>
                      </div>
                  </div>
              `;
              story_list.appendChild(story_element);
            });

            // 최근 조회한 글 목록 불러오기
            const recent_storioes = data.recent_stories;
            recent_storioes.reverse()

            const recent_story_list = document.getElementById("recently-story");
            recent_story_list.innerHTML = "";

            recent_storioes.forEach((recent_story) => {
                const recent_story_element = document.createElement("div");
                recent_story_element.setAttribute("onclick", `storyDetail(${recent_story.story_id})`);

                recent_story_element.innerHTML = `
                <div class="recently-card">
                          <img src="${backend_base_url}${recent_story.content.story_image}" width="240px" height="150px";/>
                          <div class="card-text">
                            <p class="title">${recent_story.story_title}</p>
                            <p class="content">${recent_story.content.story_first_paragraph}</p>
                            <hr>
                            <div class="card_bottom">
                                <p class="country">${recent_story.author_country}
                                <span class="like">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-suit-heart-fill" viewBox="0 0 16 16">
                                <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1z"/>
                                </svg>${recent_story.like_user_list.length}
                                </span></p>
                            </div>
                          </div>
                      </div>
                  </div>
              `;

              recent_story_list.appendChild(recent_story_element);
            });
        });
}

window.addEventListener("load", getMyPage);

function getInfoPage() {
    window.location.href = `${frontend_base_url}/user/user-info-update.html`;
}
