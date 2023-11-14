function storyDetail(story_id) {
    window.location.href = `${frontend_base_url}/story_detail.html?story_id=${story_id}`;
}

// 마이페이지 get api
function getMyPage() {
    const accessToken = localStorage.getItem("access");
    fetch(`${backend_base_url}/user/mypage/`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
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

            if (data.profile_img) {
            const userImage = document.getElementById("user-profile");
            userImage.setAttribute("src", `${backend_base_url}${data.profile_img}`);
            } else {
                const userImage = document.getElementById("user-profile");
                userImage.setAttribute("src", `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDmTN6I5GxkyWFu4LJKGD2Uqp8ove-TBI-5g&usqp=CAU`);
            }

            // 북마크 목록 불러오기
            const bookmarks = data.bookmark_story_list;
            const bookmarktList = document.getElementById("bookmark-story");
            bookmarktList.innerHTML = "";

            bookmarks.forEach((bookmark) => {
                const bookmarkElement = document.createElement("div");
                bookmarkElement.setAttribute("onclick", `storyDetail(${bookmark.story_id})`);

                bookmarkElement.innerHTML = `
                <div class="bookmark-card">
                  <img src="${backend_base_url}${bookmark.content.story_image}" width="240px" height="150px";/>
                  <div class="card-text">
                  <p class="title">${bookmark.story_title}</p>
                  <p class="content">${bookmark.content.story_first_paragraph}</p>
                  <hr>
                  <p class="country">${bookmark.author_country}</p>
                </div>
                `;

                bookmarktList.appendChild(bookmarkElement);

            // 내가 작성한 동화 목록 불러오기
            const myStories = data.my_story_list;
            const myStorytList = document.getElementById("my-story");
            myStorytList.innerHTML = "";

            myStories.forEach((myStory) => {
                const myStoryElement = document.createElement("div");
                myStoryElement.setAttribute("onclick", `storyDetail(${myStory.story_id})`);

                myStoryElement.innerHTML = `
                <div class="my-story-card">
                          <img src="${backend_base_url}${myStory.content.story_image}" width="240px" height="150px";/>
                          <div class="card-text">
                            <p class="title">${myStory.story_title}</p>
                            <p class="ccontent">${myStory.content.story_first_paragraph}</p>
                            <hr>
                            <p class="country">${myStory.author_country}</p>
                          </div>
                      </div>
                  </div>
              `;
                myStorytList.appendChild(myStoryElement);
            });
        });
    });
}

window.addEventListener("load", getMyPage);

function getInfoPage() {
    window.location.href = `${frontend_base_url}/user/user-info-update.html`;
}
