async function createQnA() {
  const content = document.getElementById("content").value;

  try {
    const response = await fetch(`${backend_base_url}/user/qna/`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("access"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: content }),
    });

    const response_json = await response.json();
    const status = response_json["status"];

    if (status == "201" && response.status == 201) {
      alert(`${response_json["success"]}`);
      window.location.replace(`${frontend_base_url}/`);
      return;
    } else if (status == "400" && response.status == 400) {
      alert(`${response_json["error"]}`);
      return;
    }
  } catch (error) {
    console.error("error", error);
  }
}
