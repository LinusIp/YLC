/* ============================
   Simple data source (replace/add)
   Each lesson: id, title, desc, category, thumbnail, src (mp4 or youtube)
   Posters: id, title, file, thumb
   ============================ */

const DATA = {
  classrooms: [
    { id: "programming", title: "Programming", desc: "C, Python, Web" },
    { id: "math", title: "Mathematics", desc: "Algebra, Geometry" },
    { id: "english", title: "English", desc: "Reading & Writing" },
  ],

  lessons: [
    {
      id: "l1",
      title: "Intro to Programming — Sum & Even/Odd",
      desc: "Basic program to sum integers & check even/odd.",
      category: "programming",
      thumbnail: "images/thumb-programming1.png",
      src: "videos/sample-lesson-1.mp4" // or a YouTube embed url like: "https://www.youtube.com/embed/VIDEO_ID"
    },
    {
      id: "l2",
      title: "Variables & Conditions",
      desc: "Understand variables, if/else, and basic flow control.",
      category: "programming",
      thumbnail: "images/thumb-programming2.png",
      src: "videos/sample-lesson-2.mp4"
    },
    {
      id: "l3",
      title: "Reading Comprehension (Basics)",
      desc: "Short passages + comprehension strategies.",
      category: "english",
      thumbnail: "images/thumb-english1.png",
      src: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    }
  ],

  posters: [
    { id: "p1", title: "Study Tips Poster", file: "posters/study-tips.pdf", thumb: "images/poster1.png" },
    { id: "p2", title: "C Cheatsheet", file: "posters/c-cheatsheet.pdf", thumb: "images/poster2.png" }
  ]
};

/* --------------------------
   Utility: DOM shortcuts
   -------------------------- */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

/* --------------------------
   Initialize site
   -------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // fill year in footer
  $("#year").textContent = new Date().getFullYear();

  // populate categories filter & classrooms
  populateCategories();
  renderClassrooms();
  renderLessons(DATA.lessons);
  renderPosters();

  // events
  $("#searchInput").addEventListener("input", onFilterChange);
  $("#categoryFilter").addEventListener("change", onFilterChange);
  $("#clearFilters").addEventListener("click", () => {
    $("#searchInput").value = "";
    $("#categoryFilter").value = "";
    renderLessons(DATA.lessons);
  });

  // nav links: smooth behavior & mobile close
  document.querySelectorAll("[data-link]").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute("href"));
      if (target) target.scrollIntoView({behavior:"smooth", block:"start"});
      if (window.innerWidth < 800) toggleMobileNav(false);
    });
  });

  // mobile menu toggle
  $("#menuBtn").addEventListener("click", () => toggleMobileNav());

  // theme
  const savedTheme = localStorage.getItem("ylc-theme");
  if (savedTheme === "dark") document.documentElement.classList.add("dark");
  updateThemeIcon();
  $("#themeToggle").addEventListener("click", toggleTheme);

  // modal buttons
  $("#closeModal").addEventListener("click", closeModal);
  document.getElementById("videoModal").addEventListener("click", e => {
    if (e.target === e.currentTarget) closeModal();
  });
});

/* --------------------------
   Render functions
   -------------------------- */
function populateCategories(){
  const sel = $("#categoryFilter");
  DATA.classrooms.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.title;
    sel.appendChild(opt);
  });
}

function renderClassrooms(){
  const grid = $("#classroomsGrid");
  grid.innerHTML = "";
  DATA.classrooms.forEach(c => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div style="display:flex;gap:0.8rem;align-items:center">
        <div style="width:64px;height:64px;border-radius:12px;background:linear-gradient(90deg,var(--accent),var(--accent-700));display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:1.1rem">${c.title[0]}</div>
        <div>
          <strong>${c.title}</strong>
          <div class="muted" style="font-size:0.95rem">${c.desc || ""}</div>
        </div>
      </div>
      <div style="margin-top:0.7rem">
        <button class="btn primary" onclick="filterToCategory('${c.id}')">Open classroom</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderLessons(list){
  const grid = $("#lessonsGrid");
  grid.innerHTML = "";
  if (!list.length) {
    grid.innerHTML = `<div class="muted">No lessons found</div>`;
    return;
  }
  list.forEach(l => {
    const card = document.createElement("article");
    card.className = "card lesson-card";
    card.innerHTML = `
      <div class="thumb">
        <img src="${l.thumbnail || 'images/thumb-placeholder.png'}" alt="${escapeHtml(l.title)}">
      </div>
      <div>
        <div class="lesson-title">${l.title}</div>
        <div class="lesson-sub">${(DATA.classrooms.find(c=>c.id===l.category)||{}).title || 'General'} • ${l.desc}</div>
      </div>
      <div class="lesson-meta">
        <div class="muted">${shortDate()}</div>
        <div>
          <button class="btn" onclick="openLesson('${l.id}')">▶ Watch</button>
          <button class="btn" onclick="downloadLesson('${l.id}')">⬇️</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderPosters(){
  const grid = $("#postersGrid");
  grid.innerHTML = "";
  DATA.posters.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="thumb"><img src="${p.thumb || 'images/poster-placeholder.png'}" alt="${escapeHtml(p.title)}"></div>
      <div style="margin-top:0.6rem">
        <strong>${p.title}</strong>
        <div class="poster-actions">
          <a class="btn primary" href="${p.file}" target="_blank" rel="noopener">Open</a>
          <a class="btn" href="${p.file}" download>Download</a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* --------------------------
   Filtering & search
   -------------------------- */
function onFilterChange(){
  const q = $("#searchInput").value.trim().toLowerCase();
  const cat = $("#categoryFilter").value;
  const filtered = DATA.lessons.filter(l => {
    const inCat = cat ? l.category === cat : true;
    const inText = q ? (l.title+ " " + l.desc + " " + (l.category||"")).toLowerCase().includes(q) : true;
    return inCat && inText;
  });
  renderLessons(filtered);
}

function filterToCategory(catId){
  $("#categoryFilter").value = catId;
  onFilterChange();
  document.querySelector(`[href="#videos"]`).click();
}

/* --------------------------
   Lesson actions (modal player)
   -------------------------- */
function openLesson(id){
  const lesson = DATA.lessons.find(x=>x.id===id);
  if (!lesson) return;
  const frame = $("#videoFrame");
  frame.innerHTML = "";
  // Detect YouTube embed (starts with https://www.youtube.com/embed/)
  if (lesson.src && lesson.src.startsWith("https://www.youtube.com/embed/")) {
    const iframe = document.createElement("iframe");
    iframe.src = lesson.src + "?rel=0&autoplay=1";
    iframe.allow = "autoplay; encrypted-media; picture-in-picture";
    iframe.setAttribute("allowfullscreen", "");
    frame.appendChild(iframe);
  } else {
    const video = document.createElement("video");
    video.src = lesson.src;
    video.controls = true;
    video.autoplay = true;
    video.setAttribute("playsinline", "");
    frame.appendChild(video);
  }
  $("#modalTitle").textContent = lesson.title;
  $("#modalDesc").textContent = lesson.desc || "";
  openModal();
}

function downloadLesson(id){
  const lesson = DATA.lessons.find(x=>x.id===id);
  if (!lesson) return alert("No file available for download.");
  if (lesson.src && (lesson.src.endsWith(".mp4") || lesson.src.endsWith(".webm"))) {
    const a = document.createElement("a");
    a.href = lesson.src;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } else {
    window.open(lesson.src, "_blank");
  }
}

/* Modal helpers */
function openModal(){
  const modal = document.getElementById("videoModal");
  modal.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}
function closeModal(){
  const modal = document.getElementById("videoModal");
  modal.setAttribute("aria-hidden","true");
  const frame = $("#videoFrame");
  // stop video
  frame.innerHTML = "";
  document.body.style.overflow = "";
}

/* --------------------------
   Theme toggle
   -------------------------- */
function toggleTheme(){
  document.documentElement.classList.toggle("dark");
  updateThemeIcon();
  localStorage.setItem("ylc-theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
}
function updateThemeIcon(){
  const btn = $("#themeToggle");
  btn.textContent = document.documentElement.classList.contains("dark") ? "☀️" : "🌙";
}

/* Add simple dark-mode styles by toggling .dark on <html> */
const darkStyle = document.createElement("style");
darkStyle.textContent = `
  html.dark {
    --bg: #061618;
    --card: #072625;
    --accent: #00bfa6;
    --muted: #9fbfb8;
    --text: #e6fff9;
    background: linear-gradient(180deg,#052926,#052c2b);
  }
  html.dark .site-header{background:linear-gradient(90deg,#003d37,#00594f)}
  html.dark .main-nav a{color:rgba(255,255,255,0.95)}
`;
document.head.appendChild(darkStyle);

/* --------------------------
   Misc helpers
   -------------------------- */
function shortDate(){
  const d = new Date();
  return d.toLocaleDateString();
}
function escapeHtml(s){ return s ? s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])) : "" }

/* --------------------------
   Mobile nav toggling
   -------------------------- */
function toggleMobileNav(force){
  const nav = document.getElementById("mainNav");
  const isHidden = getComputedStyle(nav).display === "none";
  if (typeof force === "boolean") {
    nav.style.display = force ? "flex" : "none";
  } else {
    nav.style.display = isHidden ? "flex" : "none";
    nav.style.flexDirection = "column";
    nav.style.alignItems = "center";
  }
}
