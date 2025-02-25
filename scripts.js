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

function getAkhtiyarValue(data) {
  const sortedByQtc = data
    .sort((a, b) => b.qTotCap_C - a.qTotCap_C)
    .sort((a, b) => b.qTotCap_P - a.qTotCap_P);
  const top5UniqueLva = Array.from(
    new Set(sortedByQtc.map((item) => item.lval30_UA))
  ).slice(0, 5);
  const resultString = top5UniqueLva.join(" - ");
  return resultString;
}

function getAkhtiyarNameKharid(data) {
  const sortedByQtc = data.sort((a, b) => b.qTotCap_C - a.qTotCap_C);
  const top5UniqueLva = Array.from(
    new Set(
      sortedByQtc.map(
        (item) => `${item.lVal18AFC_C}&${item.lVal30_C}&${item.qTotCap_C}`
      )
    )
  ).slice(0, 5);
  const resultString = top5UniqueLva.map((item) => item.split("&"));
  return resultString;
}

function getAkhtiyarNameForosh(data) {
  const sortedByQtc = data.sort((a, b) => b.qTotCap_P - a.qTotCap_P);
  const top5UniqueLva = Array.from(
    new Set(
      sortedByQtc.map(
        (item) => `${item.lVal18AFC_P}&${item.lVal30_P}&${item.qTotCap_P}`
      )
    )
  ).slice(0, 5);
  const resultString = top5UniqueLva.map((item) => item.split("&"));
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

function getMarketMostSaf(data) {
  // فیلتر کردن آیتم‌هایی که lva آن‌ها شامل عدد نباشد
  const filteredItems = data.marketwatch.filter((item) => !/\d/.test(item.lva));

  // محاسبه مقادیر و ذخیره آن‌ها در آرایه
  const itemsWithValues = filteredItems.map((i) => {
    const qmdPmd = i.pdv == i.pmx ? i.blDs[0].qmd * i.blDs[0].pmd : 0; // مقدار qmd * pmd (صف خرید)
    const qmoPmo = i.pdv == i.pmn ? i.blDs[0].qmo * i.blDs[0].pmo : 0; // مقدار qmo * pmo (صف فروش)

    return {
      lva: i.lva, // شناسه lva
      qmdPmd, // مقدار qmd * pmd
      qmoPmo, // مقدار qmo * pmo
    };
  });

  // پیدا کردن ۵ مورد با بیشترین صف خرید (qmd * pmd)
  const top5Kharid = itemsWithValues
    .sort((a, b) => b.qmdPmd - a.qmdPmd) // مرتب‌سازی نزولی
    .slice(0, 5) // گرفتن ۵ مورد اول
    .map((item) => item.lva) // استخراج lva
    .join(" - "); // تبدیل به رشته با جداکننده‌ی " - "

  // پیدا کردن ۵ مورد با بیشترین صف فروش (qmo * pmo)
  const top5Forosh = itemsWithValues
    .sort((a, b) => b.qmoPmo - a.qmoPmo) // مرتب‌سازی نزولی
    .slice(0, 5) // گرفتن ۵ مورد اول
    .map((item) => item.lva) // استخراج lva
    .join(" - "); // تبدیل به رشته با جداکننده‌ی " - "

  // خروجی نهایی
  return {
    top5Kharid, // ۵ مورد با بیشترین صف خرید
    top5Forosh, // ۵ مورد با بیشترین صف فروش
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
  allbejozsandogh:
    "https://cdn.tsetmc.com/api/ClosingPrice/GetMarketWatch?market=0&industrialGroup=&showTraded=true&withBestLimits=true&hEven=0&RefID=0&paperTypes[0]=1&paperTypes[1]=2&paperTypes[2]=3&paperTypes[3]=4&paperTypes[4]=5&paperTypes[5]=6&paperTypes[6]=7&paperTypes[8]=9",
  all: "https://cdn.tsetmc.com/api/ClosingPrice/GetMarketWatch?market=0&industrialGroup=&showTraded=true&withBestLimits=true&hEven=0&RefID=0&paperTypes[0]=1&paperTypes[1]=2&paperTypes[2]=3&paperTypes[3]=4&paperTypes[4]=5&paperTypes[5]=6&paperTypes[6]=7&paperTypes[7]=8&paperTypes[8]=9",
  akhtiyarBorse:
    "https://cdn.tsetmc.com/api/Instrument/GetInstrumentOptionMarketWatch/1",
  akhtiyarFaraBorse:
    "https://cdn.tsetmc.com/api/Instrument/GetInstrumentOptionMarketWatch/2",

  camodity:
    "https://api.tgju.org/v1/widget/tmp?keys=137187,137186,137183,137119,137206,137121,137203,137119,137134,137135,137136,137138,137137,137179,137181,137182,137183,131439",
  currency:
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple&vs_currencies=usd&include_24hr_change=true",
  tether: "https://api.tetherland.com/currencies",
};

const requestHeaders = {
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Connection: "keep-alive",
  Host: "cdn.tsetmc.com",
  Origin: window.location.origin, // Replace with your app's actual origin
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

async function fetchDataParallel() {
  try {
    // گروه اول: داده‌های اصلی بازار
    const mainMarketData = await Promise.all([
      fetchApi(apiUrls.bourse),
      fetchApi(apiUrls.farabourse),
      fetchApi(apiUrls.bourseEffect),
      fetchApi(apiUrls.farabourseEffect),
      fetchApi(apiUrls.indexes),
    ]);

    const [
      bourseData,
      farabourseData,
      bourseEffect,
      farabourseEffect,
      indexes,
    ] = mainMarketData;

    if (!bourseData || !farabourseData) {
      throw new Error("دریافت داده‌های اصلی بازار با شکست مواجه شد");
    }

    // گروه دوم: داده‌های لیست‌ها
    const listData = await Promise.all([
      fetchApi(apiUrls.borselist),
      fetchApi(apiUrls.faraborselist),
      fetchApi(apiUrls.borsevafaraborsevasandogh),
      fetchApi(apiUrls.borsevafarabors),
      fetchApi(apiUrls.allbejozsandogh),
      fetchApi(apiUrls.sanat),
    ]);

    const [
      borselist,
      faraborselist,
      borsevafaraborsevasandogh,
      borsevafarabors,
      allDara,
      sanat,
    ] = listData;

    // گروه سوم: داده‌های اختیار معامله
    const optionsData = await Promise.all([
      fetchApi(apiUrls.akhtiyarBorse),
      fetchApi(apiUrls.akhtiyarFaraBorse),
    ]);

    const [akhborse, akhfaraborse] = optionsData;
    const akhtiyar = akhborse.instrumentOptMarketWatch.concat(
      akhfaraborse.instrumentOptMarketWatch
    );

    // گروه چهارم: داده‌های بازارهای جهانی
    const globalMarketsData = await Promise.all([
      fetchApi(apiUrls.camodity),
      fetchApi(apiUrls.currency),
      fetchApi(apiUrls.tether),
    ]);

    const [camodity, currency, tether] = globalMarketsData;

    // پردازش داده‌های دریافتی
    const bourseEffectSTR = bourseEffect.instEffect
      .map((item) => item.instrument.lVal18AFC)
      .join(" - ");

    const farabourseEffectSTR = farabourseEffect.instEffect
      .map((item) => item.instrument.lVal18AFC)
      .join(" - ");

    const sanatSTR = sanat.sectorTop
      .map((item) => item.lVal30.split("-")[1])
      .join(" - ");

    const mostvalue = getMarketTopValue(borsevafaraborsevasandogh);
    const amarIndexes = extractSelectedIndexes(indexes);
    const marketCount = getMarketCount(borsevafarabors);
    const safha = getMarketMostSaf(allDara);

    const akhtiyarTotalValues = akhtiyar.reduce(
      (totals, item) => {
        totals.qTotTran5J += item.qTotTran5J_P + item.qTotTran5J_C;
        totals.qTotCap += item.qTotCap_P + item.qTotCap_C;
        return totals;
      },
      { qTotTran5J: 0, qTotCap: 0 }
    );

    const top5FAkhtiyarValue = getAkhtiyarValue(akhtiyar);
    const Top5NameKhari = getAkhtiyarNameKharid(akhtiyar);
    const Top5NameForosh = getAkhtiyarNameForosh(akhtiyar);

    // بازگشت داده‌های پردازش شده
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
      safha: safha,
      camodities: camodity.response.indicators,
      currency: currency,
      tether: tether.data.currencies.USDT,
      top5FAkhtiyarValue: top5FAkhtiyarValue,
      akhtiyarTotalValues: akhtiyarTotalValues,
      Top5NameKhari: Top5NameKhari,
      Top5NameForosh: Top5NameForosh,
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

const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
};

const formatNumberMemoized = memoize(formatNumber);

function formatNumber(number) {
  return config.currencyFormatter.format(number || 0);
}

function formatChange(value) {
  if (!isFinite(value)) return "—";
  return (value > 0 ? "+" : "") + value.toFixed(2) + "%";
}

// تابع به‌روزرسانی یک کالا
function updateCommodity(commodity, priceElemId, changeElemId) {
  const priceElem = document.getElementById(priceElemId);
  const changeElem = document.getElementById(changeElemId);
  if (priceElem && changeElem) {
    priceElem.textContent = formatNumber(commodity.p);

    let change = 0;
    // در صورت صفر نبودن مقدار اولیه (o) تغییر را محاسبه می‌کنیم
    if (formatNumber(commodity.p) !== 0) {
      // change = (parseFloat(commodity.p) / parseFloat(commodity.o) - 1) * 100;
      change = parseFloat(commodity.dp);
    }
    changeElem.textContent = formatChange(change);
    // کلاس مربوط به مثبت یا منفی بودن تغییر را اضافه می‌کنیم
    changeElem.classList.add(change < 0 ? "negative" : "positive");
  }
}

// تابع کمکی برای اضافه کردن کلاس positive یا negative
function addValueStateClass(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add(value < 0 ? "negative" : "positive");
  }
}

// شیء نگاشت نام کالا به آی‌دی‌های متناظر
const commodityMapping = {
  ons: { price: "ons-price", change: "ons-change" },
  geram18: { price: "geram18-price", change: "geram18-change" },
  oil: { price: "oil-price", change: "oil-change" },
  oil_brent: { price: "oil_brent-price", change: "oil_brent-change" },
  oil_opec: { price: "oil_opec-price", change: "oil_opec-change" },
  sekeb: { price: "sekeb-price", change: "sekeb-change" },
  sekee: { price: "sekee-price", change: "sekee-change" },
  general_10: { price: "gas-natural-price", change: "gas-natural-change" },
  general_11: { price: "gasoil-price", change: "gasoil-change" },
  price_dollar_rl: { price: "dollar-price", change: "dollar-change" },
  price_aed: { price: "aed-price", change: "aed-change" },
  general_7: { price: "copper-price", change: "copper-change" },
  general_3: { price: "aluminum-price", change: "aluminum-change" },
  general_6: { price: "zinc-price", change: "zinc-change" },
  general_5: { price: "Lead-price", change: "Lead-change" },
  "base-us-steel-coil": { price: "steel-price", change: "steel-change" },
};

function updateUIWithRAF(data) {
  if (!data) return;

  // برنامه‌ریزی بروزرسانی‌ها در فریم بعدی
  requestAnimationFrame(() => {
    // بروزرسانی هدر
    requestAnimationFrame(() => {
      document.getElementById("current-date").textContent = data.date;
      document.getElementById("current-time").textContent = data.time;
      updateMarketStatus(data.marketStatus);
    });

    // بروزرسانی بخش بورس
    requestAnimationFrame(() => {
      const bourseElements = {
        "bourse-index": formatNumber(data.bourse.index),
        "bourse-change": formatNumber(data.bourse.change),
        "bourse-market-value": formatNumber(data.bourse.marketValue),
        "bourse-trade-value": formatNumber(data.bourse.tradeValue),
        "bourse-top-influence": data.bourse.topInfluence,
        "bourse-top-gain": data.bourse.topGain,
        "bourse-top-loss": data.bourse.topLoss,
      };

      Object.entries(bourseElements).forEach(([id, value]) => {
        document.getElementById(id).textContent = value;
      });
      addValueStateClass("bourse-change", data.bourse.change);
    });

    // بروزرسانی بخش فرابورس
    requestAnimationFrame(() => {
      const farabourseElements = {
        "farabourse-index": formatNumber(data.farabourse.index),
        "farabourse-change": formatNumber(data.farabourse.change),
        "farabourse-market-first": formatNumber(
          data.farabourse.marketValue.firstSecondMarket
        ),
        "farabourse-market-base": formatNumber(
          data.farabourse.marketValue.baseMarket
        ),
        "farabourse-trade-value": formatNumber(data.farabourse.tradeValue),
        "farabourse-top-influence": data.farabourse.topInfluence,
        "farabourse-top-gain": data.farabourse.topGain,
        "farabourse-top-loss": data.farabourse.topLoss,
      };

      Object.entries(farabourseElements).forEach(([id, value]) => {
        document.getElementById(id).textContent = value;
      });
      addValueStateClass("farabourse-change", data.farabourse.change);
    });

    // بروزرسانی شاخص‌ها
    requestAnimationFrame(() => {
      for (let i = 0; i < 4; i++) {
        document.getElementById(`${i}-indexes-value`).textContent =
          data.indexes[i].index;
        document.getElementById(`${i}-indexes-change`).textContent =
          formatNumber(data.indexes[i].indexChange);
        addValueStateClass(`${i}-indexes-change`, data.indexes[i].indexChange);
      }
    });

    // بروزرسانی آمار بازار
    requestAnimationFrame(() => {
      const marketElements = {
        "top-sanat": data.sanat,
        "most-value": data.mostValue,
        mosbat: data.marketCount.mosbat,
        manfi: data.marketCount.manfi,
        "saf-kharid": data.marketCount.safmosbat,
        "saf-forosh": data.marketCount.safmanfi,
        "arzesh-saf-kharid": Math.round(
          data.marketCount.arzeshsafmosbat / config.BILLIONTOMAN
        ),
        "arzesh-saf-forosh": Math.round(
          data.marketCount.arzeshsafmanfi / config.BILLIONTOMAN
        ),
        "most-saf-kharid": data.safha.top5Kharid,
        "most-saf-forosh": data.safha.top5Forosh,
      };

      Object.entries(marketElements).forEach(([id, value]) => {
        document.getElementById(id).textContent = value;
      });
    });

    // بروزرسانی بخش اختیار معامله
    requestAnimationFrame(() => {
      document.getElementById("arzesh-moamelat-akhtiyar").textContent =
        formatNumber(data.akhtiyarTotalValues.qTotCap / config.BILLION);
      document.getElementById("hajm-moamelat-akhtiyar").textContent =
        formatNumber(data.akhtiyarTotalValues.qTotTran5J);
      document.getElementById("top-akhtiyar").textContent =
        data.top5FAkhtiyarValue;
      document.getElementById("top-akhtiyar-hafte").textContent =
        data.top5FAkhtiyarValue;
    });

    // بروزرسانی کالاها
    requestAnimationFrame(() => {
      data.camodities.forEach((commodity) => {
        const mapItem = commodityMapping[commodity.name];
        if (mapItem) {
          updateCommodity(commodity, mapItem.price, mapItem.change);
        }
      });
    });

    // بروزرسانی ارزهای دیجیتال
    requestAnimationFrame(() => {
      const cryptos = [
        { id: "bitcoin", name: "بیت‌کوین" },
        { id: "ethereum", name: "اتریوم" },
        { id: "ripple", name: "ریپل" },
      ];

      cryptos.forEach((crypto) => {
        const price = data.currency[crypto.id]?.usd;
        const change = data.currency[crypto.id]?.usd_24h_change;

        if (price !== undefined && change !== undefined) {
          document.getElementById(`${crypto.id}-price`).textContent =
            formatNumber(price);
          document.getElementById(`${crypto.id}-change`).textContent =
            formatChange(change);
          addValueStateClass(`${crypto.id}-change`, change);
        }
      });

      // بروزرسانی تتر
      if (data.tether?.price) {
        document.getElementById("tether-price").textContent = formatNumber(
          data.tether.price
        );
        document.getElementById("tether-change").textContent = formatChange(
          Number(data.tether.diff24d)
        );
        addValueStateClass("tether-change", Number(data.tether.diff24d));
      }
    });
  });
}

// جایگزینی تابع قبلی updateUI با تابع جدید
function updateUI(data) {
  updateUIWithRAF(data);
}

async function init() {
  try {
    const data = await fetchDataParallel();
    if (!data) throw new Error("داده‌ای دریافت نشد");
    updateUI(data);
  } catch (error) {
    console.error("خطا در دریافت داده:", error);
    alert("خطا در دریافت اطلاعات بازار");
  }
}

document.addEventListener("DOMContentLoaded", init);

// service-worker.js
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

const throttledUpdate = throttle(updateUI, 1000);
