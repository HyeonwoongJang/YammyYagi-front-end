const submitButton = document.querySelector("#submit-theme");
const outPutElement = document.querySelector(".output-container");
const inputElement = document.querySelector("input#prompt");
const bottomSection = document.querySelector(".bottom-section");
const imagegenButton = document.querySelector("#image-gen");
const storygenButton = document.querySelector("#submit-title");
const titleInput = document.querySelector("#title");
const targetLanguage = document.getElementById("language");
const first_input_container = document.getElementById("first-input-container");
const first_spinner = document.getElementById("first-spinner");
const second_spinner = document.getElementById("second-spinner");
const third_spinner = document.getElementById("third-spinner");
const create_btn_msg = document.getElementById("create-btn-msg");
const scriptImage = document.querySelector("#script-img");
const scriptText = document.querySelector("#script-text");
const editableText = document.querySelector("#editable-text");
const imageTypeContainer = document.querySelector("#image-type-container");
const imageType = document.querySelector("#image-type");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");
const myModal = document.getElementById("my_modal")
const tempSaveButton = document.getElementById("temp-save-button")
const editButton = document.getElementById("edit-button")

// 각 페이지의 이미지 URL 및 문단 데이터를 저장하는 배열
let imageUrls = [];
let paragraphs = [];
const editPage = []; // 각 페이지의 수정된 내용을 저장하는 배열

// 페이지네이션을 위한 변수
let current_page = 1;
let total_page = paragraphs.length;

// 페이지 내용 수정 텍스트 박스의 상태를 저장하는 변수
let isEditButtonActive = false;

window.onload = () => {
  if (!localStorage.getItem("access")) {
    alert("잘못된 접근입니다.");
    window.location.href = `${frontend_base_url}`;
    return
  }

  // 로컬 스토리지에 임시 저장된 페이지 정보가 있으면 '이어쓰기'/'삭제' 모달을 띄워줌
  if (localStorage.getItem("paragraphs")) {
    myModal.style.display="block"
  }

  // 일정 시간 간격으로 자동 저장
  setInterval(saveTempContent, 10000); // 10초마다 저장 (단위: 밀리초)

};

// 임시 저장 버튼에 연결된 함수
function saveTemporary() {
  if (paragraphs.length == 0) {
    alert('빈 페이지입니다.')
    return
  } else {
    saveTempContent()
    alert("임시 저장 완료. 임시 저장은 한 개의 동화책만 가능합니다.")
  }
}

// 임시 저장할 데이터가 있으면 localstorage에 저장
function saveTempContent() {
  if (paragraphs.length != 0) {
    if (editPage.length != 0) {
      for (let i = 0; i < editPage.length; i++) {
        paragraphs[i] = editPage[i]
      }
    }
    localStorage.setItem("paragraphs", JSON.stringify(paragraphs))

    if (imageUrls.length != 0) {
      localStorage.setItem("imageUrls", JSON.stringify(imageUrls))
    }
    
  }
}

// localStorage에서 임시 콘텐츠를 로드
function loadTemp() {
  let temp_paragraphs = localStorage.getItem("paragraphs");
  let temp_imageUrls = localStorage.getItem("imageUrls");

  if (temp_paragraphs) {
    paragraphs = JSON.parse(temp_paragraphs);
  }

  if (temp_imageUrls) {
    imageUrls = JSON.parse(temp_imageUrls);
    titleInput.style.display = "block";
    storygenButton.style.display = "block";
  }
  myModal.style.display="none"
  imageTypeContainer.style.display = "block";
  imagegenButton.style.display = "block";
  first_input_container.style.display = "none";
  outPutElement.style.display = "block";

  total_page = paragraphs.length;
  renderPage(1);
}

// localStorage에서 임시 콘텐츠를 삭제
function deleteTemp() {
  if (localStorage.getItem("paragraphs")) {
    localStorage.removeItem("paragraphs")
  }
  if (localStorage.getItem("imageUrls")) {
    localStorage.removeItem("imageUrls")
  }

  myModal.style.display="none"
}

// 입력 값을 변경하는 함수
function changeInput(value) {
  inputElement.value = value;
}

// 백엔드에서 GPT 동화를 가져오기 위한 비동기 함수
async function getMessage() {
  console.log("clicked");

  if (!inputElement.value) {
    alert('생성할 동화의 주제를 입력해주세요.')
    return
  }

  if (!targetLanguage.value) {
    alert('생성할 동화의 언어를 선택해주세요.')
    return
  }

  const access_token = localStorage.getItem("access");
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subject: inputElement.value,
      target_language: targetLanguage.value,
    }),
  };
  try {
    // 로딩 스피너 표시
    first_spinner.style.display = "block";
    const response = await fetch(`${backend_base_url}/story/fairytail_gpt/`, options);
    const data = await response.json();
    if (response.status == 400) {
      alert(data.error);
      window.location.reload();
    } else if (response.status == 201) {
      alert(data.success);

      const script = data.script.replace(/\n\n/g, "<br><br>");

      // paragraphs 및 imageUrls 배열 초기화
      paragraphs.length = 0;
      imageUrls.length = 0;

      // 스크립트를 두 문단씩 나누어 paragraphs 배열에 추가
      const scriptParagraphs = script.split("<br><br>");
      for (let i = 0; i < scriptParagraphs.length; i += 2) {
        const pair = scriptParagraphs.slice(i, i + 2);
        paragraphs.push(pair.join("\n\n"));
      }

      const defaultMessage = document.getElementById("information");
      defaultMessage.style.display = "none";

      // 전체 페이지 수 설정 및 현재 페이지 렌더링
      total_page = paragraphs.length;
      renderPage(current_page);

      // 로딩 스피너 숨기고 이미지 생성 버튼 표시
      first_spinner.style.display = "none";
      imageTypeContainer.style.display = "block";
      imagegenButton.style.display = "block";
      first_input_container.style.display = "none";
      outPutElement.style.display = "block";

      // 번역 및 입력 값이 있는 경우 클릭 가능한 단락 생성
      if (data.translation && inputElement.value) {
        const pElement = document.createElement("p");
        pElement.textContent = inputElement.value;
        pElement.addEventListener("click", () => changeInput(pElement.textContent));
      }
    }
  } catch (error) {
    console.error(error);
  }
}

// 입력 값을 지우는 함수
function clearInput() {
  inputElement.value = "";
}

// 페이지를 렌더링하는 함수
function renderPage(page) {
  console.log(`${page}/${total_page} 페이지 입니다.`);

  tempSaveButton.style.display="block"
  editButton.style.display="block"

  // 티켓 선택란 초기화
  imageType.value = "";
  getTicketCount();

  // 이미지 초기화
  scriptImage.src = "";
  scriptImage.style.width = "300px"; // 가로 크기 고정
  scriptImage.style.height = "auto"; // 세로 크기 자동 조정

  // 이미지가 있는 경우 이미지 설정
  if (imageUrls[page - 1]) {
    scriptImage.src = imageUrls[page - 1];
    create_btn_msg.style.display = "block";
  } else {
    create_btn_msg.style.display = "";
  }

  // 페이지에 대한 수정된 내용이 있다면 editableText로 표시
  if (editPage[page - 1] == paragraphs[page - 1]) {
    editableText.style.display = "block";
    scriptText.style.display = "none";
    editableText.value = paragraphs[page - 1];

    // 이미지 생성 버튼 클릭 이벤트 설정
    imagegenButton.onclick = function () {
      getImage(editableText.value, page - 1);
    };
  } else {
    // 수정된 내용이 없으면 일반적인 텍스트로 표시
    editableText.style.display = "none";
    scriptText.style.display = "block";

    // 텍스트 초기화 및 현재 페이지의 단락 설정
    scriptText.innerText = "";
    scriptText.innerText = paragraphs[page - 1];

    // 이미지 생성 버튼 클릭 이벤트 설정
    imagegenButton.onclick = function () {
      getImage(paragraphs[page - 1], page - 1);
    };

    // 수정하기 or 완료 버튼을 클릭할 때 editText 함수 호출
    editButton.onclick = function () {
      // 버튼 상태
      isEditButtonActive = !isEditButtonActive;

      // editText 함수 호출
      editText(scriptText.innerText);
    };
  }

  // 첫 페이지 및 총 페이지가 1이 아닌 경우
  if (page == 1 && total_page != 1) {
    prevButton.style.display = "none";
    nextButton.style.display = "";
    nextButton.onclick = function () {
      nextPage(page);
    };
  }

  // 페이지가 1보다 크고 총 페이지보다 작은 경우
  if (1 < page && page < total_page) {
    prevButton.style.display = "";
    nextButton.style.display = "";

    prevButton.onclick = function () {
      prevPage(page);
    };

    nextButton.onclick = function () {
      nextPage(page);
    };
  }

// 텍스트를 편집하거나 표시하는 함수
function editText(script) {
  
  if (isEditButtonActive) {
    scriptText.style.display = "none"; 
    editableText.style.display = "block"; 
    editableText.value = script; 
    editButton.innerText = "완료"

  } else {
    scriptText.style.display = "block"; 
    editableText.style.display = "none"; 
    scriptText.innerText = editableText.value;
    editButton.innerText = "수정하기"
    paragraphs[page - 1] = editableText.value;
  }
}

  // 페이지가 1보다 크고 페이지가 총 페이지인 경우
  if (1 < page && page == total_page) {
    prevButton.style.display = "";
    nextButton.style.display = "none";
    prevButton.onclick = function () {
      prevPage(page);
    };
  }
}

// 이전 페이지로 이동하는 함수
function prevPage(page) {
  page -= 1;
  renderPage(page);
}

// 다음 페이지로 이동하는 함수
function nextPage(page) {
  if (page < total_page) {
    page += 1;
    renderPage(page);
  }
}

// GPT 제출 버튼 클릭 이벤트 리스너
submitButton.addEventListener("click", getMessage);

//티켓 수량을 불러오는 함수
async function getTicketCount() {
  try {
    fetch(`${backend_base_url}/user/usertickets/`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("access"),
      },
    })
      .then((response) => response.json())
      .then((ticketData) => {
        const goldenTicketCount = ticketData.golden_ticket_count;
        const silverTicketCount = ticketData.silver_ticket_count;
        const pinkTicketCount = ticketData.pink_ticket_count;

        document.getElementById("golden-ticket-create").innerText = "Golden Ticket : " + goldenTicketCount;
        document.getElementById("silver-ticket-create").innerText = "Silver Ticket : " + silverTicketCount;
        document.getElementById("pink-ticket-create").innerText = "Pink Ticket : " + pinkTicketCount;
      })
      .catch((error) => console.error("Error:", error));
  } catch (error) {
    console.log(error);
  }
}

// 이미지를 가져오는 비동기 함수
async function getImage(script, imageId) {
  // 티켓이 선택되지 않은 경우 경고 메시지를 표시하고 함수 종료
  if (imageType.value == "") {
    alert("이미지 타입을 위한 티켓을 선택해주세요.");
    return;
  }

  // 이미지 생성 실패로 인해 사용자에 의해 수정된 스크립트가 있을 경우
  if (editPage[imageId]) {
    script = editableText.value;
  }

  console.log("image generated...");

  // 로딩 스피너 표시
  second_spinner.style.display = "block";

  const access_token = localStorage.getItem("access");
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      script: script,
      ticket: imageType.value,
    }),
  };
  try {
    const response = await fetch(`${backend_base_url}/story/image_dall-e/`, options);
    const res_json = await response.json();

      // 티켓 선택란 초기화
      imageType.value = "";
      getTicketCount();

      // 로딩 스피너 숨김
      second_spinner.style.display = "none";
    if (response.status == 500 || response.status == 400) {
      // 이미지 생성에 실패한 경우 에러 메시지를 표시하고 로딩 스피너 숨김
      alert(res_json["error"]);
      second_spinner.style.display = "none";

      // 이미지 생성에 실패한 페이지의 내용을 수정된 내용으로 갱신하고 해당 페이지를 다시 렌더링
      paragraphs[imageId] = script;
      editPage[imageId] = script;
      renderPage(imageId + 1);
    }

    if (response.status == 402) {
      // 이미지 생성에 실패한 경우 에러 메시지를 표시하고 로딩 스피너 숨김
      alert(res_json["error"]);
      second_spinner.style.display = "none";

      // 해당 티켓 소진 시, 티켓 결제 페이지를 새 창으로 띄움
      window.open(
        "../user/payment.html",
        "티켓 결제 페이지",
        "width=700, height=550, top=50%, left=50%, transform=translate(-50%, -50%)"
      );

      // 해당 티켓 소진 시에는 해당 페이지를 다시 렌더링
      paragraphs[imageId] = script;
      renderPage(imageId + 1);
    }

    if (response.status == 201) {
      // 이미지 URL 가져오기
      const image_url = res_json.image_url;

      // imageUrls 배열에 이미지 URL 저장
      imageUrls[imageId] = image_url;

      // 이미지 엘리먼트의 소스 설정
      scriptImage.src = imageUrls[imageId];

      // 제목 입력란과 이야기 생성 버튼 표시
      titleInput.style.display = "block";
      storygenButton.style.display = "block";
      create_btn_msg.style.display = "block";
    }
  } catch (error) {
    console.error(error);
  }
}

// 동화책 출판 버튼 클릭 이벤트 리스너
async function createStory() {
  console.log("You are going to make a fairytale...");

  if (!titleInput.value) {
    alert("동화책 제목을 입력해주세요.");
    return;
  } else if (imageUrls.length == 0) {
    // 이미지를 최소 1개 이상 생성하도록 유도
    alert("동화 이미지는 최소 1개 이상 생성해주세요.");
    return;
  } else {
    // 문단과 해당 문단의 이미지를 한 컨텐츠 객체로 저장하기 위해 문단 배열과 이미지 배열을 맞춰줍니다.
    for (let i = 0; i < paragraphs.length; i++) {
      if (imageUrls[i] === null || imageUrls[i] === undefined) {
        imageUrls[i] = "None";
      }
    }

    // 로딩 스피너 표시
    third_spinner.style.display = "block";
    const access_token = localStorage.getItem("access");
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paragraph_list: paragraphs,
        image_url_list: imageUrls,
        title: titleInput.value,
      }),
    };
    try {
      const response = await fetch(`${backend_base_url}/story/`, options);
      const res_json = await response.json();

      // 로딩 스피너 숨기기
      third_spinner.style.display = "none";
      const id = res_json.story_id;
      if (res_json.status == 201) {
        if (localStorage.getItem("paragraphs")) {
          localStorage.removeItem("paragraphs")
        }
        if (localStorage.getItem("imageUrls")) {
          localStorage.removeItem("imageUrls")
        }
        window.alert(res_json.success);
        window.location.href = `${frontend_base_url}/story/detail.html?story_id=${id}`;
      } else {
        alert(`동화 작성 실패 : ${res_json["error"]}`);
        console.error(error);
      }
    } catch (error) {
      alert("동화 작성 실패");
      console.error(error);
    }
  }
}

// 동화책 출판 버튼 클릭 이벤트 리스너 등록
storygenButton.addEventListener("click", createStory);
