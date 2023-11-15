function storyDetail(story_id) {
    window.location.href = `${frontend_base_url}/story_detail.html?story_id=${story_id}`
}

// 게시글 리스트 get api
async function getstories() {
    const response = await fetch(`${backend_base_url}/story/`)
    if (response.status == 200) {
        const response_json = await response.json()
        return response_json
    } else {
        alert("불러오는데 실패했습니다")
    }
}

// 게시글 리스트 가져오기
window.onload = async function loadstories() {
    // 게시글을 모두 가져오는 대신, 필요할 때 필터링하여 표시할 배열을 생성합니다.
    const stories = await getstories();
    const story_list = document.getElementById("story-list");
    stories.story_list.forEach(story => {
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
        newCardParagraph.setAttribute("style", "min-height: 48px;")
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
    })
}