async function injectFooter() {
  fetch("./footer.html")
    .then((response) => {
      return response.text();
    })
    .then((data) => {
      document.querySelector("footer").innerHTML = data;
    });

  let footerHtml = await fetch("/footer.html");
  let data = await footerHtml.text();
  document.querySelector("footer").innerHTML = data;
}

injectFooter();
