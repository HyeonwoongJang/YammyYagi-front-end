const frontendBaseUrl = "http://127.0.0.1:5501";
const backendBaseUrl = "http://127.0.0.1:8000";

// 결제 페이지 로드에 필요한 데이터를 Response 받는 함수
async function orderData(amount, name) {
  const accessToken = localStorage.getItem("access");
  const response = await fetch(`${backendBaseUrl}/user/payment-page/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amount,
      name: name,
    }),
  });
  const responseJson = await response.json();

  // 응답 데이터로 결제 페이지 표시
  if (responseJson.status === "200") {
    const data = responseJson.order_data;
    showPayment(data);
    return;
  }

  if (response.status == 401) {
    alert("로그인 후 사용해주세요.");
    return;
  }

  if (response.status == 400) {
    alert(responseJson["error"]);
    return;
  }
}

// 결제 정보를 보여주는 함수
function showPayment(data) {
  document.getElementById("ticket-page").style.display = "none";
  document.getElementById("payment-page").style.display = "";

  // 결제 정보 채우기
  const merchantUid = document.getElementById("merchant-uid");
  const amount = document.getElementById("amount");
  const name = document.getElementById("name");
  const buyerEmail = document.getElementById("buyer-email");
  const buyerName = document.getElementById("buyer-name");

  merchantUid.innerText = data["merchant_uid"];
  amount.innerText = data["amount"];
  name.innerText = data["name"];
  buyerEmail.innerText = data["buyer_email"];
  buyerName.innerText = data["buyer_name"];

  // 각 결제 수단에 대한 이벤트 핸들러 등록
  const kakaopay = document.getElementById("kakaopay");
  kakaopay.onclick = function () {
    kakaoPay(data);
  };

  const tosspay = document.getElementById("tosspay");
  tosspay.onclick = function () {
    tossPay(data);
  };
}

// 카카오페이 결제 함수
function kakaoPay(data) {
  const IMP = window.IMP;
  IMP.init(data["pg_cid"]);
  IMP.request_pay(
    {
      pg: "kakaopay",
      merchantUid: "IMP" + data["merchant_uid"],
      name: data["name"],
      amount: data["amount"],
      buyerEmail: data["buyer_email"],
      buyerName: data["buyer_name"],
    },
    function (rsp) {
      if (rsp.success === true) {
        sendPaymentResult(rsp);
      } else {
        sendPaymentResult(rsp);
        return;
      }
    }
  );
}

// 토스페이 결제 함수
function tossPay(data) {
  const IMP = window.IMP;
  IMP.init(data["pg_cid"]);
  IMP.request_pay(
    {
      pg: "tosspay",
      merchantUid: "IMP" + data["merchant_uid"],
      name: data["name"],
      amount: data["amount"],
      buyerEmail: data["buyer_email"],
      buyerName: data["buyer_name"],
    },
    function (rsp) {
      if (rsp.success) {
        sendPaymentResult(rsp);
      } else {
        sendPaymentResult(rsp);
      }
    }
  );
}

// 결제 결과를 백엔드로 전송하는 함수
async function sendPaymentResult(rsp) {
  const accessToken = localStorage.getItem("access");
  const response = await fetch(`${backendBaseUrl}/user/payment-result/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      rsp: rsp,
    }),
  });

  const responseJson = await response.json();

  if (responseJson["success"]) {
    alert(responseJson["success"]);
  } else if (responseJson["error"]) {
    alert(responseJson["error"]);
  }

  location.reload();
}

// 티켓 구매 함수
async function buyTicket() {
  const goldenTotal = document.getElementById("golden-p").innerText.split(" ")[0];
  const silverTotal = document.getElementById("silver-p").innerText.split(" ")[0];
  const pinkTotal = document.getElementById("pink-p").innerText.split(" ")[0];

  const amount = parseInt(goldenTotal) + parseInt(silverTotal) + parseInt(pinkTotal) + " Won";

  const goldenCnt = document.getElementById("golden-input").value;
  const silverCnt = document.getElementById("silver-input").value;
  const pinkCnt = document.getElementById("pink-input").value;

  const name = `G${goldenCnt}_S${silverCnt}_P${pinkCnt}`;

  await orderData(amount, name);
}

// 골든 티켓 체크박스 상태 변경에 따른 처리
function goldenCheckBox() {
  const goldenCheckBox = document.getElementById("golden-check-box");
  const goldenInput = document.getElementById("golden-input");
  const goldenP = document.getElementById("golden-p");

  if (goldenCheckBox.checked) {
    goldenInput.disabled = false;
  } else {
    goldenInput.disabled = true;
    goldenInput.value = "0";
    goldenP.innerText = "0 Won";
  }
}

// 실버 티켓 체크박스 상태 변경에 따른 처리
function silverCheckBox() {
  const silverCheckBox = document.getElementById("silver-check-box");
  const silverInput = document.getElementById("silver-input");
  const silverP = document.getElementById("silver-p");

  if (silverCheckBox.checked) {
    silverInput.disabled = false;
  } else {
    silverInput.disabled = true;
    silverInput.value = "0";
    silverP.innerText = "0 Won";
  }
}

// 핑크 티켓 체크박스 상태 변경에 따른 처리
function pinkCheckBox() {
  const pinkCheckBox = document.getElementById("pink-check-box");
  const pinkInput = document.getElementById("pink-input");
  const pinkP = document.getElementById("pink-p");

  if (pinkCheckBox.checked) {
    pinkInput.disabled = false;
  } else {
    pinkInput.disabled = true;
    pinkInput.value = "0";
    pinkP.innerText = "0 Won";
  }
}

let goldenTotalPayment = 0;
let silverTotalPayment = 0;
let pinkTotalPayment = 0;

// 골든 티켓 수량 변경에 따른 가격 업데이트
function updateGoldenP() {
  const goldenP = document.getElementById("golden-p");
  const goldenInput = document.getElementById("golden-input");
  goldenTotalPayment = goldenInput.value * 500;
  goldenP.innerText = goldenTotalPayment + " Won";
  updateTotalPayment();
}

// 실버 티켓 체크박스 상태 변경에 따른 처리
function updateSilverP() {
  const silverP = document.getElementById("silver-p");
  const silverInput = document.getElementById("silver-input");
  silverTotalPayment = silverInput.value * 300;
  silverP.innerText = silverTotalPayment + " Won";
  updateTotalPayment();
}

// 핑크 티켓 체크박스 상태 변경에 따른 처리
function updatePinkP() {
  const pinkP = document.getElementById("pink-p");
  const pinkInput = document.getElementById("pink-input");
  pinkTotalPayment = pinkInput.value * 200;
  pinkP.innerText = pinkTotalPayment + " Won";
  updateTotalPayment();
}

// 총 결제 예정 금액
function updateTotalPayment() {
  const totalPayment = document.getElementById("total-payment");
  const tickerTotalPayment = goldenTotalPayment + silverTotalPayment + pinkTotalPayment + " Won";
  totalPayment.innerText = tickerTotalPayment;
}

// 결제 페이지에서 뒤로 가기 버튼
function backButton() {
  document.getElementById("payment-page").style.display = "none";
  document.getElementById("ticket-page").style.display = "";
}

//티켓 수량을 불러오는 함수
const payload = localStorage.getItem("payload");
if (payload) {
  fetch(`${backendBaseUrl}/user/usertickets/`, {
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

      document.getElementById("golden-count").innerText = goldenTicketCount;
      document.getElementById("silver-count").innerText = silverTicketCount;
      document.getElementById("pink-count").innerText = pinkTicketCount;
    })
    .catch((error) => console.error("Error:", error));
}
