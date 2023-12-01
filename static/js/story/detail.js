// URL 매개변수에서 storyId를 추출하는 함수
function storyIdSearch() {
  const urlParams = new URLSearchParams(window.location.search);
  const storyId = urlParams.get("story_id");

  return storyId;
}

// HTTP 요청 헤더를 설정하는 객체를 초기화
let headers = {
  "Content-Type": "application/json",
};

window.onload = async function () {
  const data = await tempRender();
  const storyData = data["detail"];

  // 초기 화면에는 첫 번째 컨텐츠 랜더링
  const currentPage = 1;
  const totalContentCount = storyData.story_paragraph_list.length;

  storyPage(storyData, currentPage, totalContentCount);
  createPage(storyData, currentPage, totalContentCount);
};

// 페이지 GET 요청하는 비동기 함수
async function tempRender() {
  // 만약 로그인한 사용자라면, Authorization 헤더에 액세스 토큰을 추가
  if (localStorage.getItem("access")) {
    headers["Authorization"] = `Bearer ${localStorage.getItem("access")}`;
  }

  try {
    const storyId = storyIdSearch();
    const response = await fetch(`${backendBaseUrl}/story/${storyId}/`, {
      method: "GET",
      headers: headers, // 로그인되어 있는 경우에만 헤더에"Authorization" 필드가 추가됨.
    });
    const responseJson = await response.json();

    // 서버 응답이 성공인 경우 데이터 반환
    if (response.status == 200) {
      return responseJson;
    } else if (response.status == 403) {
      alert(responseJson["error"]);
      return;
    }
  } catch (error) {
    alert("페이지 요청 실패");
  }
}

// 페이지의 기본 정보를 랜더링하는 함수
function storyPage(storyData, currentPage, totalContentCount) {
  // 로그인 한 Story 작성자만 댓글 삭제 버튼이 보이도록 설정
  if (localStorage.getItem("access")) {
    const payload = localStorage.getItem("payload");
    const payloadParse = JSON.parse(payload);
    const storyAuthorId = payloadParse.user_id;

    const storyDeleteButton = document.getElementById("story-delete");
    if (storyData["author_id"] == storyAuthorId) {
      storyDeleteButton.style.display = "";
    } else {
      storyDeleteButton.style.display = "none";
    }
  }

  // Story 제목 설정
  document.getElementById("title").innerText = storyData.story_title;

  // 북마크 상태를 업데이트하고, 현재 사용자의 북마크 여부에 따라 아이콘 표시를 변경
  const bookmarkedIcon = document.getElementById("bookmarked-icon");
  const notBookmarkedIcon = document.getElementById("not-bookmarked-icon");

  if (localStorage.getItem("access")) {
    const payload = localStorage.getItem("payload");
    const payloadParse = JSON.parse(payload);
    const userId = payloadParse.user_id;

    // 스토리의 북마크된 사용자 목록을 가져와서 사용자 ID 리스트 생성
    const bookmarkUserList = storyData.bookmark_user_list;
    const bookmarkUserIdList = [];

    bookmarkUserList.forEach((user) => {
      bookmarkUserIdList.push(user["id"]);
    });

    // 현재 사용자의 ID가 북마크된 사용자 리스트에 포함되어 있으면 북마크된 상태로 표시
    if (bookmarkUserIdList.includes(userId)) {
      bookmarkedIcon.style.display = "";
      notBookmarkedIcon.style.display = "none";
    } else {
      // 그렇지 않으면 북마크되지 않은 상태로 표시
      bookmarkedIcon.style.display = "none";
      notBookmarkedIcon.style.display = "";
    }
  } else {
    // 로그인하지 않은 경우 북마크되지 않은 상태로 표시
    bookmarkedIcon.style.display = "none";
    notBookmarkedIcon.style.display = "";
  }

  // 좋아요 수 업데이트
  const likCount = document.getElementById("like-count");
  likCount.innerText = storyData.like_count + " likes";

  // 싫어요 수 업데이트
  const hateCount = document.getElementById("hate-count");
  hateCount.innerText = storyData.hate_count + " hates";

  const translator = document.getElementById("translate");
  translator.onclick = function () {
    translateStory(storyData, currentPage, totalContentCount);
  };
}

// 페이지의 동화 내용을 랜더링하는 함수
function createPage(storyData, currentPage, totalContentCount) {
  // 현재 페이지에 해당하는 데이터 가져오기
  const pageData = storyData.story_paragraph_list[parseInt(currentPage) - 1];

  // 동화책 페이지 랜더링을 위한 요소
  const storyContent = document.getElementById("content-box");

  // 랜더링 전에 내용 비워주기
  storyContent.innerHTML = "";

  // 페이지의 이미지와 내용을 담을 요소들 생성
  const pageDiv = document.createElement("div");
  pageDiv.className = "content-div";
  const pageImg = document.createElement("img");
  pageImg.className = "content-img";
  const pageContent = document.createElement("p");
  pageContent.className = "content-text";
  const pagenationCount = document.createElement("div");
  pagenationCount.className = "content-pagination";

  // 이미지와 내용에 데이터 설정
  if (pageData["story_image"] != null) {
    pageImg.src = `${backendBaseUrl}${pageData["story_image"]}`;
  }
  pageContent.innerText = pageData["paragraph"];
  pagenationCount.innerText = currentPage + " / " + storyData.story_paragraph_list.length;

  // 요소들을 조립하여 동화책 페이지에 추가
  pageDiv.appendChild(pageImg);
  pageDiv.appendChild(pageContent);
  storyContent.appendChild(pageDiv);
  storyContent.appendChild(pagenationCount);

  pageImg.classList.add("page-img");

  // 페이지 이동 버튼에 현재 페이지 번호를 id 값으로 부여
  const prePageButton = document.getElementById("pre-page-button");
  const nextPageButton = document.getElementById("next-page-button");

  prePageButton.innerHTML = "";
  nextPageButton.innerHTML = "";

  if (currentPage == 1 && totalContentCount != 1) {
    // 첫 번째 페이지이면서 총 컨텐츠 개수가 1개 이상일 때 다음 버튼 생성

    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "pagebutton";
    nextButton.innerText = ">>";
    nextButton.id = parseInt(currentPage) + 1;
    nextButton.onclick = function () {
      nextPage(storyData, nextButton.id, totalContentCount);
    };

    nextPageButton.appendChild(nextButton);
  } else if (1 < parseInt(currentPage) && parseInt(currentPage) < totalContentCount) {
    // 첫 번째 페이지가 아니면서 중간 페이지일 때 이전, 다음 버튼 생성

    const preButton = document.createElement("button");
    preButton.type = "button";
    preButton.className = "pagebutton";
    preButton.innerText = "<<";
    preButton.id = parseInt(currentPage) - 1;
    preButton.onclick = function () {
      prePage(storyData, preButton.id, totalContentCount);
    };

    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "pagebutton";
    nextButton.innerText = ">>";
    nextButton.id = parseInt(currentPage) + 1;
    nextButton.onclick = function () {
      nextPage(storyData, nextButton.id, totalContentCount);
    };

    prePageButton.appendChild(preButton);
    nextPageButton.appendChild(nextButton);
  } else if (1 < parseInt(currentPage) && parseInt(currentPage) === totalContentCount) {
    // 마지막 페이지일 때 이전 버튼 생성

    const preButton = document.createElement("button");
    preButton.type = "button";
    preButton.className = "pagebutton";
    preButton.innerText = "<<";
    preButton.id = parseInt(currentPage) - 1;
    preButton.onclick = function () {
      prePage(storyData, preButton.id, totalContentCount);
    };

    prePageButton.appendChild(preButton);
  }
}

// 다음 버튼에 연결된 함수
function nextPage(data, currentPage, totalContentCount) {
  createPage(data, currentPage, totalContentCount);
}

// 이전 버튼에 연결된 함수
function prePage(data, currentPage, totalContentCount) {
  createPage(data, currentPage, totalContentCount);
}

// 번역 버튼에 연결된 비동기 함수
async function translateStory(storyData, currentPage, totalContentCount) {
  // 선택된 언어 가져오기
  const targetLanguage = document.getElementById("language").value;

  if (!targetLanguage) {
    alert("번역할 언어를 선택해주세요.");
    return;
  }

  const translating = document.getElementById("translating");
  const translate = document.getElementById("translate");

  translate.style.display = "none";
  translating.style.display = "";

  try {
    // 스토리 데이터에서 스토리 스크립트 및 제목 추출
    const storyScript = storyData["story_paragraph_list"];
    const storyTitle = storyData["story_title"];

    const response = await fetch(`${backendBaseUrl}/story/translation/`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        story_script: storyScript,
        target_language: targetLanguage,
        story_title: storyTitle,
      }),
    });

    const responseJson = await response.json();

    // 각 문단에 번역된 내용 적용
    for (let i = 0; i < storyScript.length; i++) {
      storyScript[i]["paragraph"] = responseJson["translated_scripts"][i];
    }

    // 서버 응답이 성공인 경우 번역된 제목 적용 및 번역 페이지 생성
    if (response.status == 200) {
      document.getElementById("title").innerText = responseJson["translated_title"];
      createPage(storyData, currentPage, totalContentCount);
      translate.style.display = "";
      translating.style.display = "none";
    }
  } catch (error) {
    translate.style.display = "";
    translating.style.display = "none";
    alert("번역 요청 실패");
  }
}

// 댓글창을 열고 닫는 비동기 함수
async function toggleComments() {
  // 댓글 창의 현재 표시 상태를 확인하고, 토글하여 보이게 하거나 숨김
  const commentBox = document.getElementById("comment");
  commentBox.style.display = commentBox.style.display === "none" || commentBox.style.display === "" ? "block" : "none";

  try {
    const storyId = storyIdSearch(); // 현재 스토리의 ID를 가져옴
    const response = await fetch(`${backendBaseUrl}/story/${storyId}/comment/`, {
      method: "GET",
    });

    const responseJson = await response.json();

    const commentData = responseJson["comments"];

    const commentList = document.getElementById("comment-list");
    commentList.innerHTML = "";

    // 각 댓글을 렌더링
    commentData.forEach((comment) => {
      const singleComment = document.createElement("div");
      const authorInfo = document.createElement("div");
      const authorProfile = document.createElement("img");
      const authorNickname = document.createElement("div");
      const deleteButton = document.createElement("button");
      const content = document.createElement("p");

      singleComment.classList.add("single-comment");

      authorInfo.classList.add("comment-author-info");

      authorProfile.src = `${backendBaseUrl}${comment["author_image"]}`;
      authorProfile.classList.add("comment-author-profile");
      authorNickname.innerText = comment["author_nickname"];
      authorNickname.setAttribute("class", "comment-nickname");

      deleteButton.classList.add("btn-close");
      deleteButton.onclick = function () {
        deleteComment(comment["comment_id"]);
      };

      content.innerText = comment["content"];
      content.classList.add("comment-content");

      authorInfo.appendChild(authorProfile);
      authorInfo.appendChild(authorNickname);

      // 현재 사용자가 로그인되어 있고, 댓글 작성자가 현재 사용자인 경우 삭제 버튼 추가
      if (localStorage.getItem("access")) {
        const payload = localStorage.getItem("payload");
        const payloadParse = JSON.parse(payload);
        const commentAuthor = payloadParse.user_id;
        if (comment["author_id"] == commentAuthor) {
          authorInfo.appendChild(deleteButton);
        }
      }

      singleComment.appendChild(authorInfo);
      singleComment.appendChild(content);

      commentList.appendChild(singleComment);
    });
  } catch (error) {
    alert("댓글 로드 실패");
  }
}

// 댓글을 로드하는 비동기 함수
async function loadComments() {
  try {
    const storyId = storyIdSearch(); // 현재 스토리의 ID를 가져옴
    const response = await fetch(`${backendBaseUrl}/story/${storyId}/comment/`, {
      method: "GET",
    });

    const responseJson = await response.json();

    const commentData = responseJson["comments"];

    const commentList = document.getElementById("comment-list");
    commentList.innerHTML = "";

    // 각 댓글을 렌더링
    commentData.forEach((comment) => {
      const singleComment = document.createElement("div");
      const authorInfo = document.createElement("div");
      const authorProfile = document.createElement("img");
      const authorNickname = document.createElement("div");
      const deleteButton = document.createElement("button");
      const content = document.createElement("p");

      singleComment.classList.add("single-comment");

      authorInfo.classList.add("comment-author-info");

      authorProfile.src = `${backendBaseUrl}${comment["author_image"]}`;
      authorProfile.classList.add("comment-author-profile");
      authorNickname.innerText = comment["author_nickname"];
      authorNickname.setAttribute("class", "comment-nickname");

      deleteButton.classList.add("btn-close");
      deleteButton.onclick = function () {
        deleteComment(comment["comment_id"]);
      };

      content.innerText = comment["content"];
      content.classList.add("comment-content");

      authorInfo.appendChild(authorProfile);
      authorInfo.appendChild(authorNickname);

      // 현재 사용자가 로그인되어 있고, 댓글 작성자가 현재 사용자인 경우 삭제 버튼 추가
      if (localStorage.getItem("access")) {
        const payload = localStorage.getItem("payload");
        const payloadParse = JSON.parse(payload);
        const commentAuthor = payloadParse.user_id;
        if (comment["author_id"] == commentAuthor) {
          authorInfo.appendChild(deleteButton);
        }
      }

      singleComment.appendChild(authorInfo);
      singleComment.appendChild(content);

      commentList.appendChild(singleComment);
    });
  } catch (error) {
    alert("댓글 로드 실패");
  }
}

// 댓글을 삭제하는 비동기 함수
async function deleteComment(comment_id) {
  try {
    const storyId = storyIdSearch(); // 현재 스토리의 ID를 가져옴
    const response = await fetch(`${backendBaseUrl}/story/${storyId}/comment/${comment_id}/`, {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("access"),
      },
    });

    const responseJson = await response.json();
    const status = responseJson["status"];

    if (status == "204") {
      loadComments(); // 댓글이 삭제되면 업데이트된 댓글 목록을 로드
      return;
    } else if (status == "401" && response.status == 401) {
      alert(`${responseJson["error"]}`); // 권한이 없는 경우
      return;
    } else if (status == "403" && response.status == 403) {
      // 금지된 요청인 경우
      alert(`${responseJson["error"]}`);
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

      const storyId = storyIdSearch(); // 현재 스토리의 ID를 가져옴
      const commentContent = document.getElementById("comment-input").value;

      const response = await fetch(`${backendBaseUrl}/story/${storyId}/comment/`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("access"),
        },
        body: JSON.stringify({ content: commentContent }),
      });

      document.getElementById("comment-input").value = ""; // 댓글 작성 후 입력란 비우기

      const responseJson = await response.json();
      const status = responseJson["status"];

      if (status == "201" && response.status == 201) {
        loadComments(); // 댓글이 성공적으로 생성되면 업데이트된 댓글 목록을 로드
        return;
      } else if (status == "401" && response.status == 401) {
        alert(`${responseJson["error"]}`);
        return;
      } else if (status == "403" && response.status == 403) {
        alert(`${responseJson["error"]}`);
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
      const storyId = storyIdSearch(); // 현재 스토리의 ID를 가져옴
      const response = await fetch(`${backendBaseUrl}/story/${storyId}/`, {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("access"),
        },
      });

      const responseJson = await response.json();
      const status = responseJson["status"];

      if (status == "204") {
        alert(`${responseJson["success"]}`);
        window.location.href = `${frontendBaseUrl}`; // 동화 삭제 후 메인페이지로 이동
        return;
      } else if (status == "401" && response.status == 401) {
        alert(`${responseJson["error"]}`); // 권한이 없는 경우
        return;
      } else if (status == "403" && response.status == 403) {
        // 금지된 요청인 경우
        alert(`${responseJson["error"]}`);
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
  } catch (error) {
    alert("링크 복사 실패");
  }
}

// 페이스북 공유 링크를 새 창으로 열어주는 함수
function shareFacebook() {
  try {
    // 현재 페이지 URL을 인코딩
    const url = encodeURI(window.location.href);

    // 페이스북 공유 링크를 새 창으로 열기
    window.open("http://www.facebook.com/sharer/sharer.php?u=" + url);
  } catch (error) {
    alert("페이스북 공유 실패");
  }
}

// 카카오톡 공유 링크를 새 창으로 열어주는 비동기 함수
async function shareKakao() {
  try {
    // 데이터를 가져오기 위한 fetch 요청
    const response = await fetch(`${backendBaseUrl}/story/kakao/`, {
      method: "GET",
    });

    // fetch의 결과를 처리하고 필요한 데이터 추출
    const responseJson = await response.json();

    // kakao api key 가져오기
    const kakaoApiKey = responseJson.kakao_api_key;

    // Kakao Link 공유
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(kakaoApiKey);
    }
    window.Kakao.Link.sendDefault({
      objectType: "feed",
      content: {
        title: "YummyYagi", // 공유할 콘텐츠의 제목
        description: "동화책을 공유합니다.", // 공유할 콘텐츠의 설명
        imageUrl: frontendBaseUrl + "/static/img/yummy_yagi_logo.jpg", // 썸네일 이미지 URL
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
    alert("카카오 공유 실패: " + error);
  }
}

// 트위터 공유 링크를 새 창으로 열어주는 함수
function shareTwitter() {
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
      const storyId = storyIdSearch();
      const response = await fetch(`${backendBaseUrl}/story/${storyId}/bookmark/`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("access"),
          "Content-Type": "application/json",
        },
      });
      const responseJson = await response.json();
      const status = responseJson["status"];

      const bookmarkedIcon = document.getElementById("bookmarked-icon"); // 북마크된 아이콘
      const notBookmarkedIcon = document.getElementById("not-bookmarked-icon"); // 북마크되지 않은 아이콘

      // 북마크 상태에 따라 아이콘 표시 변경
      if (status == "200" && responseJson["success"] == "북마크") {
        bookmarkedIcon.style.display = "";
        notBookmarkedIcon.style.display = "none";
        return;
      } else if (status == "200" && responseJson["success"] == "북마크 취소") {
        bookmarkedIcon.style.display = "none";
        notBookmarkedIcon.style.display = "";
        return;
      } else if (status == "404" && response.status == 404) {
        alert(`${responseJson["error"]}`);
        return;
      } else if (status == "401" && response.status == 401) {
        alert(`${responseJson["error"]}`);
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
      const storyId = storyIdSearch();
      const response = await fetch(`${backendBaseUrl}/story/${storyId}/like/`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("access"),
          "Content-Type": "application/json",
        },
      });
      const responseJson = await response.json();
      const status = responseJson["status"];
      const likeCount = document.getElementById("like-count"); // 좋아요 수를 나타내는 엘리먼트

      // 좋아요 성공 시 좋아요 수 업데이트
      if (status == "200" && response.status == 200) {
        likeCount.innerText = responseJson["like_count"] + " likes"; // 좋아요 수 업데이트
        return;
      } else if (status == "404" && response.status == 404) {
        alert(`${responseJson["error"]}`);
        return;
      } else if (status == "401" && response.status == 401) {
        alert(`${responseJson["error"]}`);
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
      const storyId = storyIdSearch();
      const response = await fetch(`${backendBaseUrl}/story/${storyId}/hate/`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("access"),
          "Content-Type": "application/json",
        },
      });
      const responseJson = await response.json();
      const status = responseJson["status"];
      const hateCount = document.getElementById("hate-count"); // 싫어요 수를 나타내는 엘리먼트

      // 싫어요 성공 시 싫어요 수 업데이트
      if (status == "200" && response.status == 200) {
        hateCount.innerText = responseJson["hate_count"] + " hates"; // 싫어요 수 업데이트
        return;
      } else if (status == "404" && response.status == 404) {
        alert(`${responseJson["error"]}`);
        return;
      } else if (status == "401" && response.status == 401) {
        alert(`${responseJson["error"]}`);
        return;
      }
    } else {
      alert("로그인 후 이용해주세요.");
    }
  } catch (error) {
    alert("싫어요 실패");
  }
}
