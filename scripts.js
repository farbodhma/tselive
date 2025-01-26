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

function getTop7LvaGain(data) {
  const filteredItems = data.marketwatch.filter(
    (item) => item.pmx === item.pmo
  );
  const sortedByQtc = filteredItems.sort((a, b) => b.qtc - a.qtc);
  const top7Lva = sortedByQtc.slice(0, 7).map((item) => item.lva);
  const resultString = top7Lva.join(" ");

  return resultString;
}

function getTop7LvaLoss(data) {
  const filteredItems = data.marketwatch.filter(
    (item) => item.pmn === item.pmo
  );
  const sortedByQtc = filteredItems.sort((a, b) => b.qtc - a.qtc);
  const top7Lva = sortedByQtc.slice(0, 7).map((item) => item.lva);
  const resultString = top7Lva.join(" ");

  return resultString;
}
