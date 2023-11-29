// URL 매개변수에서 story_id를 추출하는 함수
function storyIdSearch() {
  const url_params = new URLSearchParams(window.location.search);
  const story_id = url_params.get("story_id");

  return story_id;
}

// HTTP 요청 헤더를 설정하는 객체를 초기화
let headers = {
  "Content-Type": "application/json",
};

window.onload = async function () {
  const data = await tempRender();
  const story_data = data["detail"];

  // 초기 화면에는 첫 번째 컨텐츠 랜더링
  const current_page = 1;
  const total_content_count = story_data.story_paragraph_list.length;

  storyPage(story_data, current_page, total_content_count);
  createPage(story_data, current_page, total_content_count);
};

// 페이지 GET 요청하는 비동기 함수
async function tempRender() {
  // 만약 로그인한 사용자라면, Authorization 헤더에 액세스 토큰을 추가
  if (localStorage.getItem("access")) {
    headers["Authorization"] = `Bearer ${localStorage.getItem("access")}`;
  }

  try {
    const story_id = storyIdSearch();
    const response = await fetch(`${backend_base_url}/story/${story_id}/`, {
      method: "GET",
      headers: headers, // 로그인되어 있는 경우에만 헤더에"Authorization" 필드가 추가됨.
    });
    const response_json = await response.json();

    // 서버 응답이 성공인 경우 데이터 반환
    if (response.status == 200) {
      return response_json;
    } else if (response.status == 403) {
      alert(response_json["error"]);
      return;
    }
  } catch (error) {
    alert("페이지 요청 실패");
  }
}

// 페이지의 기본 정보를 랜더링하는 비동기 함수
async function storyPage(story_data, current_page, total_content_count) {
  // 로그인 한 Story 작성자만 댓글 삭제 버튼이 보이도록 설정
  if (localStorage.getItem("access")) {
    const payload = localStorage.getItem("payload");
    const payload_parse = JSON.parse(payload);
    const story_author_id = payload_parse.user_id;

    const story_delete_button = document.getElementById("story-delete");
    if (story_data["author_id"] == story_author_id) {
      story_delete_button.style.display = "";
    } else {
      story_delete_button.style.display = "none";
    }
  }

  // Story 제목 설정
  document.getElementById("title").innerText = story_data.story_title;

  // 북마크 상태를 업데이트하고, 현재 사용자의 북마크 여부에 따라 아이콘 표시를 변경
  const bookmarked_icon = document.getElementById("bookmarked-icon");
  const not_bookmarked_icon = document.getElementById("not-bookmarked-icon");

  if (localStorage.getItem("access")) {
    const payload = localStorage.getItem("payload");
    const payload_parse = JSON.parse(payload);
    const user_id = payload_parse.user_id;

    // 스토리의 북마크된 사용자 목록을 가져와서 사용자 ID 리스트 생성
    const b_user_list = story_data.bookmark_user_list;
    const b_user_id_list = [];

    b_user_list.forEach((user) => {
      b_user_id_list.push(user["id"]);
    });

    // 현재 사용자의 ID가 북마크된 사용자 리스트에 포함되어 있으면 북마크된 상태로 표시
    if (b_user_id_list.includes(user_id)) {
      bookmarked_icon.style.display = "";
      not_bookmarked_icon.style.display = "none";
    } else {
      // 그렇지 않으면 북마크되지 않은 상태로 표시
      bookmarked_icon.style.display = "none";
      not_bookmarked_icon.style.display = "";
    }
  } else {
    // 로그인하지 않은 경우 북마크되지 않은 상태로 표시
    bookmarked_icon.style.display = "none";
    not_bookmarked_icon.style.display = "";
  }

  // 좋아요 수 업데이트
  const like_count = document.getElementById("like-count");
  like_count.innerText = story_data.like_count + " likes";

  // 싫어요 수 업데이트
  const hate_count = document.getElementById("hate-count");
  hate_count.innerText = story_data.hate_count + " hates";

  const translator = document.getElementById("translate");
  translator.onclick = function () {
    translateStory(story_data, current_page, total_content_count);
  };
}

// 페이지의 동화 내용을 랜더링하는 비동기 함수
async function createPage(story_data, current_page, total_content_count) {
  // 현재 페이지에 해당하는 데이터 가져오기
  const page_data = story_data.story_paragraph_list[parseInt(current_page) - 1];

  // 동화책 페이지 랜더링을 위한 요소
  const story_content = document.getElementById("content-box");

  // 랜더링 전에 내용 비워주기
  story_content.innerHTML = "";

  // 페이지의 이미지와 내용을 담을 요소들 생성
  const page_div = document.createElement("div");
  page_div.className = "content-div";
  const page_img = document.createElement("img");
  page_img.className = "content-img";
  const page_content = document.createElement("p");
  page_content.className = "content-text";

  // 이미지와 내용에 데이터 설정
  page_img.src = `${backend_base_url}${page_data["story_image"]}`;
  page_content.innerText = page_data["paragraph"];

  // 요소들을 조립하여 동화책 페이지에 추가
  page_div.appendChild(page_img);
  page_div.appendChild(page_content);
  story_content.appendChild(page_div);

  page_img.classList.add("page-img");

  // 페이지 이동 버튼에 현재 페이지 번호를 id 값으로 부여
  const pre_page_button = document.getElementById("pre-page-button");
  const next_page_button = document.getElementById("next-page-button");

  pre_page_button.innerHTML = "";
  next_page_button.innerHTML = "";

  if (current_page == 1 && total_content_count != 1) {
    // 첫 번째 페이지이면서 총 컨텐츠 개수가 1개 이상일 때 다음 버튼 생성

    const next_button = document.createElement("button");
    next_button.type = "button";
    next_button.className = "pagebutton";
    next_button.innerText = ">>";
    next_button.id = parseInt(current_page) + 1;
    next_button.onclick = function () {
      nextPage(story_data, next_button.id, total_content_count);
    };

    next_page_button.appendChild(next_button);
  } else if (1 < parseInt(current_page) && parseInt(current_page) < total_content_count) {
    // 첫 번째 페이지가 아니면서 중간 페이지일 때 이전, 다음 버튼 생성

    const pre_button = document.createElement("button");
    pre_button.type = "button";
    pre_button.className = "pagebutton";
    pre_button.innerText = "<<";
    pre_button.id = parseInt(current_page) - 1;
    pre_button.onclick = function () {
      prePage(story_data, pre_button.id, total_content_count);
    };

    const next_button = document.createElement("button");
    next_button.type = "button";
    next_button.className = "pagebutton";
    next_button.innerText = ">>";
    next_button.id = parseInt(current_page) + 1;
    next_button.onclick = function () {
      nextPage(story_data, next_button.id, total_content_count);
    };

    pre_page_button.appendChild(pre_button);
    next_page_button.appendChild(next_button);
  } else if (1 < parseInt(current_page) && parseInt(current_page) === total_content_count) {
    // 마지막 페이지일 때 이전 버튼 생성

    const pre_button = document.createElement("button");
    pre_button.type = "button";
    pre_button.className = "pagebutton";
    pre_button.innerText = "<<";
    pre_button.id = parseInt(current_page) - 1;
    pre_button.onclick = function () {
      prePage(story_data, pre_button.id, total_content_count);
    };

    pre_page_button.appendChild(pre_button);
  }
}

// 다음 버튼에 연결된 비동기 함수
async function nextPage(data, current_page, total_content_count) {
  createPage(data, current_page, total_content_count);
}

// 이전 버튼에 연결된 비동기 함수
async function prePage(data, current_page, total_content_count) {
  createPage(data, current_page, total_content_count);
}

// 번역 버튼에 연결된 비동기 함수
async function translateStory(story_data, current_page, total_content_count) {
  try {
    // 스토리 데이터에서 스토리 스크립트 및 제목 추출
    const story_script = story_data["story_paragraph_list"];
    const story_title = story_data["story_title"];

    // 선택된 언어 가져오기
    const target_language = document.getElementById("language").value;

    const response = await fetch(`${backend_base_url}/story/translation/`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        story_script: story_script,
        target_language: target_language,
        story_title: story_title,
      }),
    });

    const response_json = await response.json();

    // 각 문단에 번역된 내용 적용
    for (let i = 0; i < story_script.length; i++) {
      story_script[i]["paragraph"] = response_json["translated_scripts"][i];
    }

    // 서버 응답이 성공인 경우 번역된 제목 적용 및 번역 페이지 생성
    if (response.status == 200) {
      document.getElementById("title").innerText = response_json["translated_title"];
      createPage(story_data, current_page, total_content_count);
    } else if (response.status == 400) {
      alert(response_json["error"]);
      return;
    }
  } catch (error) {
    alert("번역 요청 실패");
  }
}

// 댓글창을 열고 닫는 비동기 함수
async function toggleComments() {
  // 댓글 창의 현재 표시 상태를 확인하고, 토글하여 보이게 하거나 숨김
  const comment_box = document.getElementById("comment");
  comment_box.style.display =
    comment_box.style.display === "none" || comment_box.style.display === "" ? "block" : "none";

  try {
    const story_id = storyIdSearch(); // 현재 스토리의 ID를 가져옴
    const response = await fetch(`${backend_base_url}/story/${story_id}/comment/`, {
      method: "GET",
    });

    const response_json = await response.json();

    const comment_data = response_json["comments"];

    const comment_list = document.getElementById("comment-list");
    comment_list.innerHTML = "";

    // 각 댓글을 렌더링
    comment_data.forEach((comment) => {
      const single_comment = document.createElement("div");
      const author_info = document.createElement("div");
      const author_profile = document.createElement("img");
      const author_nickname = document.createElement("div");
      const delete_button = document.createElement("button");
      const content = document.createElement("p");

      single_comment.classList.add("single_comment");

      author_info.classList.add("comment_author_info");

      author_profile.src = `${backend_base_url}${comment["author_image"]}`;
      author_profile.classList.add("comment_author_profile");
      author_nickname.innerText = comment["author_nickname"];
      author_nickname.setAttribute("class", "comment-nickname");

      delete_button.classList.add("btn-close");
      delete_button.onclick = function () {
        deleteComment(comment["comment_id"]);
      };

      content.innerText = comment["content"];
      content.classList.add("comment_content");

      author_info.appendChild(author_profile);
      author_info.appendChild(author_nickname);

      // 현재 사용자가 로그인되어 있고, 댓글 작성자가 현재 사용자인 경우 삭제 버튼 추가
      if (localStorage.getItem("access")) {
        const payload = localStorage.getItem("payload");
        const payload_parse = JSON.parse(payload);
        const comment_author = payload_parse.user_id;
        if (comment["author_id"] == comment_author) {
          author_info.appendChild(delete_button);
        }
      }

      single_comment.appendChild(author_info);
      single_comment.appendChild(content);

      comment_list.appendChild(single_comment);
    });
  } catch (error) {
    alert("댓글 로드 실패");
  }
}

// 댓글을 로드하는 비동기 함수
async function loadComments() {
  try {
    const story_id = storyIdSearch(); // 현재 스토리의 ID를 가져옴
    const response = await fetch(`${backend_base_url}/story/${story_id}/comment/`, {
      method: "GET",
    });

    const response_json = await response.json();

    const comment_data = response_json["comments"];

    const comment_list = document.getElementById("comment-list");
    comment_list.innerHTML = "";

    // 각 댓글을 렌더링
    comment_data.forEach((comment) => {
      const single_comment = document.createElement("div");
      const author_info = document.createElement("div");
      const author_profile = document.createElement("img");
      const author_nickname = document.createElement("div");
      const delete_button = document.createElement("button");
      const content = document.createElement("p");

      single_comment.classList.add("single_comment");

      author_info.classList.add("comment_author_info");

      author_profile.src = `${backend_base_url}${comment["author_image"]}`;
      author_profile.classList.add("comment_author_profile");
      author_nickname.innerText = comment["author_nickname"];
      author_nickname.setAttribute("class", "comment-nickname");

      delete_button.classList.add("btn-close");
      delete_button.onclick = function () {
        deleteComment(comment["comment_id"]);
      };

      content.innerText = comment["content"];
      content.classList.add("comment_content");

      author_info.appendChild(author_profile);
      author_info.appendChild(author_nickname);

      // 현재 사용자가 로그인되어 있고, 댓글 작성자가 현재 사용자인 경우 삭제 버튼 추가
      if (localStorage.getItem("access")) {
        const payload = localStorage.getItem("payload");
        const payload_parse = JSON.parse(payload);
        const comment_author = payload_parse.user_id;
        if (comment["author_id"] == comment_author) {
          author_info.appendChild(delete_button);
        }
      }

      single_comment.appendChild(author_info);
      single_comment.appendChild(content);

      comment_list.appendChild(single_comment);
    });
  } catch (error) {
    alert("댓글 로드 실패");
  }
}

// 댓글을 삭제하는 비동기 함수
async function deleteComment(comment_id) {
  try {
    const story_id = storyIdSearch(); // 현재 스토리의 ID를 가져옴
    const response = await fetch(`${backend_base_url}/story/${story_id}/comment/${comment_id}/`, {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("access"),
      },
    });

    const response_json = await response.json();
    const status = response_json["status"];

    if (status == "204") {
      alert(`${response_json["success"]}`);
      loadComments(); // 댓글이 삭제되면 업데이트된 댓글 목록을 로드
      return;
    } else if (status == "401" && response.status == 401) {
      alert(`${response_json["error"]}`); // 권한이 없는 경우
      return;
    } else if (status == "403" && response.status == 403) {
      // 금지된 요청인 경우
      alert(`${response_json["error"]}`);
      return;
    }
  } catch (error) {
    alert("댓글 삭제 실패");
  }
}

// 댓글을 생성하는 비동기 함수
async function postComment() {
  try {
    if (localStorage.getItem("access")) {
      // 로그인되어 있는 경우에만 댓글을 작성할 수 있도록 확인

      const story_id = storyIdSearch(); // 현재 스토리의 ID를 가져옴
      const comment_content = document.getElementById("comment-input").value;

      const response = await fetch(`${backend_base_url}/story/${story_id}/comment/`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("access"),
        },
        body: JSON.stringify({ content: comment_content }),
      });

      document.getElementById("comment-input").value = ""; // 댓글 작성 후 입력란 비우기

      const response_json = await response.json();
      const status = response_json["status"];

      if (status == "201" && response.status == 201) {
        alert(`${response_json["success"]}`);
        loadComments(); // 댓글이 성공적으로 생성되면 업데이트된 댓글 목록을 로드
        return;
      } else if (status == "401" && response.status == 401) {
        alert(`${response_json["error"]}`);
        return;
      } else if (status == "403" && response.status == 403) {
        alert(`${response_json["error"]}`);
        return;
      }
    } else {
      alert("로그인 후 이용해주세요.");
    }
  } catch (error) {
    alert("댓글 생성 실패");
  }
}

// 스토리를 삭제하는 비동기 함수
async function deleteStory() {
  try {
    if (localStorage.getItem("access")) {
      const story_id = storyIdSearch(); // 현재 스토리의 ID를 가져옴
      const response = await fetch(`${backend_base_url}/story/${story_id}/`, {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("access"),
        },
      });

      const response_json = await response.json();
      const status = response_json["status"];

      if (status == "204") {
        alert(`${response_json["success"]}`);
        window.location.href = `${frontend_base_url}`; // 동화 삭제 후 메인페이지로 이동
        return;
      } else if (status == "401" && response.status == 401) {
        alert(`${response_json["error"]}`); // 권한이 없는 경우
        return;
      } else if (status == "403" && response.status == 403) {
        // 금지된 요청인 경우
        alert(`${response_json["error"]}`);
        return;
      }
    } else {
      alert("로그인 후 이용해주세요."); // 서버로의 요청을 최소화하기 위해 프론트에서 권한이 없을 경우 삭제 요청을 차단
    }
  } catch (error) {
    alert("스토리 삭제 실패");
  }
}

// 현재 페이지 URL을 클립보드에 복사하는 비동기 함수
async function copyLink() {
  try {
    // 현재 페이지 URL을 클립보드에 복사
    await navigator.clipboard.writeText(window.location.href);
    alert("링크 복사 성공");
  } catch (error) {
    alert("링크 복사 실패");
  }
}

// 페이스북 공유 링크를 새 창으로 열어주는 비동기 함수
async function shareFacebook() {
  try {
    // 현재 페이지 URL을 인코딩
    const url = encodeURI(window.location.href);

    // 페이스북 공유 링크를 새 창으로 열기
    window.open("http://www.facebook.com/sharer/sharer.php?u=" + url);
    alert("페이스북 공유 성공");
  } catch (error) {
    alert("페이스북 공유 실패");
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
        Authorization: "Bearer " + localStorage.getItem("access"),
      },
    });

    // fetch의 결과를 처리하고 필요한 데이터 추출
    const response_json = await response.json();

    // kakao api key 가져오기
    const kakao_api_key = response_json.kakao_api_key;

    // Kakao Link 공유
    window.Kakao.init(kakao_api_key);
    window.Kakao.Link.sendDefault({
      objectType: "feed",
      content: {
        title: "YummyYagi", // 공유할 콘텐츠의 제목
        description: "동화책을 공유합니다.", // 공유할 콘텐츠의 설명
        imageUrl: frontend_base_url + "/static/img/yummy_yagi_logo.jpg", // 썸네일 이미지 URL
        link: {
          webUrl: window.location.href, // 웹 URL
        },
      },
      buttons: [
        {
          title: "동화책 열람하기",
          link: {
            webUrl: window.location.href, // 버튼 클릭 시 이동할 URL
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
    window.open(
      "https://X.com/intent/tweet" +
        "?via=" + // 트위터 계정 추가 (via)
        "&text=" + // 트윗 내용 추가 (text)
        "&url=" +
        encodeURIComponent(window.location.href) // 현재 페이지의 URL을 인코딩하여 추가
    );
  } catch (error) {
    alert("페이스북 공유 실패");
  }
}

// 스토리를 북마크하거나 북마크를 취소하는 비동기 함수
async function bookmarkStory() {
  try {
    if (localStorage.getItem("access")) {
      const story_id = storyIdSearch();
      const response = await fetch(`${backend_base_url}/story/${story_id}/bookmark/`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("access"),
          "Content-Type": "application/json",
        },
      });
      const response_json = await response.json();
      const status = response_json["status"];

      const bookmarked_icon = document.getElementById("bookmarked-icon"); // 북마크된 아이콘
      const not_bookmarked_icon = document.getElementById("not-bookmarked-icon"); // 북마크되지 않은 아이콘

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
      alert("로그인 후 이용해주세요.");
    }
  } catch (error) {
    alert("북마크 실패");
  }
}

// 스토리를 좋아요하거나 좋아요를 취소하는 비동기 함수
async function likeStory() {
  try {
    if (localStorage.getItem("access")) {
      const story_id = storyIdSearch();
      const response = await fetch(`${backend_base_url}/story/${story_id}/like/`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("access"),
          "Content-Type": "application/json",
        },
      });
      const response_json = await response.json();
      const status = response_json["status"];
      const like_count = document.getElementById("like-count"); // 좋아요 수를 나타내는 엘리먼트

      // 좋아요 성공 시 좋아요 수 업데이트
      if (status == "200" && response.status == 200) {
        alert(`${response_json["success"]}`);
        like_count.innerText = response_json["like_count"] + " likes"; // 좋아요 수 업데이트
        return;
      } else if (status == "404" && response.status == 404) {
        alert(`${response_json["error"]}`);
        return;
      } else if (status == "401" && response.status == 401) {
        alert(`${response_json["error"]}`);
        return;
      }
    } else {
      alert("로그인 후 이용해주세요.");
    }
  } catch (error) {
    alert("좋아요 실패");
  }
}

// 스토리를 싫어요하거나 싫어요를 취소하는 비동기 함수
async function hateStory() {
  try {
    if (localStorage.getItem("access")) {
      const story_id = storyIdSearch();
      const response = await fetch(`${backend_base_url}/story/${story_id}/hate/`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("access"),
          "Content-Type": "application/json",
        },
      });
      const response_json = await response.json();
      const status = response_json["status"];
      const hate_count = document.getElementById("hate-count"); // 싫어요 수를 나타내는 엘리먼트

      // 싫어요 성공 시 싫어요 수 업데이트
      if (status == "200" && response.status == 200) {
        alert(`${response_json["success"]}`);
        hate_count.innerText = response_json["hate_count"] + " hates"; // 싫어요 수 업데이트
        return;
      } else if (status == "404" && response.status == 404) {
        alert(`${response_json["error"]}`);
        return;
      } else if (status == "401" && response.status == 401) {
        alert(`${response_json["error"]}`);
        return;
      }
    } else {
      alert("로그인 후 이용해주세요.");
    }
  } catch (error) {
    alert("싫어요 실패");
  }
}
