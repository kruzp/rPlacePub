(function () {
  // Hours in 24h, Kelley time. A close past 24 runs into the next morning (26 = 2 AM).
  // 0 = Sunday ... 6 = Saturday. null = closed.
  var HOURS = [
    [11, 24],   // Sunday
    null,       // Monday
    [15, 24],   // Tuesday
    [15, 24],   // Wednesday
    [15, 24],   // Thursday
    [15, 26],   // Friday
    [11, 26]    // Saturday
  ];
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function fmt(hr) {
    var h = hr % 24, suf = h < 12 ? "AM" : "PM", hh = h % 12 === 0 ? 12 : h % 12;
    return hh + " " + suf;
  }

  // current day/hour in Kelley, Iowa (America/Chicago), whatever the visitor's own time zone
  function nowInKelley() {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var get = function (t) { return (parts.find(function (p) { return p.type === t; }) || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    var hour = (+get("hour") % 24) + (+get("minute")) / 60;
    return { day: day, hour: hour };
  }

  function status() {
    var n = nowInKelley(), today = HOURS[n.day], prev = HOURS[(n.day + 6) % 7];
    if (prev && prev[1] > 24 && n.hour < prev[1] - 24) return { open: true, until: prev[1] };
    if (today && n.hour >= today[0] && n.hour < today[1]) return { open: true, until: today[1] };
    for (var i = 0; i < 7; i++) {
      var d = (n.day + i) % 7, hrs = HOURS[d];
      if (!hrs) continue;
      if (i === 0 && n.hour >= hrs[0]) continue;
      return { open: false, day: i === 0 ? "today" : i === 1 ? "tomorrow" : DAYS[d], at: hrs[0] };
    }
    return { open: false };
  }

  function render() {
    var s = status(), neon = document.getElementById("neon"), txt = document.getElementById("neonText");
    neon.classList.toggle("on", s.open);
    txt.textContent = s.open ? "Open now · until " + fmt(s.until) : (s.day ? "Opens " + s.day + " at " + fmt(s.at) : "Closed");

    var body = document.querySelector("#hours tbody"), today = nowInKelley().day;
    body.innerHTML = "";
    [1, 2, 3, 4, 5, 6, 0].forEach(function (d) {
      var tr = document.createElement("tr"), a = document.createElement("td"), b = document.createElement("td");
      a.textContent = DAYS[d];
      b.textContent = HOURS[d] ? fmt(HOURS[d][0]) + " – " + fmt(HOURS[d][1]) : "Closed";
      if (!HOURS[d]) tr.className = "closed";
      if (d === today) tr.className += " today";
      tr.appendChild(a); tr.appendChild(b); body.appendChild(tr);
    });
  }
  render();
  setInterval(render, 60000);
})();
