const TARGETS = { chrome: 155, firefox: 158 };
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
    const dateLabel = targetDate.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
    element.innerHTML = `<strong>${days}d ${hours}h ${minutes}m</strong> until ${dateLabel} stable`; 
  }

  update();
  setInterval(update, 60 * 1000);
}

async function loadChromeStatus() {
  const fallback = { version: 154, targetDate: new Date("2026-10-06T00:00:00Z") };
  let release = fallback;

  try {
    const [releaseResponse, scheduleResponse] = await Promise.all([
      fetch("https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Windows&num=1"),
      fetch(`https://chromiumdash.appspot.com/fetch_milestone_schedule?mstone=${TARGETS.chrome}`),
    ]);
    if (!releaseResponse.ok || !scheduleResponse.ok) throw new Error("Chrome status request failed");
    const [releaseData] = await releaseResponse.json();
    const scheduleData = await scheduleResponse.json();
    release = {
      version: Number(releaseData.milestone),
      targetDate: new Date(`${scheduleData.mstones[0].stable_date}Z`),
    };
  } catch (error) {
    console.info("Using bundled Chrome release data.", error);
  }

  document.querySelector("#chrome-stable").textContent = `Stable ${release.version}`;
  showCountdown("chrome", release.targetDate, release.version, TARGETS.chrome);
}

async function loadFirefoxStatus() {
  const targetDate = new Date("2026-10-13T00:00:00Z");
  let version = 155;

  try {
    const response = await fetch("https://product-details.mozilla.org/1.0/firefox_versions.json");
    if (!response.ok) throw new Error("Firefox status request failed");
    const data = await response.json();
    version = Number.parseInt(data.LATEST_FIREFOX_VERSION, 10);
  } catch (error) {
    console.info("Using bundled Firefox release data.", error);
  }

  document.querySelector("#firefox-stable").textContent = `Stable ${version}`;
  showCountdown("firefox", targetDate, version, TARGETS.firefox);
}

function detectBrowser() {
  const ua = navigator.userAgent;
  let browser = null;
  let label = "";

  if (/Ladybird\//.test(ua)) {
    browser = "ladybird";
    label = "You are viewing in Ladybird";
  } else if (/Servo\//.test(ua)) {
    browser = "servo";
    label = "You are viewing in Servo";
  } else if (/Firefox\//.test(ua)) {
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
