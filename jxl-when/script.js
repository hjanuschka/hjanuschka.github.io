const TARGETS = { chrome: 155, firefox: 157 };
const DAY = 24 * 60 * 60 * 1000;

function showCountdown(id, targetDate, currentVersion, targetVersion) {
  const element = document.querySelector(`#${id}-countdown`);

  function update() {
    if (currentVersion >= targetVersion || targetDate <= new Date()) {
      element.innerHTML = "<strong>Available now</strong> in stable";
      return;
    }

    const remaining = targetDate - new Date();
    const days = Math.floor(remaining / DAY);
    const hours = Math.floor((remaining % DAY) / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    element.innerHTML = `<strong>${days}d ${hours}h ${minutes}m</strong> until estimated stable`;
  }

  update();
  setInterval(update, 60 * 1000);
}

async function loadChromeStatus() {
  const fallback = { version: 154, date: new Date("2026-09-09T12:00:00Z") };
  let release = fallback;

  try {
    const response = await fetch("https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Windows&num=1");
    if (!response.ok) throw new Error("Chrome status request failed");
    const [data] = await response.json();
    release = { version: Number(data.milestone), date: new Date(data.time) };
  } catch (error) {
    console.info("Using bundled Chrome release data.", error);
  }

  document.querySelector("#chrome-stable").textContent = `Stable ${release.version}`;
  const targetDate = new Date(release.date.getTime() + Math.max(0, TARGETS.chrome - release.version) * 28 * DAY);
  showCountdown("chrome", targetDate, release.version, TARGETS.chrome);
}

async function loadFirefoxStatus() {
  const fallback = { version: 155, nextDate: new Date("2026-09-25T12:00:00Z") };
  let release = fallback;

  try {
    const response = await fetch("https://product-details.mozilla.org/1.0/firefox_versions.json");
    if (!response.ok) throw new Error("Firefox status request failed");
    const data = await response.json();
    release = {
      version: Number.parseInt(data.LATEST_FIREFOX_VERSION, 10),
      nextDate: new Date(`${data.NEXT_RELEASE_DATE}T12:00:00Z`),
    };
  } catch (error) {
    console.info("Using bundled Firefox release data.", error);
  }

  document.querySelector("#firefox-stable").textContent = `Stable ${release.version}`;
  const releasesAfterNext = Math.max(0, TARGETS.firefox - release.version - 1);
  const targetDate = new Date(release.nextDate.getTime() + releasesAfterNext * 28 * DAY);
  showCountdown("firefox", targetDate, release.version, TARGETS.firefox);
}

function detectBrowser() {
  const ua = navigator.userAgent;
  let browser = null;
  let label = "";

  if (/Firefox\//.test(ua)) {
    browser = "firefox";
    label = "You are viewing in Firefox";
  } else if (/Edg\//.test(ua) || /Chrome\//.test(ua)) {
    browser = "chrome";
    label = /Edg\//.test(ua) ? "You are viewing in a Chromium browser" : "You are viewing in Chrome";
  } else if (/Safari\//.test(ua)) {
    browser = "safari";
    label = "You are viewing in Safari";
    const safariVersion = ua.match(/Version\/(\d+)/)?.[1];
    if (safariVersion) document.querySelector("#safari-stable").textContent = `This browser ${safariVersion}`;
  }

  if (browser) {
    document.querySelector(`[data-browser="${browser}"]`)?.classList.add("is-current");
    document.querySelector("#detected-browser").textContent = label;
  }
}

function testAnimatedJxl() {
  const image = document.querySelector("#animated-image");
  const label = document.querySelector("#animation-format");

  const loaded = () => {
    label.textContent = "Pure animated JPEG XL - 333 KB";
  };
  const failed = () => {
    label.textContent = "Animated JPEG XL failed to decode";
  };

  image.addEventListener("load", loaded);
  image.addEventListener("error", failed);
  if (image.complete) image.naturalWidth ? loaded() : failed();
}

function testJxlDecoding() {
  const testImage = new Image();
  const status = document.querySelector("#decode-status");
  const servedFormat = document.querySelector("#served-format");

  testImage.onload = () => {
    status.className = "decode-status supported";
    status.innerHTML = "<span></span> Your browser decodes JXL";
    servedFormat.textContent = "JPEG XL - 46 KB";
  };
  testImage.onerror = () => {
    status.className = "decode-status unsupported";
    status.innerHTML = "<span></span> Your browser cannot decode JXL";
    servedFormat.textContent = "JPEG XL failed to decode";
  };
  testImage.src = "assets/dice.jxl";
}

detectBrowser();
testJxlDecoding();
testAnimatedJxl();
loadChromeStatus();
loadFirefoxStatus();
