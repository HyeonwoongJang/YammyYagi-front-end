function storyDetail(story_id) {
  window.location.href = `${frontendBaseUrl}/story/detail.html?story_id=${story_id}`;
}

const selectCountry = document.getElementById("select-country");
// 게시글 리스트 get api
async function getStories() {
  try {
    const response = await fetch(`${backendBaseUrl}/story/`);
    if (response.status == 200) {
      const responseJson = await response.json();
      return responseJson;
    } else {
      alert("불러오는데 실패했습니다");
    }
  } catch (error) {
    console.log(error);
  }
}

// 게시글 리스트 가져오기
async function loadStories(page) {
  selectCountry.value = "";
  try {
    const response = await fetch(`${backendBaseUrl}/story/?page=${page}`);
    if (response.status == 200) {
      const responseJson = await response.json();
      const stories = responseJson.story_list;
      const storyList = document.getElementById("story-list");
      const paginationButton = document.getElementById("pagination-box");
      paginationButton.style.display = "block";
      storyList.innerHTML = ""; // 페이지 번호 누르면 기존 리스트 삭제
      stories.forEach((story) => {
        const newCol = document.createElement("div");
        newCol.setAttribute("class", "col");
        newCol.setAttribute("onclick", `storyDetail(${story.story_id})`);

        const newCard = document.createElement("div");
        newCard.setAttribute("class", "card");
        newCard.setAttribute("id", story.story_id);

        newCol.appendChild(newCard);

        const storyImage = document.createElement("img");
        storyImage.setAttribute("class", "card-img-top");

        if (story.content.story_image != null) {
          storyImage.setAttribute("src", `${backendBaseUrl}/${story.content.story_image}`);
        } else {
          storyImage.setAttribute(
            "src",
            "https://blog.kakaocdn.net/dn/zicVv/btrDQeUfj28/tjDnucmXaMb7pMWpqkt1v1/img.jpg"
          );
        }

        newCard.appendChild(storyImage);

        const newCardBody = document.createElement("div");
        newCardBody.setAttribute("class", "card-body");
        newCard.appendChild(newCardBody);
        // title
        const newCardTitle = document.createElement("h5");
        newCardTitle.setAttribute("class", "card-title");
        newCardTitle.innerText = story.story_title;
        newCardBody.appendChild(newCardTitle);
        // first_paragraph
        const newCardParagraph = document.createElement("p");
        newCardParagraph.setAttribute("class", "card-text");
        newCardParagraph.setAttribute("style", "min-height: 72px;");
        newCardParagraph.innerText = story.content.story_paragraph;
        newCardBody.appendChild(newCardParagraph);
        // hr
        const newCardHr = document.createElement("hr");
        newCardBody.appendChild(newCardHr);
        // country
        const newCardCountry = document.createElement("div");
        newCardCountry.setAttribute("class", "card-text");
        newCardCountry.innerText = story.author_country;
        newCardBody.appendChild(newCardCountry);
        // card-like-count
        const newCardLikeCount = document.createElement("div");
        newCardLikeCount.setAttribute("class", "cardlikecount");
        newCardLikeCount.innerText = `${story.like_user_list.length}`;
        newCardCountry.appendChild(newCardLikeCount);

        const newCardLikeCountDiv = document.createElement("svg");
        newCardLikeCountDiv.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        newCardLikeCountDiv.setAttribute("fill", "currentColor");
        newCardLikeCountDiv.setAttribute("class", "bi bi-suit-heart-fill");
        newCardLikeCountDiv.setAttribute("viewBox", "0 0 16 16");

        const newCardimogi = document.createElement("path");
        newCardimogi.innerText = `${story.like_user_list.length}`;
        newCardimogi.setAttribute(
          "d",
          "M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1z"
        );
        newCardLikeCountDiv.appendChild(newCardimogi);
        const newHTML = newCardLikeCountDiv.outerHTML.replace(/<\/path>/g, "");
        newCardCountry.appendChild(newCardLikeCountDiv);
        newCardLikeCountDiv.outerHTML = newHTML;

        storyList.appendChild(newCol);
      });
      renderPagination(responseJson.page_info.current_page, responseJson.page_info.total_pages);
    } else {
      alert("불러오는데 실패했습니다");
    }
  } catch (error) {
    console.log(error);
  }
}

// 페이지네이션 생성
function renderPagination(currentPage, totalPages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = ""; // 페이지네이션 갯수 바뀔 수도 있으니 초기화함

  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement("li");
    pageItem.className = "page-item";
    const pageLink = document.createElement("a");
    pageLink.className = "page-link";
    pageLink.textContent = i;

    pageLink.addEventListener("click", function () {
      changePage(i);
    });

    if (i === currentPage) {
      pageItem.classList.add("active"); // 현재 페이지 강조css
    }

    pageItem.appendChild(pageLink);
    pagination.appendChild(pageItem);
  }
}

// 페이지 변경 함수
function changePage(page) {
  loadStories(page);
  const newUrl = `${frontendBaseUrl}/story/?page=${page}`;
  history.pushState({ page: page }, null, newUrl);
  // { page: page }는 현재 페이지를 나타냄. 바로아래 함수에서 쓸 때 필요함.
}

// 인터넷 뒤로가기나 앞으로 가기 버튼 눌렀을때 적용시키기
window.addEventListener("popstate", function (event) {
  const page = event.state && event.state.page ? event.state.page : 1;
  loadStories(page);
});

// 좋아요 순 게시글 가져오기
async function getLikeStories() {
  selectCountry.value = "";
  try {
    const response = await fetch(`${backendBaseUrl}/story/like_sorted/`);
    if (response.status == 200) {
      const responseJson = await response.json();
      const stories = responseJson.story_list;
      const paginationbutton = document.getElementById("pagination-box");
      paginationbutton.style.display = "none";
      const storyList = document.getElementById("story-list");
      storyList.innerHTML = ""; // 페이지 번호 누르면 기존 리스트 삭제
      stories.forEach((story) => {
        const newCol = document.createElement("div");
        newCol.setAttribute("class", "col");
        newCol.setAttribute("onclick", `storyDetail(${story.story_id})`);

        const newCard = document.createElement("div");
        newCard.setAttribute("class", "card");
        newCard.setAttribute("id", story.story_id);

        newCol.appendChild(newCard);

        const storyImage = document.createElement("img");
        storyImage.setAttribute("class", "card-img-top");

        if (story.content.story_image != null) {
          storyImage.setAttribute("src", `${backendBaseUrl}/${story.content.story_image}`);
        } else {
          storyImage.setAttribute(
            "src",
            "https://blog.kakaocdn.net/dn/zicVv/btrDQeUfj28/tjDnucmXaMb7pMWpqkt1v1/img.jpg"
          );
        }

        newCard.appendChild(storyImage);

        const newCardBody = document.createElement("div");
        newCardBody.setAttribute("class", "card-body");
        newCard.appendChild(newCardBody);
        // title
        const newCardTitle = document.createElement("h5");
        newCardTitle.setAttribute("class", "card-title");
        newCardTitle.innerText = story.story_title;
        newCardBody.appendChild(newCardTitle);
        // first_paragraph
        const newCardParagraph = document.createElement("p");
        newCardParagraph.setAttribute("class", "card-text");
        newCardParagraph.setAttribute("style", "min-height: 72px;");
        newCardParagraph.innerText = story.content.story_paragraph;
        newCardBody.appendChild(newCardParagraph);
        // hr
        const newCardHr = document.createElement("hr");
        newCardBody.appendChild(newCardHr);
        // country
        const newCardCountry = document.createElement("div");
        newCardCountry.setAttribute("class", "card-text");
        newCardCountry.innerText = story.author_country;
        newCardBody.appendChild(newCardCountry);
        // card-like-count
        const newCardLikeCount = document.createElement("div");
        newCardLikeCount.setAttribute("class", "cardlikecount");
        newCardLikeCount.innerText = `${story.like_user_list.length}`;
        newCardCountry.appendChild(newCardLikeCount);

        const newCardLikeCountDiv = document.createElement("svg");
        newCardLikeCountDiv.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        newCardLikeCountDiv.setAttribute("fill", "currentColor");
        newCardLikeCountDiv.setAttribute("class", "bi bi-suit-heart-fill");
        newCardLikeCountDiv.setAttribute("viewBox", "0 0 16 16");

        const newCardimogi = document.createElement("path");
        newCardimogi.innerText = `${story.like_user_list.length}`;
        newCardimogi.setAttribute(
          "d",
          "M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1z"
        );
        newCardLikeCountDiv.appendChild(newCardimogi);
        const newHTML = newCardLikeCountDiv.outerHTML.replace(/<\/path>/g, "");
        newCardCountry.appendChild(newCardLikeCountDiv);
        newCardLikeCountDiv.outerHTML = newHTML;

        storyList.appendChild(newCol);
      });
    } else {
      alert("불러오는데 실패했습니다");
    }
  } catch (error) {
    console.log(error);
  }
}

// 국가별 게시글 리스트 get api
async function getCountryStories() {
  if (selectCountry.value === "") {
    return;
  }
  try {
    const response = await fetch(`${backendBaseUrl}/story/country_sorted/${selectCountry.value}/`);
    if (response.status == 200) {
      const responseJson = await response.json();
      const stories = responseJson.story_list;
      const paginationbutton = document.getElementById("pagination-box");
      paginationbutton.style.display = "none";
      const storyList = document.getElementById("story-list");
      storyList.innerHTML = ""; // 페이지 번호 누르면 기존 리스트 삭제
      stories.forEach((story) => {
        const newCol = document.createElement("div");
        newCol.setAttribute("class", "col");
        newCol.setAttribute("onclick", `storyDetail(${story.story_id})`);

        const newCard = document.createElement("div");
        newCard.setAttribute("class", "card");
        newCard.setAttribute("id", story.story_id);

        newCol.appendChild(newCard);

        const storyImage = document.createElement("img");
        storyImage.setAttribute("class", "card-img-top");

        if (story.content.story_image != null) {
          storyImage.setAttribute("src", `${backendBaseUrl}/${story.content.story_image}`);
        } else {
          storyImage.setAttribute(
            "src",
            "https://blog.kakaocdn.net/dn/zicVv/btrDQeUfj28/tjDnucmXaMb7pMWpqkt1v1/img.jpg"
          );
        }

        newCard.appendChild(storyImage);

        const newCardBody = document.createElement("div");
        newCardBody.setAttribute("class", "card-body");
        newCard.appendChild(newCardBody);
        // title
        const newCardTitle = document.createElement("h5");
        newCardTitle.setAttribute("class", "card-title");
        newCardTitle.innerText = story.story_title;
        newCardBody.appendChild(newCardTitle);
        // first_paragraph
        const newCardParagraph = document.createElement("p");
        newCardParagraph.setAttribute("class", "card-text");
        newCardParagraph.setAttribute("style", "min-height: 72px;");
        newCardParagraph.innerText = story.content.story_paragraph;
        newCardBody.appendChild(newCardParagraph);
        // hr
        const newCardHr = document.createElement("hr");
        newCardBody.appendChild(newCardHr);
        // country
        const newCardCountry = document.createElement("div");
        newCardCountry.setAttribute("class", "card-text");
        newCardCountry.innerText = story.author_country;
        newCardBody.appendChild(newCardCountry);
        // card-like-count
        const newCardLikeCount = document.createElement("div");
        newCardLikeCount.setAttribute("class", "cardlikecount");
        newCardLikeCount.innerText = `${story.like_user_list.length}`;
        newCardCountry.appendChild(newCardLikeCount);

        const newCardLikeCountDiv = document.createElement("svg");
        newCardLikeCountDiv.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        newCardLikeCountDiv.setAttribute("fill", "currentColor");
        newCardLikeCountDiv.setAttribute("class", "bi bi-suit-heart-fill");
        newCardLikeCountDiv.setAttribute("viewBox", "0 0 16 16");

        const newCardimogi = document.createElement("path");
        newCardimogi.innerText = `${story.like_user_list.length}`;
        newCardimogi.setAttribute(
          "d",
          "M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1z"
        );
        newCardLikeCountDiv.appendChild(newCardimogi);
        const newHTML = newCardLikeCountDiv.outerHTML.replace(/<\/path>/g, "");
        newCardCountry.appendChild(newCardLikeCountDiv);
        newCardLikeCountDiv.outerHTML = newHTML;

        storyList.appendChild(newCol);
      });
    } else {
      alert("불러오는데 실패했습니다");
    }
  } catch (error) {
    console.log(error);
  }
}

// 게시글 리스트 가져오기
window.onload = async function () {
  const initialPage = 1;
  loadStories(initialPage);
  const stories = await getStories();
  const totalPages = stories.page_info.total_pages;
  renderPagination(initialPage, totalPages);
};
