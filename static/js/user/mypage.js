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
                  <p class="country">${bookmark.author_country}</p>
                </div>
                `;

                bookmark_list.appendChild(bookmark_element);
            });

            // 내가 작성한 동화 목록 불러오기
            const stories = data.my_story_list;
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
                            <p class="country">${story.author_country}</p>
                          </div>
                      </div>
                  </div>
              `;
              story_list.appendChild(story_element);
            });

            // 최근 조회한 글 목록 불러오기
            console.log(data)
            const recently_storioes = data.recently_stories;
            const recently_story_list = document.getElementById("recently-story");
            recently_story_list.innerHTML = "";

            recently_storioes.forEach((recently_story) => {
                const recently_story_element = document.createElement("div");
                recently_story_element.setAttribute("onclick", `storyDetail(${recently_story.story_id})`);

                recently_story_element.innerHTML = `
                <div class="recently-card">
                          <img src="${backend_base_url}${recently_story.content.story_image}" width="240px" height="150px";/>
                          <div class="card-text">
                            <p class="title">${recently_story.story_title}</p>
                            <p class="content">${recently_story.content.story_first_paragraph}</p>
                            <hr>
                            <p class="country">${recently_story.author_country}</p>
                          </div>
                      </div>
                  </div>
              `;
              recently_story_list.appendChild(recently_story_element);     
            });
        });
}

window.addEventListener("load", getMyPage);

function getInfoPage() {
    window.location.href = `${frontend_base_url}/user/user-info-update.html`;
}
