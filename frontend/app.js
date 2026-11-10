// ============================================================
// BlockVote - Frontend logic
// Dùng ethers.js v6 (đã nạp qua CDN trong index.html)
// ============================================================

const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111

let provider = null;
let signer = null;
let contract = null;
let currentAccount = null;
let ownerAddress = null;

// ---------- Tiện ích hiển thị ----------
function toast(msg, type = "info") {
  const el = document.getElementById("toast");
  el.className = "toast " + type;
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.add("hidden"), 3500);
}

function short(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

// ---------- Kết nối ví ----------
async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    toast("Vui lòng cài đặt MetaMask để sử dụng ứng dụng.", "error");
    return;
  }

  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    currentAccount = accounts[0];
    signer = await provider.getSigner();

    const network = await provider.getNetwork();
    document.getElementById("networkName").textContent =
      `${network.name} (chainId ${network.chainId})`;

    // Cảnh báo nếu không phải Sepolia (bỏ qua local hardhat chainId 31337)
    if (network.chainId !== 11155111n && network.chainId !== 31337n) {
      toast("Hãy chuyển MetaMask sang mạng Sepolia hoặc Localhost.", "warn");
    }

    if (!window.CONTRACT_ADDRESS || !window.CONTRACT_ABI) {
      toast("Chưa tìm thấy contract.js (chạy script deploy trước).", "error");
      return;
    }

    contract = new ethers.Contract(window.CONTRACT_ADDRESS, window.CONTRACT_ABI, signer);
    document.getElementById("contractAddr").textContent = short(window.CONTRACT_ADDRESS);

    document.getElementById("account").textContent = short(currentAccount);
    document.getElementById("account").classList.remove("hidden");
    document.getElementById("connectBtn").textContent = "Đã kết nối";

    ownerAddress = await contract.owner();
    if (ownerAddress.toLowerCase() === currentAccount.toLowerCase()) {
      document.getElementById("adminPanel").classList.remove("hidden");
    }

    await refreshAll();
    attachContractListeners();

    // Lắng nghe đổi tài khoản / mạng
    window.ethereum.on("accountsChanged", () => window.location.reload());
    window.ethereum.on("chainChanged", () => window.location.reload());
  } catch (err) {
    console.error(err);
    toast(err?.info?.error?.message || err?.message || "Không kết nối được ví.", "error");
  }
}

// ---------- Lắng nghe event để auto refresh ----------
function attachContractListeners() {
  if (!contract) return;
  contract.on("Voted", () => refreshCandidates());
  contract.on("CandidateAdded", () => refreshCandidates());
  contract.on("VotingStarted", () => refreshStatus());
  contract.on("VotingEnded", () => refreshStatus());
}

// ---------- Trạng thái phiên ----------
async function refreshStatus() {
  if (!contract) return;
  const isOpen = await contract.votingOpen();
  const badge = document.getElementById("votingStatus");
  if (isOpen) {
    badge.textContent = "Đang mở";
    badge.className = "badge badge-open";
  } else {
    badge.textContent = "Đã đóng";
    badge.className = "badge badge-closed";
  }
}

// ---------- Danh sách ứng viên ----------
async function refreshCandidates() {
  if (!contract) return;
  const list = document.getElementById("candidatesList");
  list.innerHTML = "";

  const candidates = await contract.getCandidates();
  if (candidates.length === 0) {
    list.innerHTML = '<p class="empty">Chưa có ứng viên nào. Owner hãy thêm ứng viên.</p>';
    return;
  }

  const alreadyVoted = await contract.hasVoted(currentAccount);
  const isOpen = await contract.votingOpen();

  for (const c of candidates) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="name">${escapeHtml(c.name)}</div>
      <div class="votes">Số phiếu</div>
      <div class="count">${c.voteCount.toString()}</div>
      <button class="btn primary vote-btn" data-id="${c.id}">
        ${alreadyVoted ? "Bạn đã bầu" : "Bỏ phiếu"}
      </button>
    `;
    const btn = card.querySelector(".vote-btn");
    btn.disabled = alreadyVoted || !isOpen;
    btn.addEventListener("click", () => castVote(Number(c.id)));
    list.appendChild(card);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}

async function refreshAll() {
  await refreshStatus();
  await refreshCandidates();
}

// ---------- Hành động ----------
async function castVote(id) {
  try {
    toast("Đang gửi giao dịch bỏ phiếu…", "info");
    const tx = await contract.vote(id);
    await tx.wait();
    toast("Bỏ phiếu thành công!", "success");
    refreshCandidates();
  } catch (err) {
    handleTxError(err);
  }
}

async function addCandidate() {
  const input = document.getElementById("newCandidateName");
  const name = input.value.trim();
  if (!name) return toast("Vui lòng nhập tên ứng viên.", "warn");
  try {
    toast("Đang thêm ứng viên…", "info");
    const tx = await contract.addCandidate(name);
    await tx.wait();
    input.value = "";
    toast("Đã thêm ứng viên!", "success");
    refreshCandidates();
  } catch (err) {
    handleTxError(err);
  }
}

async function startVoting() {
  try {
    const tx = await contract.startVoting();
    await tx.wait();
    toast("Đã mở phiên bỏ phiếu!", "success");
    refreshAll();
  } catch (err) {
    handleTxError(err);
  }
}

async function endVoting() {
  try {
    const tx = await contract.endVoting();
    await tx.wait();
    toast("Đã đóng phiên bỏ phiếu!", "success");
    refreshAll();
  } catch (err) {
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

// ---------- Gắn sự kiện ----------
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("connectBtn").addEventListener("click", connectWallet);
  document.getElementById("addCandidateBtn").addEventListener("click", addCandidate);
  document.getElementById("startBtn").addEventListener("click", startVoting);
  document.getElementById("endBtn").addEventListener("click", endVoting);

  // Nếu đã có contract.js thì hiển thị địa chỉ ngay
  if (window.CONTRACT_ADDRESS) {
    document.getElementById("contractAddr").textContent = short(window.CONTRACT_ADDRESS);
  }
  if (window.NETWORK_NAME) {
    document.getElementById("networkName").textContent = window.NETWORK_NAME;
  }
});
