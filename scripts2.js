// تابع تبدیل تاریخ میلادی به شمسی
function convertToJalaliDate(gregorianDate) {
  gregorianDate = String(gregorianDate);
  const gYear = parseInt(gregorianDate.slice(0, 4), 10);
  const gMonth = parseInt(gregorianDate.slice(4, 6), 10);
  const gDay = parseInt(gregorianDate.slice(6, 8), 10);

  const gDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const jDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

  let gy = gYear - 1600;
  let gm = gMonth - 1;
  let gd = gDay - 1;

  let gDayNo = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400);

  for (let i = 0; i < gm; ++i) gDayNo += gDaysInMonth[i];
  if (gm > 1 && ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0)) gDayNo++;

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

// تابع تبدیل زمان به قالب خوانا
function convertToReadableTime(marketActivityHEven) {
  const hours = Math.floor(parseInt(marketActivityHEven, 10) / 10000);
  const minutes = Math.floor((parseInt(marketActivityHEven, 10) % 10000) / 100);
  const seconds = parseInt(marketActivityHEven, 10) % 100;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// توابع پردازش داده‌ها
function getTop10LvaGain(data) {
  if (!data?.marketwatch) return "ناموجود";
  const filteredItems = data.marketwatch.filter(item => item.pmx === item.pdv && !/\d/.test(item.lva));
  const sortedByQtc = filteredItems.sort((a, b) => b.qtc - a.qtc);
  return sortedByQtc.slice(0, 10).map(item => item.lva).join(" - ") || "ناموجود";
}

function getTop10LvaLoss(data) {
  if (!data?.marketwatch) return "ناموجود";
  const filteredItems = data.marketwatch.filter(item => item.pmn === item.pdv && !/\d/.test(item.lva));
  const sortedByQtc = filteredItems.sort((a, b) => b.qtc - a.qtc);
  return sortedByQtc.slice(0, 10).map(item => item.lva).join(" - ") || "ناموجود";
}

function getMarketTopValue(data) {
  if (!data?.marketwatch) return "ناموجود";
  const filteredItems = data.marketwatch.filter(item => !/\d/.test(item.lva));
  const sortedByQtc = filteredItems.sort((a, b) => b.qtc - a.qtc);
  return sortedByQtc.slice(0, 10).map(item => item.lva).join(" - ") || "ناموجود";
}

function getAkhtiyarValue(data) {
  if (!data) return "ناموجود";
  const sortedByQtc = data.sort((a, b) => b.qTotCap_C - a.qTotCap_C).sort((a, b) => b.qTotCap_P - a.qTotCap_P);
  const top5UniqueLva = Array.from(new Set(sortedByQtc.map(item => item.lval30_UA))).slice(0, 5);
  return top5UniqueLva.join(" - ") || "ناموجود";
}

function getAkhtiyarNameKharid(data) {
  if (!data) return "ناموجود";
  const sortedByQtc = data.sort((a, b) => b.qTotCap_C - a.qTotCap_C);
  const top5UniqueLva = Array.from(new Set(sortedByQtc.map(item => `${item.lVal18AFC_C}&${item.lVal30_C}&${item.qTotCap_C}`))).slice(0, 5);
  return top5UniqueLva.map(item => item.split("&")).join(" - ") || "ناموجود";
}

function getAkhtiyarNameForosh(data) {
  if (!data) return "ناموجود";
  const sortedByQtc = data.sort((a, b) => b.qTotCap_P - a.qTotCap_P);
  const top5UniqueLva = Array.from(new Set(sortedByQtc.map(item => `${item.lVal18AFC_P}&${item.lVal30_P}&${item.qTotCap_P}`))).slice(0, 5);
  return top5UniqueLva.map(item => item.split("&")).join(" - ") || "ناموجود";
}

function extractSelectedIndexes(data) {
  if (!data?.indexB1) return {};
  const targetIndexes = ["شاخص 30 شركت بزرگ", "شاخص50شركت فعالتر", "شاخص قيمت (هم وزن)", "شاخص صنعت"];
  return targetIndexes.reduce((acc, name, idx) => {
    const item = data.indexB1.find(entry => entry.lVal30 === name);
    if (item) acc[idx] = { name, index: item.xDrNivJIdx004, indexChange: item.indexChange };
    return acc;
  }, {});
}

function getMarketCount(data) {
  if (!data?.marketwatch) return { mosbat: "ناموجود", manfi: "ناموجود", safmosbat: "ناموجود", safmanfi: "ناموجود", arzeshsafmosbat: "ناموجود", arzeshsafmanfi: "ناموجود" };
  let mosbat = 0, manfi = 0, safmosbat = 0, safmanfi = 0, arzeshsafmosbat = 0, arzeshsafmanfi = 0;
  data.marketwatch.forEach(i => {
    if (i.pc > 0) {
      mosbat++;
      if (i.pdv == i.pmx) {
        safmosbat++;
        arzeshsafmosbat += i.blDs[0].qmd * i.blDs[0].pmd;
      }
    }
    if (i.pc < 0) {
      manfi++;
      if (i.pdv == i.pmn) {
        safmanfi++;
        arzeshsafmanfi += i.blDs[0].qmo * i.blDs[0].pmo;
      }
    }
  });
  return { mosbat, manfi, safmosbat, safmanfi, arzeshsafmosbat, arzeshsafmanfi };
}

function getMarketMostSaf(data) {
  if (!data?.marketwatch) return { top5Kharid: "ناموجود", top5Forosh: "ناموجود" };
  const filteredItems = data.marketwatch.filter(item => !/\d/.test(item.lva));
  const itemsWithValues = filteredItems.map(i => ({
    lva: i.lva,
    qmdPmd: i.pdv == i.pmx ? i.blDs[0].qmd * i.blDs[0].pmd : 0,
    qmoPmo: i.pdv == i.pmn ? i.blDs[0].qmo * i.blDs[0].pmo : 0,
  }));
  const top5Kharid = itemsWithValues.sort((a, b) => b.qmdPmd - a.qmdPmd).slice(0, 5).map(item => item.lva).join(" - ");
  const top5Forosh = itemsWithValues.sort((a, b) => b.qmoPmo - a.qmoPmo).slice(0, 5).map(item => item.lva).join(" - ");
  return { top5Kharid, top5Forosh };
}

// تنظیمات
const config = {
  currencyFormatter: new Intl.NumberFormat("fa-IR"),
  BILLION: 1e9,
  BILLIONTOMAN: 1e10,
};

const apiUrls = {
  bourse: "https://cdn.tsetmc.com/api/MarketData/GetMarketOverview/1",
  farabourse: "https://cdn.tsetmc.com/api/MarketData/GetMarketOverview/2",
  bourseEffect: "https://cdn.tsetmc.com/api/Index/GetInstEffect/0/1/10",
  farabourseEffect: "https://cdn.tsetmc.com/api/Index/GetInstEffect/0/2/10",
  borsevafaraborsevasandogh: "https://cdn.tsetmc.com/api/ClosingPrice/GetMarketWatch?market=0&industrialGroup=&showTraded=true&withBestLimits=true&hEven=0&RefID=0&paperTypes[0]=1&paperTypes[1]=2&paperTypes[7]=8",
  borsevafarabors: "https://cdn.tsetmc.com/api/ClosingPrice/GetMarketWatch?market=0&industrialGroup=&showTraded=true&withBestLimits=true&hEven=0&RefID=0&paperTypes[0]=1&paperTypes[1]=2",
  borselist: "https://cdn.tsetmc.com/api/ClosingPrice/GetMarketWatch?market=1&industrialGroup=&paperTypes%5B0%5D=1&showTraded=true&withBestLimits=true&hEven=0&RefID=0",
  faraborselist: "https://cdn.tsetmc.com/api/ClosingPrice/GetMarketWatch?market=2&industrialGroup=&paperTypes%5B0%5D=1&paperTypes%5B1%5D=2&showTraded=true&withBestLimits=true&hEven=0&RefID=0",
  sanat: "https://cdn.tsetmc.com/api/MarketData/GetSectorTop/5",
  indexes: "https://cdn.tsetmc.com/api/Index/GetIndexB1LastAll/All/1",
  allbejozsandogh: "https://cdn.tsetmc.com/api/ClosingPrice/GetMarketWatch?market=0&industrialGroup=&showTraded=true&withBestLimits=true&hEven=0&RefID=0&paperTypes[0]=1&paperTypes[1]=2&paperTypes[2]=3&paperTypes[3]=4&paperTypes[4]=5&paperTypes[5]=6&paperTypes[6]=7&paperTypes[8]=9",
  akhtiyarBorse: "https://cdn.tsetmc.com/api/Instrument/GetInstrumentOptionMarketWatch/1",
  akhtiyarFaraBorse: "https://cdn.tsetmc.com/api/Instrument/GetInstrumentOptionMarketWatch/2",
  camodity: "https://api.tgju.org/v1/widget/tmp?keys=137187,137186,137183,137119,137206,137121,137203,137119,137134,137135,137136,137138,137137,137179,137181,137182,137183,131439",
  currency: "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple&vs_currencies=usd&include_24hr_change=true",
  tether: "https://api.tetherland.com/currencies",
};

const requestHeaders = {
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Connection: "keep-alive",
  Host: "cdn.tsetmc.com",
  Origin: window.location.origin,
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
};

// تابع فراخوانی API با مدیریت خطا
async function fetchApi(url) {
  try {
    const response = await fetch(url, { method: "GET", headers: requestHeaders });
    if (!response.ok) throw new Error(`وضعیت: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`خطا در دریافت داده از ${url}:`, error);
    return null;
  }
}

// تابع اصلی دریافت داده‌ها
async function fetchDataParallel() {
  try {
    const mainMarketPromises = [
      fetchApi(apiUrls.bourse),
      fetchApi(apiUrls.farabourse),
      fetchApi(apiUrls.bourseEffect),
      fetchApi(apiUrls.farabourseEffect),
      fetchApi(apiUrls.indexes),
    ];

    const listDataPromises = [
      fetchApi(apiUrls.borselist),
      fetchApi(apiUrls.faraborselist),
      fetchApi(apiUrls.borsevafaraborsevasandogh),
      fetchApi(apiUrls.borsevafarabors),
      fetchApi(apiUrls.allbejozsandogh),
      fetchApi(apiUrls.sanat),
    ];

    const optionsDataPromises = [
      fetchApi(apiUrls.akhtiyarBorse),
      fetchApi(apiUrls.akhtiyarFaraBorse),
    ];

    const globalMarketsDataPromises = [
      fetchApi(apiUrls.camodity),
      fetchApi(apiUrls.currency),
      fetchApi(apiUrls.tether),
    ];

    const [mainMarketResults, listDataResults, optionsDataResults, globalMarketsDataResults] = await Promise.all([
      Promise.allSettled(mainMarketPromises),
      Promise.allSettled(listDataPromises),
      Promise.allSettled(optionsDataPromises),
      Promise.allSettled(globalMarketsDataPromises),
    ]);

    const extractData = results => results.map(result => result.status === "fulfilled" ? result.value : null);

    const mainMarketData = extractData(mainMarketResults);
    const listData = extractData(listDataResults);
    const optionsData = extractData(optionsDataResults);
    const globalMarketsData = extractData(globalMarketsDataResults);

    const [bourseData, farabourseData, bourseEffect, farabourseEffect, indexes] = mainMarketData;
    const [borselist, faraborselist, borsevafaraborsevasandogh, borsevafarabors, allDara, sanat] = listData;
    const [akhborse, akhfaraborse] = optionsData;
    const [camodity, currency, tether] = globalMarketsData;

    const processedData = {};

    // پردازش داده‌های بورس
    processedData.bourse = bourseData ? {
      index: bourseData.marketOverview.indexLastValue,
      change: bourseData.marketOverview.indexChange,
      marketValue: Math.round(bourseData.marketOverview.marketValue / config.BILLION),
      tradeValue: Math.round(bourseData.marketOverview.marketActivityQTotCap / config.BILLION),
      topInfluence: bourseEffect ? bourseEffect.instEffect.map(item => item.instrument.lVal18AFC).join(" - ") : "ناموجود",
      topGain: getTop10LvaGain(borselist),
      topLoss: getTop10LvaLoss(borselist),
    } : { index: "ناموجود", change: "ناموجود", marketValue: "ناموجود", tradeValue: "ناموجود", topInfluence: "ناموجود", topGain: "ناموجود", topLoss: "ناموجود" };

    // پردازش داده‌های فرابورس
    processedData.farabourse = farabourseData ? {
      index: farabourseData.marketOverview.indexLastValue,
      change: farabourseData.marketOverview.indexChange,
      marketValue: {
        firstSecondMarket: Math.round(farabourseData.marketOverview.marketValue / config.BILLION),
        baseMarket: Math.round(farabourseData.marketOverview.marketValueBase / config.BILLION),
      },
      tradeValue: Math.round(farabourseData.marketOverview.marketActivityQTotCap / config.BILLION),
      topInfluence: farabourseEffect ? farabourseEffect.instEffect.map(item => item.instrument.lVal18AFC).join(" - ") : "ناموجود",
      topGain: getTop10LvaGain(faraborselist),
      topLoss: getTop10LvaLoss(faraborselist),
    } : { index: "ناموجود", change: "ناموجود", marketValue: { firstSecondMarket: "ناموجود", baseMarket: "ناموجود" }, tradeValue: "ناموجود", topInfluence: "ناموجود", topGain: "ناموجود", topLoss: "ناموجود" };

    // سایر داده‌ها
    processedData.date = bourseData ? convertToJalaliDate(bourseData.marketOverview.marketActivityDEven) : "ناموجود";
    processedData.time = bourseData ? convertToReadableTime(bourseData.marketOverview.marketActivityHEven) : "ناموجود";
    processedData.marketStatus = bourseData ? bourseData.marketOverview.marketStateTitle : "ناموجود";
    processedData.indexes = extractSelectedIndexes(indexes);
    processedData.sanat = sanat ? sanat.sectorTop.map(item => item.lVal30.split("-")[1]).join(" - ") : "ناموجود";
    processedData.mostValue = getMarketTopValue(borsevafaraborsevasandogh);
    processedData.marketCount = getMarketCount(borsevafarabors);
    processedData.safha = getMarketMostSaf(allDara);

    if (akhborse && akhfaraborse) {
      const akhtiyar = akhborse.instrumentOptMarketWatch.concat(akhfaraborse.instrumentOptMarketWatch);
      processedData.akhtiyarTotalValues = akhtiyar.reduce((totals, item) => {
        totals.qTotTran5J += item.qTotTran5J_P + item.qTotTran5J_C;
        totals.qTotCap += item.qTotCap_P + item.qTotCap_C;
        return totals;
      }, { qTotTran5J: 0, qTotCap: 0 });
      processedData.top5FAkhtiyarValue = getAkhtiyarValue(akhtiyar);
      processedData.Top5NameKhari = getAkhtiyarNameKharid(akhtiyar);
      processedData.Top5NameForosh = getAkhtiyarNameForosh(akhtiyar);
    } else {
      processedData.akhtiyarTotalValues = { qTotTran5J: "ناموجود", qTotCap: "ناموجود" };
      processedData.top5FAkhtiyarValue = "ناموجود";
      processedData.Top5NameKhari = "ناموجود";
      processedData.Top5NameForosh = "ناموجود";
    }

    processedData.camodities = camodity?.response?.indicators || [];
    processedData.currency = currency || {};
    processedData.tether = tether?.data?.currencies?.USDT || null;

    return processedData;
  } catch (error) {
    console.error("خطا در تجمیع داده‌های بازار:", error);
    return null;
  }
}

// توابع رابط کاربری
function updateMarketStatus(status) {
  const statusEl = document.getElementById("market-status");
  statusEl.textContent = status;
  statusEl.className = `font-medium ${status === "باز" ? "positive" : "negative"}`;
}

const memoize = fn => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
};

const formatNumber = memoize(number => config.currencyFormatter.format(number || 0));
const formatChange = value => !isFinite(value) ? "—" : (value > 0 ? "+" : "") + value.toFixed(2) + "%";

function updateCommodity(commodity, priceElemId, changeElemId) {
  const priceElem = document.getElementById(priceElemId);
  const changeElem = document.getElementById(changeElemId);
  if (priceElem && changeElem) {
    priceElem.textContent = formatNumber(commodity.p);
    const change = commodity.o ? (parseFloat(commodity.p) / parseFloat(commodity.o) - 1) * 100 : 0;
    changeElem.textContent = formatChange(change);
    changeElem.classList.add(change < 0 ? "negative" : "positive");
  }
}

function addValueStateClass(elementId, value) {
  const element = document.getElementById(elementId);
  if (element && value !== "ناموجود") element.classList.add(value < 0 ? "negative" : "positive");
}

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

function updateUI(data) {
  if (!data) return;

  document.getElementById("current-date").textContent = data.date;
  document.getElementById("current-time").textContent = data.time;
  updateMarketStatus(data.marketStatus);

  // بورس
  const bourseEls = {
    "bourse-index": data.bourse.index,
    "bourse-change": data.bourse.change,
    "bourse-market-value": data.bourse.marketValue,
    "bourse-trade-value": data.bourse.tradeValue,
    "bourse-top-influence": data.bourse.topInfluence,
    "bourse-top-gain": data.bourse.topGain,
    "bourse-top-loss": data.bourse.topLoss,
  };
  Object.entries(bourseEls).forEach(([id, value]) => document.getElementById(id).textContent = formatNumber(value));
  addValueStateClass("bourse-change", data.bourse.change);

  // فرابورس
  const farabourseEls = {
    "farabourse-index": data.farabourse.index,
    "farabourse-change": data.farabourse.change,
    "farabourse-market-first": data.farabourse.marketValue.firstSecondMarket,
    "farabourse-market-base": data.farabourse.marketValue.baseMarket,
    "farabourse-trade-value": data.farabourse.tradeValue,
    "farabourse-top-influence": data.farabourse.topInfluence,
    "farabourse-top-gain": data.farabourse.topGain,
    "farabourse-top-loss": data.farabourse.topLoss,
  };
  Object.entries(farabourseEls).forEach(([id, value]) => document.getElementById(id).textContent = formatNumber(value));
  addValueStateClass("farabourse-change", data.farabourse.change);

  // شاخص‌ها
  for (let i = 0; i < 4; i++) {
    document.getElementById(`${i}-indexes-value`).textContent = data.indexes[i]?.index || "ناموجود";
    document.getElementById(`${i}-indexes-change`).textContent = formatNumber(data.indexes[i]?.indexChange || "ناموجود");
    addValueStateClass(`${i}-indexes-change`, data.indexes[i]?.indexChange);
  }

  // آمار بازار
  const marketEls = {
    "top-sanat": data.sanat,
    "most-value": data.mostValue,
    mosbat: data.marketCount.mosbat,
    manfi: data.marketCount.manfi,
    "saf-kharid": data.marketCount.safmosbat,
    "saf-forosh": data.marketCount.safmanfi,
    "arzesh-saf-kharid": Math.round(data.marketCount.arzeshsafmosbat / config.BILLIONTOMAN),
    "arzesh-saf-forosh": Math.round(data.marketCount.arzeshsafmanfi / config.BILLIONTOMAN),
    "most-saf-kharid": data.safha.top5Kharid,
    "most-saf-forosh": data.safha.top5Forosh,
  };
  Object.entries(marketEls).forEach(([id, value]) => document.getElementById(id).textContent = formatNumber(value));

  // اختیار معامله
  document.getElementById("arzesh-moamelat-akhtiyar").textContent = formatNumber(data.akhtiyarTotalValues.qTotCap / config.BILLION);
  document.getElementById("hajm-moamelat-akhtiyar").textContent = formatNumber(data.akhtiyarTotalValues.qTotTran5J);
  document.getElementById("top-akhtiyar").textContent = data.top5FAkhtiyarValue;
  document.getElementById("top-akhtiyar-hafte").textContent = data.top5FAkhtiyarValue;

  // کالاها و ارزها
  data.camodities.forEach(commodity => {
    const mapItem = commodityMapping[commodity.name];
    if (mapItem) updateCommodity(commodity, mapItem.price, mapItem.change);
  });

  const cryptos = [
    { id: "bitcoin", name: "بیت‌کوین" },
    { id: "ethereum", name: "اتریوم" },
    { id: "ripple", name: "ریپل" },
  ];
  cryptos.forEach(crypto => {
    const price = data.currency[crypto.id]?.usd;
    const change = data.currency[crypto.id]?.usd_24h_change;
    if (price !== undefined && change !== undefined) {
      document.getElementById(`${crypto.id}-price`).textContent = formatNumber(price);
      document.getElementById(`${crypto.id}-change`).textContent = formatChange(change);
      addValueStateClass(`${crypto.id}-change`, change);
    } else {
      document.getElementById(`${crypto.id}-price`).textContent = "ناموجود";
      document.getElementById(`${crypto.id}-change`).textContent = "ناموجود";
    }
  });

  if (data.tether?.price) {
    document.getElementById("tether-price").textContent = formatNumber(data.tether.price);
    document.getElementById("tether-change").textContent = formatChange(Number(data.tether.diff24d));
    addValueStateClass("tether-change", Number(data.tether.diff24d));
  } else {
    document.getElementById("tether-price").textContent = "ناموجود";
    document.getElementById("tether-change").textContent = "ناموجود";
  }
}

async function init() {
  try {
    const data = await fetchDataParallel();
    if (data) updateUI(data);
    else alert("داده‌ای برای نمایش وجود ندارد");
  } catch (error) {
    console.error("خطا در اجرای برنامه:", error);
    alert("خطا در اجرای برنامه");
  }
}

document.addEventListener("DOMContentLoaded", init);