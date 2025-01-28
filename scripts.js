// تابع تبدیل تاریخ میلادی به تاریخ شمسی
function convertToJalaliDate(gregorianDate) {
  gregorianDate = String(gregorianDate);
  const gYear = parseInt(gregorianDate.slice(0, 4), 10);
  const gMonth = parseInt(gregorianDate.slice(4, 6), 10);
  const gDay = parseInt(gregorianDate.slice(6, 8), 10);

  // فرمول تبدیل تاریخ میلادی به شمسی
  const gDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const jDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

  let gy = gYear - 1600;
  let gm = gMonth - 1;
  let gd = gDay - 1;

  let gDayNo =
    365 * gy +
    Math.floor((gy + 3) / 4) -
    Math.floor((gy + 99) / 100) +
    Math.floor((gy + 399) / 400);

  for (let i = 0; i < gm; ++i) gDayNo += gDaysInMonth[i];
  if (gm > 1 && ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0)) gDayNo++; // Leap year

  gDayNo += gd;

  let jDayNo = gDayNo - 79;

  let jNp = Math.floor(jDayNo / 12053);
  jDayNo %= 12053;

  let jy = 979 + 33 * jNp + 4 * Math.floor(jDayNo / 1461);
  jDayNo %= 1461;

  if (jDayNo >= 366) {
    jy += Math.floor((jDayNo - 1) / 365);
    jDayNo = (jDayNo - 1) % 365;
  }

  let jm = 0;
  for (let i = 0; i < 11 && jDayNo >= jDaysInMonth[i]; ++i) {
    jDayNo -= jDaysInMonth[i];
    jm++;
  }
  let jd = jDayNo + 1;

  return `${jy}/${String(jm + 1).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
}

// تابع تبدیل زمان به قالب ساعت خوانا
function convertToReadableTime(marketActivityHEven) {
  const hours = Math.floor(parseInt(marketActivityHEven, 10) / 10000);
  const minutes = Math.floor((parseInt(marketActivityHEven, 10) % 10000) / 100);
  const seconds = parseInt(marketActivityHEven, 10) % 100;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getTop10LvaGain(data) {
  const filteredItems = data.marketwatch.filter(
    (item) => item.pmx === item.pdv && !/\d/.test(item.lva)
  );
  const sortedByQtc = filteredItems.sort((a, b) => b.qtc - a.qtc);
  const top10Lva = sortedByQtc.slice(0, 10).map((item) => item.lva);
  const resultString = top10Lva.join(" - ");

  return resultString;
}

function getTop10LvaLoss(data) {
  const filteredItems = data.marketwatch.filter(
    (item) => item.pmn === item.pdv && !/\d/.test(item.lva)
  );
  const sortedByQtc = filteredItems.sort((a, b) => b.qtc - a.qtc);
  const top10Lva = sortedByQtc.slice(0, 10).map((item) => item.lva);
  const resultString = top10Lva.join(" - ");

  return resultString;
}

function getMarketTopValue(data) {
  const filteredItems = data.marketwatch.filter((item) => !/\d/.test(item.lva));
  const sortedByQtc = filteredItems.sort((a, b) => b.qtc - a.qtc);
  const top10Lva = sortedByQtc.slice(0, 10).map((item) => item.lva);
  const resultString = top10Lva.join(" - ");

  return resultString;
}

function extractSelectedIndexes(data) {
  const targetIndexes = [
    "شاخص 30 شركت بزرگ",
    "شاخص50شركت فعالتر",
    "شاخص قيمت (هم وزن)",
    "شاخص صنعت",
  ];

  const result = targetIndexes.reduce((acc, name, idx) => {
    const item = data.indexB1.find((entry) => entry.lVal30 === name);
    if (item) {
      acc[idx] = {
        name: name,
        index: item.xDrNivJIdx004,
        indexChange: item.indexChange,
      };
    }
    return acc;
  }, {});

  return result;
}

function getMarketCount(data) {
  // متغیرهای مورد نیاز
  let mosbat = 0;
  let manfi = 0;
  let safmosbat = 0;
  let safmanfi = 0;
  let arzeshsafmosbat = 0;
  let arzeshsafmanfi = 0;

  // پیمایش داده‌ها
  data.marketwatch.forEach((i) => {
    if (i.pc > 0) {
      mosbat++;
      // شرط برای صف مثبت
      if (i.pdv == i.pmx) {
        safmosbat++;
        arzeshsafmosbat += i.blDs[0].qmd * i.blDs[0].pmd; // فرض بر این که مقدار قیمت در i.value است
      }
    }
    if (i.pc < 0) {
      manfi++;
      // شرط برای صف منفی
      if (i.pdv == i.pmn) {
        safmanfi++;
        arzeshsafmanfi += i.blDs[0].qmo * i.blDs[0].pmo; // فرض بر این که مقدار قیمت در i.value است
      }
    }
  });

  // خروجی نهایی
  return {
    mosbat,
    manfi,
    safmosbat,
    safmanfi,
    arzeshsafmosbat,
    arzeshsafmanfi,
  };
}

const config = {
  currencyFormatter: new Intl.NumberFormat("fa-IR"),
  timeFormatter: new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }),
  BILLION: 1e9,
  BILLIONTOMAN: 1e10,
};

const apiUrls = {
  bourse: "https://cdn.tsetmc.com/api/MarketData/GetMarketOverview/1",
  farabourse: "https://cdn.tsetmc.com/api/MarketData/GetMarketOverview/2",
  bourseEffect: "https://cdn.tsetmc.com/api/Index/GetInstEffect/0/1/10",
  farabourseEffect: "https://cdn.tsetmc.com/api/Index/GetInstEffect/0/2/10",
  borsevafaraborsevasandogh:
    "https://cdn.tsetmc.com/api/ClosingPrice/GetMarketWatch?market=0&industrialGroup=&showTraded=true&withBestLimits=true&hEven=0&RefID=0&paperTypes[0]=1&paperTypes[1]=2&paperTypes[7]=8",
  borsevafarabors:
    "https://cdn.tsetmc.com/api/ClosingPrice/GetMarketWatch?market=0&industrialGroup=&showTraded=true&withBestLimits=true&hEven=0&RefID=0&paperTypes[0]=1&paperTypes[1]=2",
  borselist:
    "https://cdn.tsetmc.com/api/ClosingPrice/GetMarketWatch?market=1&industrialGroup=&paperTypes%5B0%5D=1&showTraded=true&withBestLimits=true&hEven=0&RefID=0",
  faraborselist:
    "https://cdn.tsetmc.com/api/ClosingPrice/GetMarketWatch?market=2&industrialGroup=&paperTypes%5B0%5D=1&paperTypes%5B1%5D=2&showTraded=true&withBestLimits=true&hEven=0&RefID=0",
  ekhtiarlist:
    "https://cdn.tsetmc.com/api/ClosingPrice/GetMarketWatch?market=0&industrialGroup=&paperTypes%5B0%5D=6&showTraded=true&withBestLimits=true&hEven=0&RefID=0",
  sanat: "https://cdn.tsetmc.com/api/MarketData/GetSectorTop/5",
  indexes: "https://cdn.tsetmc.com/api/Index/GetIndexB1LastAll/All/1",
};

const requestHeaders = {
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Connection: "keep-alive",
  Host: "cdn.tsetmc.com",
  Origin: window.location.origin, // Replace with your app's actual origin
  "Sec-CH-UA":
    '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  "Sec-CH-UA-Mobile": "?0",
  "Sec-CH-UA-Platform": '"Linux"',
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "cross-site",
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
};

async function fetchApi(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: requestHeaders,
    });
    if (!response.ok) {
      throw new Error(`خطا در فراخوانی API: ${url}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    alert("مشکل در دریافت داده‌های بازار");
    return null;
  }
}

async function fetchDataSequentially() {
  try {
    // ارسال درخواست‌ها به ترتیب و دریافت داده‌ها
    const bourseData = await fetchApi(apiUrls.bourse);
    // console.log(bourseData);
    if (!bourseData) throw new Error("دریافت داده‌های بورس شکست خورد");

    const farabourseData = await fetchApi(apiUrls.farabourse);
    // console.log(farabourseData);
    if (!farabourseData) throw new Error("دریافت داده‌های فرابورس شکست خورد");

    const bourseEffect = await fetchApi(apiUrls.bourseEffect);
    const bourseEffectSTR = bourseEffect.instEffect
      .map((item) => item.instrument.lVal18AFC)
      .join(" - ");

    // console.log(bourseEffectSTR);
    if (!bourseEffect) throw new Error("دریافت اثرات نماد بورس شکست خورد");

    const farabourseEffect = await fetchApi(apiUrls.farabourseEffect);
    const farabourseEffectSTR = farabourseEffect.instEffect
      .map((item) => item.instrument.lVal18AFC)
      .join(" - ");

    // console.log(farabourseEffectSTR);
    if (!farabourseEffect)
      throw new Error("دریافت اثرات نماد فرابورس شکست خورد");

    const borselist = await fetchApi(apiUrls.borselist);
    // console.log(borselist);
    if (!borselist) throw new Error("دریافت داده‌های بورس شکست خورد");

    const faraborselist = await fetchApi(apiUrls.faraborselist);
    // console.log(faraborselist);
    if (!borselist) throw new Error("دریافت داده‌های بورس شکست خورد");

    const sanat = await fetchApi(apiUrls.sanat);
    const sanatSTR = sanat.sectorTop
      .map((item) => item.lVal30.split("-")[1])
      .join(" - ");

    const borsevafaraborsevasandogh = await fetchApi(
      apiUrls.borsevafaraborsevasandogh
    );
    const mostvalue = getMarketTopValue(borsevafaraborsevasandogh);
    // console.log(mostvalue);

    const indexes = await fetchApi(apiUrls.indexes);
    const amarIndexes = extractSelectedIndexes(indexes);
    // console.log(amarIndexes);

    const borsevafarabors = await fetchApi(apiUrls.borsevafarabors);
    const marketCount = getMarketCount(borsevafarabors);
    // console.log(marketCount);

    // بازگشت داده‌ها در قالب یک ساختار یکپارچه
    return {
      bourse: {
        index: bourseData.marketOverview.indexLastValue,
        change: bourseData.marketOverview.indexChange,
        marketValue: Math.round(
          bourseData.marketOverview.marketValue / config.BILLION
        ),
        tradeValue: Math.round(
          bourseData.marketOverview.marketActivityQTotCap / config.BILLION
        ),
        topInfluence: bourseEffectSTR || "ناموجود",
        topGain: getTop10LvaGain(borselist) || "ناموجود",
        topLoss: getTop10LvaLoss(borselist) || "ناموجود",
      },
      farabourse: {
        index: farabourseData.marketOverview.indexLastValue,
        change: farabourseData.marketOverview.indexChange,
        marketValue: {
          firstSecondMarket: Math.round(
            farabourseData.marketOverview.marketValue / config.BILLION
          ),
          baseMarket: Math.round(
            farabourseData.marketOverview.marketValueBase / config.BILLION
          ),
        },
        tradeValue: Math.round(
          farabourseData.marketOverview.marketActivityQTotCap / config.BILLION
        ),
        topInfluence: farabourseEffectSTR || "ناموجود",
        topGain: getTop10LvaGain(faraborselist) || "ناموجود",
        topLoss: getTop10LvaLoss(faraborselist) || "ناموجود",
      },
      date: convertToJalaliDate(bourseData.marketOverview.marketActivityDEven),
      time: convertToReadableTime(
        bourseData.marketOverview.marketActivityHEven
      ),
      marketStatus: bourseData.marketOverview.marketStateTitle,
      sanat: sanatSTR,
      indexes: amarIndexes,
      marketCount: marketCount,
      mostValue: mostvalue,
    };
  } catch (error) {
    console.error("خطا در دریافت داده:", error);
    alert("مشکل در تجمیع داده‌های بازار");
    return null;
  }
}

function updateMarketStatus(status) {
  const statusEl = document.getElementById("market-status");
  statusEl.textContent = status;
  statusEl.className = `font-medium ${status === "باز" ? "positive" : "negative"}`;
}

function formatNumber(number) {
  return config.currencyFormatter.format(number || 0);
}

function updateUI(data) {
  if (!data) return;

  // بخش هدر
  document.getElementById("current-date").textContent = data.date;
  document.getElementById("current-time").textContent = data.time;
  updateMarketStatus(data.marketStatus);

  // بخش بورس
  document.getElementById("bourse-index").textContent = formatNumber(
    data.bourse.index
  );
  document.getElementById("bourse-change").textContent = formatNumber(
    data.bourse.change
  );
  document
    .getElementById("bourse-change")
    .classList.add(data.bourse.change < 0 ? "negative" : "positive");
  document.getElementById("bourse-market-value").textContent = formatNumber(
    data.bourse.marketValue
  );
  document.getElementById("bourse-trade-value").textContent = formatNumber(
    data.bourse.tradeValue
  );
  document.getElementById("bourse-top-influence").textContent =
    data.bourse.topInfluence;
  document.getElementById("bourse-top-gain").textContent = data.bourse.topGain;
  document.getElementById("bourse-top-loss").textContent = data.bourse.topLoss;

  // بخش فرابورس
  document.getElementById("farabourse-index").textContent = formatNumber(
    data.farabourse.index
  );
  document.getElementById("farabourse-change").textContent = formatNumber(
    data.farabourse.change
  );
  document
    .getElementById("farabourse-change")
    .classList.add(data.farabourse.change < 0 ? "negative" : "positive");
  document.getElementById("farabourse-market-first").textContent = formatNumber(
    data.farabourse.marketValue.firstSecondMarket
  );
  document.getElementById("farabourse-market-base").textContent = formatNumber(
    data.farabourse.marketValue.baseMarket
  );
  document.getElementById("farabourse-trade-value").textContent = formatNumber(
    data.farabourse.tradeValue
  );
  document.getElementById("farabourse-top-influence").textContent =
    data.farabourse.topInfluence;
  document.getElementById("farabourse-top-gain").textContent =
    data.farabourse.topGain;
  document.getElementById("farabourse-top-loss").textContent =
    data.farabourse.topLoss;

  document.getElementById("top-sanat").textContent = data.sanat;
  document.getElementById("most-value").textContent = data.mostValue;

  document.getElementById("0-indexes-value").textContent =
    data.indexes[0].index;
  document.getElementById("0-indexes-change").textContent = formatNumber(
    data.indexes[0].indexChange
  );
  document
    .getElementById("0-indexes-change")
    .classList.add(data.indexes[0].indexChange < 0 ? "negative" : "positive");
  document.getElementById("1-indexes-value").textContent =
    data.indexes[1].index;
  document.getElementById("1-indexes-change").textContent = formatNumber(
    data.indexes[1].indexChange
  );
  document
    .getElementById("1-indexes-change")
    .classList.add(data.indexes[1].indexChange < 0 ? "negative" : "positive");
  document.getElementById("2-indexes-value").textContent =
    data.indexes[2].index;
  document.getElementById("2-indexes-change").textContent = formatNumber(
    data.indexes[2].indexChange
  );
  document
    .getElementById("2-indexes-change")
    .classList.add(data.indexes[2].indexChange < 0 ? "negative" : "positive");
  document.getElementById("3-indexes-value").textContent =
    data.indexes[3].index;
  document.getElementById("3-indexes-change").textContent = formatNumber(
    data.indexes[3].indexChange
  );
  document
    .getElementById("3-indexes-change")
    .classList.add(data.indexes[3].indexChange < 0 ? "negative" : "positive");

  document.getElementById("mosbat").textContent = data.marketCount.mosbat;
  document.getElementById("manfi").textContent = data.marketCount.manfi;
  document.getElementById("saf-kharid").textContent =
    data.marketCount.safmosbat;
  document.getElementById("saf-forosh").textContent = data.marketCount.safmanfi;
  document.getElementById("arzesh-saf-kharid").textContent = Math.round(
    data.marketCount.arzeshsafmosbat / config.BILLIONTOMAN
  );
  document.getElementById("arzesh-saf-forosh").textContent = Math.round(
    data.marketCount.arzeshsafmanfi / config.BILLIONTOMAN
  );
}

async function init() {
  try {
    const data = await fetchDataSequentially();
    if (!data) throw new Error("داده‌ای دریافت نشد");
    updateUI(data);
  } catch (error) {
    console.error("خطا در دریافت داده:", error);
    alert("خطا در دریافت اطلاعات بازار");
  }
}

document.addEventListener("DOMContentLoaded", init);
