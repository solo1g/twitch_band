// content script, but the injection is handled by background script
browser.runtime.onMessage.addListener(async (request) => {
  // parse follow list
  if (request.type === "content-parse-follow-list") {
    await followingPageLoaded();

    const cards = document.getElementsByClassName(
      "channel-follow-listing--card"
    );
    let follows = [];
    for (const c of cards) {
      follows.push(c.querySelector("p").textContent);
    }

    return { message: follows };
  }
  // click the follow button
  else if (request.type === "content-follow-channel") {
    // wait till button is loaded and ensure channel exists
    while (
      !["Follow", "Unfollow"].includes((follow = followButton())?.ariaLabel)
    ) {
      if (isInvalidChannel()) {
        return { message: "invalid channel" };
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // there's something seriously retarded with the twitch site
    // even though the button is available and has an onclick
    // you NEED to wait for some time to click it, perhaps
    // its loading some other stuff
    // the page IS loaded, its propably client side async stuff

    if (followButton().ariaLabel === "Follow") {
      await clickFollowButtonTillUnfollow();
      return { message: "followed" };
    } else {
      return { message: "already followed" };
    }
  }
});

const followingPageLoaded = async () => {
  while (
    document.getElementsByClassName("channel-follow-listing--card").length ===
      0 && // wait if, follow list = 0
    document
      .getElementById("following-page-main-content")
      ?.innerText.indexOf("No Users Found") === -1 // wait if, no channels found
  ) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
};

const followButton = () => {
  const onlineButton = document
    .getElementById("live-channel-stream-information")
    ?.getElementsByTagName("button")?.[0];
  const offlineButton = document
    .getElementById("offline-channel-main-content")
    ?.getElementsByTagName("button")?.[0];
  return onlineButton ?? offlineButton;
};

const isInvalidChannel = () => {
  const sorryRef = document.getElementsByClassName(
    "CoreText-sc-1txzju1-0 ErZg"
  );
  return sorryRef?.[0]?.innerText?.startsWith("Sorry");
};

const clickFollowButtonTillUnfollow = async () => {
  while (followButton().ariaLabel === "Follow") {
    followButton().click();
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
};
