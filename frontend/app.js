// ============================================================
// BlockVote - Frontend logic
// ethers.js v6 (CDN)
// ============================================================

const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111

let provider = null;
let signer = null;
let contract = null;
let currentAccount = null;
let ownerAddress = null;
let pendingVoteId = null;

// ---------- Tiện ích ----------
function toast(msg, type = "info") {
  const el = document.getElementById("toast");
  el.className = "toast " + type;
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.add("hidden"), 4000);
}

function short(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}

function showLoading(text) {
  document.getElementById("loadingText").textContent = text;
  document.getElementById("loadingOverlay").classList.remove("hidden");
}

function hideLoading() {
  document.getElementById("loadingOverlay").classList.add("hidden");
}

// ---------- Confetti ----------
function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");
  const colors = ["#6366f1", "#818cf8", "#fbbf24", "#10b981", "#ef4444", "#ec4899", "#f59e0b"];
  const pieces = [];
  for (let i = 0; i < 120; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 2,
      rot: Math.random() * 360,
      rv: (Math.random() - 0.5) * 8
    });
  }
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rv;
      p.vy += 0.05;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    frame++;
    if (frame < 180) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}

// ---------- Confirm modal ----------
function showConfirmModal(candidateName, candidateId) {
  pendingVoteId = candidateId;
  document.getElementById("confirmName").textContent = candidateName;
  document.getElementById("confirmModal").classList.remove("hidden");
}

function hideConfirmModal() {
  document.getElementById("confirmModal").classList.add("hidden");
  pendingVoteId = null;
}

// ---------- Copy to clipboard ----------
function copyContractAddress() {
  if (!window.CONTRACT_ADDRESS) return;
  navigator.clipboard.writeText(window.CONTRACT_ADDRESS).then(() => {
    toast("Đã copy địa chỉ contract!", "success");
  }).catch(() => {
    toast(window.CONTRACT_ADDRESS, "info");
  });
}

// ---------- Etherscan link ----------
function setupEtherscanLink(chainId) {
  const el = document.getElementById("etherscanLink");
  const a = document.getElementById("etherscanUrl");
  if (!el || !a || !window.CONTRACT_ADDRESS) return;
  let base = "";
  if (chainId === 11155111n) base = "https://sepolia.etherscan.io";
  else if (chainId === 1n) base = "https://etherscan.io";
  if (base) {
    a.href = base + "/address/" + window.CONTRACT_ADDRESS;
    el.classList.remove("hidden");
  }
}

// ---------- Scroll to top ----------
function setupScrollTop() {
  const btn = document.getElementById("scrollTopBtn");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 300);
  });
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ---------- Kết nối ví ----------
async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    toast("Vui lòng cài đặt MetaMask để sử dụng ứng dụng.", "error");
    return;
  }

  try {
    showLoading("Đang kết nối ví...");
    provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    currentAccount = accounts[0];
    signer = await provider.getSigner();

    const network = await provider.getNetwork();
    document.getElementById("networkName").textContent =
      `${network.name} (${network.chainId})`;

    if (network.chainId !== 11155111n && network.chainId !== 31337n) {
      toast("Hãy chuyển MetaMask sang mạng Sepolia hoặc Localhost.", "warn");
    }

    if (!window.CONTRACT_ADDRESS || !window.CONTRACT_ABI) {
      toast("Chưa tìm thấy contract.js (chạy script deploy trước).", "error");
      hideLoading();
      return;
    }

    contract = new ethers.Contract(window.CONTRACT_ADDRESS, window.CONTRACT_ABI, signer);
    document.getElementById("contractAddr").textContent = short(window.CONTRACT_ADDRESS);

    document.getElementById("account").textContent = short(currentAccount);
    document.getElementById("account").classList.remove("hidden");
    document.getElementById("connectBtn").innerHTML = '<span class="wallet-icon">🦊</span> Đã kết nối';

    ownerAddress = await contract.owner();
    const isOwner = ownerAddress.toLowerCase() === currentAccount.toLowerCase();
    if (isOwner) {
      document.getElementById("adminPanel").classList.remove("hidden");
      document.getElementById("ownerBadge").classList.remove("hidden");
    }

    // Ẩn hero, hiện stats
    document.getElementById("heroSection").classList.add("hidden");
    document.getElementById("statsBar").classList.remove("hidden");

    // Etherscan link
    setupEtherscanLink(network.chainId);

    await refreshAll();
    attachContractListeners();

    window.ethereum.on("accountsChanged", () => window.location.reload());
    window.ethereum.on("chainChanged", () => window.location.reload());

    hideLoading();
    toast("Kết nối ví thành công!", "success");
  } catch (err) {
    hideLoading();
    console.error(err);
    toast(err?.info?.error?.message || err?.message || "Không kết nối được ví.", "error");
  }
}

// ---------- Event listeners ----------
function attachContractListeners() {
  if (!contract) return;
  contract.on("Voted", () => refreshCandidates());
  contract.on("CandidateAdded", () => refreshCandidates());
  contract.on("VotingStarted", () => refreshAll());
  contract.on("VotingEnded", () => refreshAll());
}

// ---------- Trạng thái ----------
async function refreshStatus() {
  if (!contract) return;
  const isOpen = await contract.votingOpen();
  const badge = document.getElementById("votingStatus");
  if (isOpen) {
    badge.textContent = "🟢 Đang mở";
    badge.className = "badge badge-open";
  } else {
    badge.textContent = "🔴 Đã đóng";
    badge.className = "badge badge-closed";
  }
}

// ---------- Danh sách ứng viên ----------
async function refreshCandidates() {
  if (!contract) return;
  const list = document.getElementById("candidatesList");
  list.innerHTML = "";

  const candidates = await contract.getCandidates();
  const count = candidates.length;

  document.getElementById("statCandidates").textContent = count;
  const countEl = document.getElementById("candidateCount");
  countEl.textContent = `${count} ứng viên`;
  countEl.classList.remove("hidden");

  if (count === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📭</span>
        <p>Chưa có ứng viên nào.</p>
        <p class="empty-hint">Owner hãy thêm ứng viên qua khu vực quản trị ở trên</p>
      </div>`;
    document.getElementById("statTotalVotes").textContent = "0";
    document.getElementById("winnerBanner").classList.add("hidden");
    return;
  }

  const alreadyVoted = await contract.hasVoted(currentAccount);
  const isOpen = await contract.votingOpen();
  const totalVotes = candidates.reduce((sum, c) => sum + Number(c.voteCount), 0);
  document.getElementById("statTotalVotes").textContent = totalVotes;

  let maxVotes = 0;
  let leaderIndex = -1;
  for (let i = 0; i < candidates.length; i++) {
    const v = Number(candidates[i].voteCount);
    if (v > maxVotes) {
      maxVotes = v;
      leaderIndex = i;
    }
  }

  const sorted = candidates.map((c, i) => ({ ...c, origIndex: i }));
  sorted.sort((a, b) => Number(b.voteCount) - Number(a.voteCount));

  // Winner banner + fill bar
  const winnerBanner = document.getElementById("winnerBanner");
  if (totalVotes > 0 && leaderIndex >= 0) {
    const pct = (maxVotes / totalVotes * 100).toFixed(1);
    document.getElementById("winnerName").textContent = candidates[leaderIndex].name;
    document.getElementById("winnerVotes").textContent = `${maxVotes} phiếu (${pct}%)`;
    const fill = document.getElementById("winnerFill");
    if (fill) fill.style.width = pct + "%";
    winnerBanner.classList.remove("hidden");
  } else {
    winnerBanner.classList.add("hidden");
  }

  // Render cards
  const rankMedals = ['🥇', '🥈', '🥉'];
  const avatarColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'];

  for (let i = 0; i < sorted.length; i++) {
    const c = sorted[i];
    const votes = Number(c.voteCount);
    const percent = totalVotes > 0 ? (votes / totalVotes * 100) : 0;
    const isLeader = totalVotes > 0 && votes === maxVotes && votes > 0;

    const card = document.createElement("div");
    card.className = "card" + (isLeader ? " is-leader" : "");
    card.style.animationDelay = `${i * 0.08}s`;

    const medal = (totalVotes > 0 && i < 3 && votes > 0) ? rankMedals[i] : '';
    const initial = c.name.charAt(0).toUpperCase();
    const avatarColor = avatarColors[i % avatarColors.length];

    card.innerHTML = `
      ${medal ? `<span class="card-rank">${medal}</span>` : ''}
      <div class="name">
        <span class="avatar" style="background:${avatarColor};width:32px;height:32px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff;flex-shrink:0">${initial}</span>
        ${escapeHtml(c.name)}
      </div>
      <div class="vote-info">
        <span class="count">${votes}</span>
        <span class="percent">${totalVotes > 0 ? percent.toFixed(1) + '%' : '—'}</span>
      </div>
      <div class="progress-bar"><div class="fill" style="width: ${percent.toFixed(1)}%"></div></div>
      <button class="btn primary vote-btn ${alreadyVoted ? 'voted' : ''}" data-id="${c.id}" data-name="${escapeHtml(c.name)}">
        ${alreadyVoted ? 'Bạn đã bầu' : '🗳️ Bỏ phiếu'}
      </button>
    `;

    const btn = card.querySelector(".vote-btn");
    btn.disabled = alreadyVoted || !isOpen;
    btn.addEventListener("click", () => {
      if (alreadyVoted || !isOpen) return;
      showConfirmModal(c.name, Number(c.id));
    });
    list.appendChild(card);
  }
}

async function refreshAll() {
  await refreshStatus();
  await refreshCandidates();
}

// ---------- Hành động ----------
async function castVote(id) {
  try {
    showLoading("Đang gửi phiếu bầu...");
    const tx = await contract.vote(id);
    document.getElementById("loadingText").textContent = "Đang chờ xác nhận trên blockchain...";
    await tx.wait();
    hideLoading();
    toast("🎉 Bỏ phiếu thành công!", "success");
    launchConfetti();
    refreshCandidates();
  } catch (err) {
    hideLoading();
    handleTxError(err);
  }
}

async function addCandidate() {
  const input = document.getElementById("newCandidateName");
  const name = input.value.trim();
  if (!name) return toast("Vui lòng nhập tên ứng viên.", "warn");
  try {
    showLoading("Đang thêm ứng viên...");
    const tx = await contract.addCandidate(name);
    document.getElementById("loadingText").textContent = "Đang chờ xác nhận...";
    await tx.wait();
    input.value = "";
    hideLoading();
    toast("✅ Đã thêm ứng viên: " + name, "success");
    refreshCandidates();
  } catch (err) {
    hideLoading();
    handleTxError(err);
  }
}

async function startVoting() {
  try {
    showLoading("Đang mở phiên bỏ phiếu...");
    const tx = await contract.startVoting();
    await tx.wait();
    hideLoading();
    toast("▶ Đã mở phiên bỏ phiếu!", "success");
    refreshAll();
  } catch (err) {
    hideLoading();
    handleTxError(err);
  }
}

async function endVoting() {
  try {
    showLoading("Đang đóng phiên bỏ phiếu...");
    const tx = await contract.endVoting();
    await tx.wait();
    hideLoading();
    toast("⏹ Đã đóng phiên bỏ phiếu!", "success");
    refreshAll();
  } catch (err) {
    hideLoading();
    handleTxError(err);
  }
}

function handleTxError(err) {
  console.error(err);
  const reason =
    err?.reason ||
    err?.info?.error?.message ||
    err?.shortMessage ||
    err?.message ||
    "Giao dịch thất bại.";
  toast(reason, "error");
}

// ---------- Khởi tạo ----------
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("connectBtn").addEventListener("click", connectWallet);
  document.getElementById("addCandidateBtn").addEventListener("click", addCandidate);
  document.getElementById("startBtn").addEventListener("click", startVoting);
  document.getElementById("endBtn").addEventListener("click", endVoting);

  // Enter để thêm ứng viên
  document.getElementById("newCandidateName").addEventListener("keydown", (e) => {
    if (e.key === "Enter") addCandidate();
  });

  // Confirm modal
  document.getElementById("confirmYes").addEventListener("click", () => {
    hideConfirmModal();
    if (pendingVoteId !== null) castVote(pendingVoteId);
  });
  document.getElementById("confirmNo").addEventListener("click", hideConfirmModal);

  // Copy contract address
  const contractLink = document.getElementById("contractLink");
  if (contractLink) contractLink.addEventListener("click", copyContractAddress);

  // Scroll to top
  setupScrollTop();

  if (window.CONTRACT_ADDRESS) {
    document.getElementById("contractAddr").textContent = short(window.CONTRACT_ADDRESS);
  }
  if (window.NETWORK_NAME) {
    document.getElementById("networkName").textContent = window.NETWORK_NAME;
  }
});
