const DEFAULT_AVATAR = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="60" fill="#1e293b"/>
    <circle cx="60" cy="45" r="22" fill="#38bdf8"/>
    <path d="M24 104c6-20 22-30 36-30s30 10 36 30" fill="#38bdf8"/>
  </svg>`
);

const STATUS_NAMES = {
  online: "En ligne",
  idle: "Inactif",
  dnd: "Ne pas déranger",
  offline: "Pas en ligne"
};

const state = {
  profile: {
    name: "Player_GV",
    status: "online",
    game: "Fortnite",
    bio: "Joueur sur Game Visio — prêt pour des games chill ou ranked.",
    avatar: DEFAULT_AVATAR,
    banner: "linear-gradient(135deg, #1d4ed8, #0ea5e9)",
    coins: 300,
    plus: false
  },
  muted: false,
  inVoice: false,
  channel: "général",
  stream: null,
  friends: [
    { name: "Léo_FPS", status: "online", game: "Fortnite — Mode Classé", bio: "Toujours chaud pour une duo ou trio.", banner: "linear-gradient(135deg, #7e22ce, #ec4899)" },
    { name: "Naya_RBX", status: "dnd", game: "Roblox — Obby & RP", bio: "Je construis et je teste des maps.", banner: "linear-gradient(135deg, #047857, #22c55e)" },
    { name: "Sam_971", status: "idle", game: "Rocket League", bio: "Dispo ce soir en vocal.", banner: "linear-gradient(135deg, #b45309, #facc15)" },
    { name: "Inès_GV", status: "offline", game: "Hors ligne", bio: "Modératrice de la communauté.", banner: "linear-gradient(135deg, #1d4ed8, #0ea5e9)" }
  ],
  quests: [
    { id: "q1", label: "Regarder une courte vidéo pub (bonus gratuit)", coins: 100, claimed: false },
    { id: "q2", label: "Rejoindre le salon vocal avec l'équipe", coins: 150, claimed: false },
    { id: "q3", label: "Jouer une session (Fortnite / Roblox / autre)", coins: 200, claimed: false }
  ],
  messages: [
    { author: "Léo_FPS", time: "23:40", text: "Bienvenue sur Game Visio ! Qui rejoint le vocal ?", risky: false },
    { author: "Naya_RBX", time: "23:42", text: "J'arrive après ma game Roblox, pensez à vérifier les liens avant de cliquer.", risky: false }
  ]
};

try {
  const saved = localStorage.getItem("game_visio_user_data");
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed.profile) Object.assign(state.profile, parsed.profile);
  }
} catch (err) {
  console.warn("Lecture localStorage impossible :", err);
}

function persistProfile() {
  try {
    localStorage.setItem("game_visio_user_data", JSON.stringify({ profile: state.profile }));
  } catch (err) {
    console.warn("Écriture localStorage impossible :", err);
  }
}

const RISKY_LINK_REGEX = /(free[-_]?nitro|discord[-_]?gift|robux[-_]?free|steamcommun[il]ty|\.(ru|tk|gq|ml)\/)/i;
function isRiskyMessage(text) {
  return /(https?:\/\/|www\.)\S+/i.test(text) && RISKY_LINK_REGEX.test(text);
}

function renderDock() {
  document.getElementById("dockName").textContent = state.profile.name + (state.profile.plus ? " ⚡" : "");
  document.getElementById("dockAvatar").src = state.profile.avatar || DEFAULT_AVATAR;
  document.getElementById("dockStatusDot").className = "dot " + state.profile.status;
  const gamePart = state.profile.game ? ` • ${state.profile.game}` : "";
  document.getElementById("dockStatusText").textContent = (STATUS_NAMES[state.profile.status] || "En ligne") + gamePart;
  document.getElementById("coinsBadge").textContent = `🪙 ${state.profile.coins} Pièces`;
}

function renderFriends() {
  const wrap = document.getElementById("friendsContainer");
  wrap.innerHTML = "";
  state.friends.forEach((f) => {
    const row = document.createElement("div");
    row.className = "friend-card";
    row.innerHTML = `<span class="dot ${f.status}"></span><span>${f.name}</span><small class="tag">${f.game.split("—")[0].trim()}</small>`;
    row.addEventListener("click", () => showFriend(f));
    wrap.appendChild(row);
  });
}

function renderMessages() {
  const feed = document.getElementById("messagesFeed");
  feed.innerHTML = "";
  state.messages.forEach((m) => {
    const div = document.createElement("div");
    div.className = "msg";
    const imgSrc = m.author === state.profile.name ? state.profile.avatar : DEFAULT_AVATAR;
    div.innerHTML = `
      <img src="${imgSrc}" alt="${m.author}" />
      <div class="msg-bubble">
        <div class="msg-meta"><span class="msg-author">${m.author}</span><span class="msg-time">${m.time}</span></div>
        <div class="msg-body"></div>
        ${m.risky ? `<div class="alert-link">⚠️ Sécurité Game Visio : Lien suspect détecté. Ne clique pas et ne partage jamais ton compte.</div>` : ""}
      </div>
    `;
    div.querySelector(".msg-body").textContent = m.text;
    div.querySelector(".msg-author").addEventListener("click", () => {
      const found = state.friends.find((x) => x.name === m.author) || {
        name: state.profile.name,
        status: state.profile.status,
        game: state.profile.game || "Sur Game Visio",
        bio: state.profile.bio,
        banner: state.profile.banner
      };
      showFriend(found);
    });
    feed.appendChild(div);
  });
  feed.scrollTop = feed.scrollHeight;
}

function showFriend(f) {
  document.getElementById("friendBanner").style.background = f.banner || "linear-gradient(135deg, #1d4ed8, #0ea5e9)";
  document.getElementById("friendAvatar").src = f.name === state.profile.name ? state.profile.avatar : DEFAULT_AVATAR;
  document.getElementById("friendName").textContent = f.name;
  document.getElementById("friendStatusBadge").textContent = STATUS_NAMES[f.status] || "En ligne";
  document.getElementById("friendBio").textContent = f.bio || "Aucune bio.";
  document.getElementById("friendActivity").textContent = f.game || "Sur Game Visio";
  document.getElementById("friendModal").classList.remove("hidden");
}

function renderQuests() {
  const list = document.getElementById("questsList");
  list.innerHTML = "";
  state.quests.forEach((q) => {
    const row = document.createElement("div");
    row.className = "quest-row";
    row.innerHTML = `
      <div><strong>${q.label}</strong><div style="font-size:0.78rem;color:#fbbf24;">+${q.coins} Pièces</div></div>
      <button type="button" class="${q.claimed ? "btn-ghost" : "btn-primary"}" ${q.claimed ? "disabled" : ""}>${q.claimed ? "Reçu ✓" : "Valider"}</button>
    `;
    if (!q.claimed) {
      row.querySelector("button").addEventListener("click", () => {
        q.claimed = true;
        state.profile.coins += q.coins;
        persistProfile();
        renderDock();
        renderQuests();
      });
    }
    list.appendChild(row);
  });
}

document.getElementById("messageForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (!text) return;
  const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  state.messages.push({ author: state.profile.name, time, text, risky: isRiskyMessage(text) });
  input.value = "";
  renderMessages();
});

document.querySelectorAll(".item-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".item-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.channel = btn.dataset.channel;
    document.getElementById("channelHeading").textContent = `# ${state.channel}`;
  });
});

document.querySelectorAll(".member-row").forEach((row) => {
  row.addEventListener("click", () => {
    const found = state.friends.find((f) => f.name === row.dataset.friend);
    if (found) showFriend(found);
  });
});

document.getElementById("btnJoinVoice").addEventListener("click", () => {
  state.inVoice = !state.inVoice;
  document.getElementById("voiceStateText").textContent = state.inVoice ? "En vocal" : "Rejoindre";
  document.getElementById("overlayPip").classList.toggle("hidden", !state.inVoice);
});
document.getElementById("btnToggleOverlay").addEventListener("click", () => document.getElementById("overlayPip").classList.toggle("hidden"));
document.getElementById("btnClosePip").addEventListener("click", () => document.getElementById("overlayPip").classList.add("hidden"));
document.getElementById("pipOpacityBtn").addEventListener("click", () => document.getElementById("overlayPip").classList.toggle("faded"));

function switchMic() {
  state.muted = !state.muted;
  document.getElementById("btnToggleMic").textContent = state.muted ? "🔇" : "🎙️";
  document.getElementById("pipMicLabel").textContent = state.muted ? "Micro OFF" : "Micro ON";
}
document.getElementById("btnToggleMic").addEventListener("click", switchMic);
document.getElementById("pipMuteBtn").addEventListener("click", switchMic);

document.getElementById("qualitySelect").addEventListener("change", (e) => {
  if (e.target.value === "4k60" && !state.profile.plus) {
    alert("4K 60 FPS est réservé à Game Visio Plus.");
    e.target.value = "1080p60";
    return;
  }
  document.getElementById("streamQualityLabel").textContent = e.target.options[e.target.selectedIndex].text;
});

document.getElementById("btnShareScreen").addEventListener("click", async () => {
  const panel = document.getElementById("streamPanel");
  const video = document.getElementById("screenVideo");
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      panel.classList.remove("hidden");
      document.getElementById("streamNote").textContent = "Aperçu actif (capture écran non supportée sur ce navigateur).";
      return;
    }
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 60 }, audio: true });
    state.stream = stream;
    video.srcObject = stream;
    panel.classList.remove("hidden");
    stream.getVideoTracks()[0].addEventListener("ended", stopShare);
  } catch (e) {
    console.warn("Partage annulé :", e);
  }
});

function stopShare() {
  if (state.stream) {
    state.stream.getTracks().forEach((t) => t.stop());
    state.stream = null;
  }
  document.getElementById("screenVideo").srcObject = null;
  document.getElementById("streamPanel").classList.add("hidden");
}
document.getElementById("btnStopShare").addEventListener("click", stopShare);

document.getElementById("btnOpenProfile").addEventListener("click", () => {
  document.getElementById("inputName").value = state.profile.name;
  document.getElementById("selectStatus").value = state.profile.status;
  document.getElementById("inputGame").value = state.profile.game;
  document.getElementById("inputBio").value = state.profile.bio;
  document.getElementById("selectBanner").value = state.profile.banner;
  document.getElementById("profileBannerPreview").style.background = state.profile.banner;
  document.getElementById("profileModal").classList.remove("hidden");
});

document.getElementById("selectBanner").addEventListener("change", (e) => {
  document.getElementById("profileBannerPreview").style.background = e.target.value;
});

document.getElementById("inputAvatarFile").addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { state.profile.avatar = reader.result; };
  reader.readAsDataURL(file);
});

document.getElementById("btnSaveProfile").addEventListener("click", () => {
  const n = document.getElementById("inputName").value.trim();
  if (n) state.profile.name = n;
  state.profile.status = document.getElementById("selectStatus").value;
  state.profile.game = document.getElementById("inputGame").value.trim();
  state.profile.bio = document.getElementById("inputBio").value.trim();
  state.profile.banner = document.getElementById("selectBanner").value;
  persistProfile();
  renderDock();
  renderMessages();
  document.getElementById("profileModal").classList.add("hidden");
});

document.getElementById("btnCancelProfile").addEventListener("click", () => document.getElementById("profileModal").classList.add("hidden"));
document.getElementById("btnCloseFriend").addEventListener("click", () => document.getElementById("friendModal").classList.add("hidden"));
document.getElementById("btnInviteFriend").addEventListener("click", () => {
  alert("Invitation envoyée !");
  document.getElementById("friendModal").classList.add("hidden");
});

document.getElementById("btnOpenQuests").addEventListener("click", () => { renderQuests(); document.getElementById("questsModal").classList.remove("hidden"); });
document.getElementById("btnOpenPlus").addEventListener("click", () => { renderQuests(); document.getElementById("questsModal").classList.remove("hidden"); });
document.getElementById("btnCloseQuests").addEventListener("click", () => document.getElementById("questsModal").classList.add("hidden"));
document.getElementById("btnEnablePlus").addEventListener("click", () => {
  state.profile.plus = true;
  persistProfile();
  renderDock();
  alert("Game Visio Plus activé !");
});

renderDock();
renderFriends();
renderMessages();
