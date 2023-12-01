const frontend_base_url = "https://www.yummyyagi.com";
const backend_base_url = "https://api.yummyyagi.com";
// 결제 페이지 로드에 필요한 데이터를 Response 받는 함수
async function orderData(amount, name) {
  const access_token = localStorage.getItem("access");
  const response = await fetch(`${backend_base_url}/user/payment-page/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amount,
      name: name,
    }),
  });
  const response_json = await response.json();

  // 응답 데이터로 결제 페이지 표시
  if (response_json.status === "200") {
    const data = response_json.order_data;
    showPayment(data);
    return;
  }

  if (response.status == 401) {
    alert("로그인 후 사용해주세요.");
    return;
  }

  if (response.status == 400) {
    alert(response_json["error"]);
    return;
  }
}

// 결제 정보를 보여주는 함수
function showPayment(data) {
  document.getElementById("ticket-page").style.display = "none";
  document.getElementById("payment-page").style.display = "";

  // 결제 정보 채우기
  const merchant_uid = document.getElementById("merchant-uid");
  const amount = document.getElementById("amount");
  const name = document.getElementById("name");
  const buyer_email = document.getElementById("buyer-email");
  const buyer_name = document.getElementById("buyer-name");

  merchant_uid.innerText = data["merchant_uid"];
  amount.innerText = data["amount"];
  name.innerText = data["name"];
  buyer_email.innerText = data["buyer_email"];
  buyer_name.innerText = data["buyer_name"];

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
      merchant_uid: "IMP" + data["merchant_uid"],
      name: data["name"],
      amount: data["amount"],
      buyer_email: data["buyer_email"],
      buyer_name: data["buyer_name"],
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
      merchant_uid: "IMP" + data["merchant_uid"],
      name: data["name"],
      amount: data["amount"],
      buyer_email: data["buyer_email"],
      buyer_name: data["buyer_name"],
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
  const access_token = localStorage.getItem("access");
  const response = await fetch(`${backend_base_url}/user/payment-result/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      rsp: rsp,
    }),
  });

  const response_json = await response.json();

  if (response_json["success"]) {
    alert(response_json["success"]);
  } else if (response_json["error"]) {
    alert(response_json["error"]);
  }

  location.reload();
}

// 티켓 구매 함수
async function buyTicket() {
  const golden_total = document.getElementById("golden-p").innerText.split(" ")[0];
  const silver_total = document.getElementById("silver-p").innerText.split(" ")[0];
  const pink_total = document.getElementById("pink-p").innerText.split(" ")[0];

  const amount = parseInt(golden_total) + parseInt(silver_total) + parseInt(pink_total) + " Won";

  const golden_cnt = document.getElementById("golden-input").value;
  const silver_cnt = document.getElementById("silver-input").value;
  const pink_cnt = document.getElementById("pink-input").value;

  const name = `G${golden_cnt}_S${silver_cnt}_P${pink_cnt}`;

  await orderData(amount, name);
}

// 골든 티켓 체크박스 상태 변경에 따른 처리
function goldenCheckBox() {
  const golden_check_box = document.getElementById("golden-check-box");
  const golden_input = document.getElementById("golden-input");
  const golden_p = document.getElementById("golden-p");

  if (golden_check_box.checked) {
    golden_input.disabled = false;
  } else {
    golden_input.disabled = true;
    golden_input.value = "0";
    golden_p.innerText = "0 Won";
  }
}

// 실버 티켓 체크박스 상태 변경에 따른 처리
function silverCheckBox() {
  const silver_check_box = document.getElementById("silver-check-box");
  const silver_input = document.getElementById("silver-input");
  const silver_p = document.getElementById("silver-p");

  if (silver_check_box.checked) {
    silver_input.disabled = false;
  } else {
    silver_input.disabled = true;
    silver_input.value = "0";
    silver_p.innerText = "0 Won";
  }
}

// 핑크 티켓 체크박스 상태 변경에 따른 처리
function pinkCheckBox() {
  const pink_check_box = document.getElementById("pink-check-box");
  const pink_input = document.getElementById("pink-input");
  const pink_p = document.getElementById("pink-p");

  if (pink_check_box.checked) {
    pink_input.disabled = false;
  } else {
    pink_input.disabled = true;
    pink_input.value = "0";
    pink_p.innerText = "0 Won";
  }
}

let golden_total_payment = 0;
let silver_total_payment = 0;
let pink_total_payment = 0;

// 골든 티켓 수량 변경에 따른 가격 업데이트
function updateGoldenP() {
  const golden_p = document.getElementById("golden-p");
  const golden_input = document.getElementById("golden-input");
  golden_total_payment = golden_input.value * 500;
  golden_p.innerText = golden_total_payment + " Won";
  updateTotalPayment();
}

// 실버 티켓 체크박스 상태 변경에 따른 처리
function updateSilverP() {
  const silver_p = document.getElementById("silver-p");
  const silver_input = document.getElementById("silver-input");
  silver_total_payment = silver_input.value * 300;
  silver_p.innerText = silver_total_payment + " Won";
  updateTotalPayment();
}

// 핑크 티켓 체크박스 상태 변경에 따른 처리
function updatePinkP() {
  const pink_p = document.getElementById("pink-p");
  const pink_input = document.getElementById("pink-input");
  pink_total_payment = pink_input.value * 200;
  pink_p.innerText = pink_total_payment + " Won";
  updateTotalPayment();
}

// 총 결제 예정 금액
function updateTotalPayment() {
  const total_payment = document.getElementById("total-payment");
  const ticker_total_payment = golden_total_payment + silver_total_payment + pink_total_payment + " Won";
  console.log(golden_total_payment);
  total_payment.innerText = ticker_total_payment;
}

// 결제 페이지에서 뒤로 가기 버튼
function backButton() {
  document.getElementById("payment-page").style.display = "none";
  document.getElementById("ticket-page").style.display = "";
}

//티켓 수량을 불러오는 함수
const payload = localStorage.getItem("payload");
if (payload) {
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

      document.getElementById("golden-count").innerText = goldenTicketCount;
      document.getElementById("silver-count").innerText = silverTicketCount;
      document.getElementById("pink-count").innerText = pinkTicketCount;
    })
    .catch((error) => console.error("Error:", error));
}
