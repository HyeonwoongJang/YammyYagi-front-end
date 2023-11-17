// 국가별 인기TOP8 게시글 리스트 가져오기
async function getcountrystories() {
    try {
        // 백엔드 url의 <str:author_country>를 가져온 후, fetch (GET)
        const selectcountry = document.getElementById('select-country').value;
        const response = await fetch(`${backend_base_url}/story/country_sorted/${selectcountry}/`)
        if (response.status == 200) {
            // 페이지네이션 삭제
            const paginationbutton = document.getElementById('pagination-box');
            paginationbutton.style.display = "none";
            // 기존 리스트 삭제
            const story_list = document.getElementById("story-list");
            story_list.innerHTML = '';
            // fetch (GET 요청) data의 story_list를 반복시킴
            const response_json = await response.json();
            const stories = response_json.story_list;
            stories.forEach(story => {
                // 전체 div
                const newCol = document.createElement("div");
                newCol.setAttribute("class", "col");
                newCol.setAttribute("onclick", `storyDetail(${story.story_id})`);
                // 카드 div
                const newCard = document.createElement("div");
                newCard.setAttribute("class", "card");
                newCard.setAttribute("id", story.story_id);
                newCol.appendChild(newCard);
                // 카드 div > 썸네일 이미지
                const storyImage = document.createElement("img");
                storyImage.setAttribute("class", "card-img-top");
                if(story.content.story_image){
                    storyImage.setAttribute("src", `${backend_base_url}/${story.content.story_image}`)
                } else { // 지워도 됌. (게시글에 이미지 없을 때, 기본 이미지)
                    storyImage.setAttribute("src", "https://blog.kakaocdn.net/dn/zicVv/btrDQeUfj28/tjDnucmXaMb7pMWpqkt1v1/img.jpg")
                }
                newCard.appendChild(storyImage);
                // 카드 div > 텍스트 div
                const newCardBody = document.createElement("div");
                newCardBody.setAttribute("class", "card-body");
                newCard.appendChild(newCardBody);
                // 카드 div > 텍스트 div > title
                const newCardTitle = document.createElement("h5");
                newCardTitle.setAttribute("class", "card-title");
                newCardTitle.innerText = story.story_title;
                newCardBody.appendChild(newCardTitle);
                // 카드 div > 텍스트 div > first_paragraph
                const newCardParagraph = document.createElement("p");
                newCardParagraph.setAttribute("class", "card-text");
                newCardParagraph.setAttribute("style", "min-height: 72px;");
                newCardParagraph.innerText = story.content.story_first_paragraph;
                newCardBody.appendChild(newCardParagraph);
                // 카드 div > 텍스트 div > hr
                const newCardHr = document.createElement("hr");
                newCardBody.appendChild(newCardHr)
                // 카드 div > 텍스트 div > 하단 div
                const newCardCountry = document.createElement("div");
                newCardCountry.setAttribute("class", "card-text");
                newCardCountry.innerText = story.author_country;
                newCardBody.appendChild(newCardCountry);
                // 카드 div > 텍스트 div > 하단 div > 좋아요 개수
                const newCardLikeCount = document.createElement("div");
                newCardLikeCount.setAttribute("class", "cardlikecount");
                newCardLikeCount.innerText = `${story.like_user_list.length}`;
                newCardCountry.appendChild(newCardLikeCount);
                // 카드 div > 텍스트 div > 하단 div > 하트svg 이미지
                const newCardLikeCountDiv = document.createElement("svg");
                newCardLikeCountDiv.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                newCardLikeCountDiv.setAttribute("fill", "currentColor");
                newCardLikeCountDiv.setAttribute("class", "bi bi-suit-heart-fill");
                newCardLikeCountDiv.setAttribute("viewBox", "0 0 16 16");
                const newCardimogi = document.createElement("path");
                newCardimogi.innerText = `${story.like_user_list.length}`;
                newCardimogi.setAttribute("d", "M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1z");
                newCardLikeCountDiv.appendChild(newCardimogi);
                const newHTML = newCardLikeCountDiv.outerHTML.replace(/<\/path>/g, '');
                newCardCountry.appendChild(newCardLikeCountDiv);
                newCardLikeCountDiv.outerHTML = newHTML;
                // 전체 스토리 리스트 추가
                story_list.appendChild(newCol);
            });
        } else {
            // 어떤 error인지 추가할 필요성 있음
            alert("불러오는데 실패했습니다")
        }
    } catch (error) {
        console.log(error);
        alert("새로고침 후 다시 시도해주세요.");
    }
}