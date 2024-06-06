browser.runtime.onMessage.addListener(async (message) => {
  // download follow list
  if (message.type === "bg-dl-follow-list") {
    const newTab = await browser.tabs.create({
      url: "https://www.twitch.tv/directory/following/channels",
    });

    await browser.tabs.executeScript(newTab.id, {
      file: "content/content.js",
    });

    const response = await browser.tabs.sendMessage(newTab.id, {
      type: "content-parse-follow-list",
    });

    const follows = response.message;

    if (follows.length > 0) {
      const blob = new Blob([follows.join("\n")], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const date = new Date().toISOString().slice(0, 10);
      await browser.downloads.download({
        url: url,
        filename: `twitch-follow-list-${date}.txt`,
      });
    }

    await browser.tabs.remove(newTab.id);

    return { message: response.message };
  }
  // follow from list
  else if (message.type === "bg-follow-from-list") {
    const follows = message.message;

    // io-bound task, {poolLimit} number of tasks at a time
    // promise pool for followChannel tasks
    const poolLimit = 6;
    await promisePool(followChannel, follows, poolLimit);

    return { message: "Follow done" };
  }
});

const promisePool = async (fn, args, poolLimit) => {
  const pool = [];
  for (const arg of args) {
    const p = Promise.resolve().then(() => fn(arg));
    pool.push(p);

    if (pool.length >= poolLimit) {
      await Promise.race(pool).then(() => {
        pool.splice(pool.indexOf(p), 1);
      });
    }
  }
  await Promise.all(pool);
};

const followChannel = async (channel) => {
  const newTab = await browser.tabs.create({
    url: `https://www.twitch.tv/${channel}`,
  });

  await browser.tabs.executeScript(newTab.id, {
    file: "content/content.js",
  });

  try {
    const response = await browser.tabs.sendMessage(newTab.id, {
      type: "content-follow-channel",
    });
    console.log(`${channel}: ${response.message}`);
  } catch (e) {
    console.error(`${channel}: ${e.message}`);
  }

  await browser.tabs.remove(newTab.id);
};
