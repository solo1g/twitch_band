const addButtonListeners = () => {
  // backup button
  document
    .getElementById("download-follow-list")
    .addEventListener("click", async () => {
      const response = await browser.runtime.sendMessage({
        type: "bg-dl-follow-list",
      });

      const follows = response.message;

      document.getElementById("response").innerText = `Got ${
        follows.length
      } follows\n${follows.join(", ")}`;
    });

  // follow from list
  document
    .getElementById("follow-from-list")
    .addEventListener("click", async () => {
      follows = document
        .getElementById("follow-list-input")
        .value.split("\n")
        .filter((f) => f.trim() !== "");

      const response = await browser.runtime.sendMessage({
        type: "bg-follow-from-list",
        message: follows,
      });

      document.getElementById("response").innerText = response.message;
    });
};

addButtonListeners();
