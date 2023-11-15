function storyDetail(story_id) {
    window.location.href = `${frontend_base_url}/story/detail.html?story_id=${story_id}`
}

// 게시글 리스트 get api
async function getstories() {
    try {
        const response = await fetch(`${backend_base_url}/story/`)
        if (response.status == 200) {
            const response_json = await response.json()
            return response_json
        } else {
            alert("불러오는데 실패했습니다")
        }
    } catch (error) {
        alert("새로고침 후 다시 시도해주세요.");
    }
}

// 게시글 리스트 가져오기
async function loadstories(page) {
    try {
        const response = await fetch(`${backend_base_url}/story/?page=${page}`);
        if (response.status == 200) {
            const response_json = await response.json();
            const stories = response_json.story_list;
            const story_list = document.getElementById("story-list");
            story_list.innerHTML = ''; // 페이지 번호 누르면 기존 리스트 삭제
            stories.forEach(story => {
                const newCol = document.createElement("div");
                newCol.setAttribute("class", "col")
                newCol.setAttribute("onclick", `storyDetail(${story.story_id})`)

                const newCard = document.createElement("div")
                newCard.setAttribute("class", "card")
                newCard.setAttribute("id", story.story_id)

                newCol.appendChild(newCard)

                const storyImage = document.createElement("img")
                storyImage.setAttribute("class", "card-img-top")
                
                if(story.content.story_image){
                    storyImage.setAttribute("src", `${backend_base_url}/${story.content.story_image}`)
                }else{
                    storyImage.setAttribute("src", "https://blog.kakaocdn.net/dn/zicVv/btrDQeUfj28/tjDnucmXaMb7pMWpqkt1v1/img.jpg")
                }
                
                newCard.appendChild(storyImage)

                const newCardBody = document.createElement("div")
                newCardBody.setAttribute("class", "card-body")
                newCard.appendChild(newCardBody)
                // title
                const newCardTitle = document.createElement("h5")
                newCardTitle.setAttribute("class", "card-title")
                newCardTitle.innerText = story.story_title
                newCardBody.appendChild(newCardTitle)
                // first_paragraph
                const newCardParagraph = document.createElement("p")
                newCardParagraph.setAttribute("class", "card-text")
                newCardParagraph.setAttribute("style", "min-height: 72px;")
                newCardParagraph.innerText = story.content.story_first_paragraph
                newCardBody.appendChild(newCardParagraph)
                // hr
                const newCardHr = document.createElement("hr")
                newCardBody.appendChild(newCardHr)
                // country
                const newCardCountry = document.createElement("p")
                newCardCountry.setAttribute("class", "card-text")
                newCardCountry.innerText = story.author_country
                newCardBody.appendChild(newCardCountry)

                story_list.appendChild(newCol)
            });
            renderPagination(response_json.page_info.current_page, response_json.page_info.total_pages);
        } else {
            alert("불러오는데 실패했습니다");
        }
    } catch {
        alert("새로고침 후 다시 시도해주세요.");
    }
}

// 페이지네이션 생성
function renderPagination(currentPage, totalPages) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = ''; // 페이지네이션 갯수 바뀔 수도 있으니 초기화함

    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = 'page-item';
        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.textContent = i;

        pageLink.addEventListener('click', function () {
            changePage(i);
        });

        if (i === currentPage) {
            pageItem.classList.add('active'); // 현재 페이지 강조css
        }

        pageItem.appendChild(pageLink);
        pagination.appendChild(pageItem);
    }
}

// 페이지 변경 함수
function changePage(page) {
    loadstories(page);
    const newUrl = `${frontend_base_url}/story/?page=${page}`;
    history.pushState({ page: page }, null, newUrl);
    // { page: page }는 현재 페이지를 나타냄. 바로아래 함수에서 쓸 때 필요함.
}

// 인터넷 뒤로가기나 앞으로 가기 버튼 눌렀을때 적용시키기
window.addEventListener('popstate', function (event) {
    const page = event.state.page || 1;
    loadstories(page);
});

// 게시글 리스트 가져오기
window.onload = async function () {
    const initialPage = 1;
    loadstories(initialPage);

    // 초기 로드 시 페이지네이션 생성
    const stories = await getstories();
    const totalPages = stories.page_info.total_pages;
    renderPagination(initialPage, totalPages);
};