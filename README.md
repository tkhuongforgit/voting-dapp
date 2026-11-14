# 🗳️ BlockVote – DApp Bỏ phiếu Phi tập trung

Đề tài môn **Blockchain căn bản**: xây dựng ứng dụng bỏ phiếu phi tập trung (Decentralized Voting Application) trên blockchain Ethereum, bảo đảm **minh bạch**, **bất biến** và **chống gian lận**.

## 📌 Mô tả ngắn

Người dùng kết nối ví **MetaMask**, xem danh sách ứng viên và bỏ phiếu cho ứng viên mình chọn. Mỗi địa chỉ ví **chỉ được bỏ phiếu 1 lần**. Kết quả được lưu trực tiếp trên blockchain – ai cũng có thể xác minh, không ai sửa được.

Chức năng chính:
- Kết nối ví MetaMask
- Xem danh sách ứng viên và số phiếu theo thời gian thực
- Bỏ phiếu (1 ví = 1 phiếu)
- Owner: thêm ứng viên, mở/đóng phiên bỏ phiếu
- Lắng nghe event để cập nhật UI tự động

## 🧰 Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Smart contract | Solidity `^0.8.20` |
| Framework | Hardhat |
| Mạng test | Sepolia testnet + Hardhat local |
| Frontend | HTML + CSS + JS thuần |
| Thư viện Web3 | ethers.js v6 (CDN) |
| Ví | MetaMask |

## 🔄 Luồng hoạt động

```
┌──────────┐    1. Kết nối     ┌──────────┐    2. Ký giao dịch     ┌───────────────┐
│ Người    │ ───────────────▶ │ MetaMask │ ────────────────────▶ │ Smart Contract │
│ dùng     │ ◀─────────────── │          │ ◀──────────────────── │  (Voting.sol)  │
└──────────┘    6. Cập nhật    └──────────┘   5. Trả kết quả      └───────┬───────┘
                                                                          │
                                                                          ▼
                                                               ┌──────────────────┐
                                                               │ Ethereum Sepolia │
                                                               │   Blockchain     │
                                                               └──────────────────┘
```

1. Người dùng mở website → bấm **Kết nối ví**
2. MetaMask yêu cầu cấp quyền → trả về địa chỉ ví
3. Frontend gọi `vote()` qua ethers.js → MetaMask hiển thị popup ký
4. Người dùng ký → giao dịch gửi lên mạng Sepolia
5. Contract kiểm tra điều kiện (chưa bầu, phiên đang mở, id hợp lệ) → cộng 1 phiếu → emit event `Voted`
6. Frontend lắng nghe event, cập nhật số phiếu trên UI

## 🚀 Cài đặt và chạy

### 1. Yêu cầu hệ thống
- Node.js ≥ 18
- npm hoặc yarn
- Trình duyệt có cài extension **MetaMask**

### 2. Clone & cài dependencies
```bash
git clone <URL_REPO_CỦA_BẠN>
cd voting-dapp
npm install
```

### 3. Compile smart contract
```bash
npx hardhat compile
```

### 4. Chạy test
```bash
npx hardhat test
```
Tất cả test case phải **pass** (xanh).

### 5. Chạy ở mạng local (nhanh, miễn phí)

**Terminal 1** – mở node Hardhat:
```bash
npx hardhat node
```

**Terminal 2** – deploy contract:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

Script sẽ tự động ghi địa chỉ contract + ABI vào `frontend/contract.js`.

**Mở frontend** – dùng bất kỳ server tĩnh nào (vì MetaMask yêu cầu origin `http://`):
```bash
# Cách 1: dùng http-server (cần cài sẵn hoặc npx)
npx http-server frontend -p 5500 -c-1

# Cách 2: dùng extension "Live Server" của VS Code
```
Mở trình duyệt: http://localhost:5500

**Trong MetaMask:**
- Thêm mạng Localhost: RPC `http://127.0.0.1:8545`, chainId `31337`
- Import account bằng private key mà `hardhat node` in ra ở terminal 1

### 6. Deploy lên Sepolia testnet

**Chuẩn bị:**
1. Tạo ví MetaMask mới (đừng dùng ví có tiền thật).
2. Xin RPC URL miễn phí tại [Alchemy](https://www.alchemy.com/) hoặc [Infura](https://www.infura.io/).
3. Xin ETH testnet từ faucet:
   - https://sepoliafaucet.com/
   - https://www.alchemy.com/faucets/ethereum-sepolia
   - https://cloud.google.com/application/web3/faucet/ethereum/sepolia

**Cấu hình:**
```bash
cp .env.example .env
# Mở .env, điền SEPOLIA_RPC_URL và PRIVATE_KEY
```

> ⚠️ **CẢNH BÁO**: `PRIVATE_KEY` là chìa khóa điều khiển tài sản ví. **KHÔNG BAO GIỜ** commit file `.env` lên GitHub. File `.gitignore` đã loại trừ sẵn `.env`.

**Deploy:**
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Sau khi deploy xong, chuyển MetaMask sang mạng Sepolia và mở frontend để thao tác.

## 📍 Địa chỉ contract đã deploy

> **Sepolia:** `0xef270c61e5ADE805BEC1B2c9fEB5Cd8bb814336B`
>
> Xem trên Etherscan: https://sepolia.etherscan.io/address/0xef270c61e5ADE805BEC1B2c9fEB5Cd8bb814336B

## 📸 Ảnh demo

<!-- Chèn ảnh chụp màn hình vào đây sau khi chạy xong -->
- Trang chính: `docs/screenshot-main.png`
- Khu vực Owner: `docs/screenshot-admin.png`
- Giao dịch trên Etherscan: `docs/screenshot-etherscan.png`

## 📂 Cấu trúc thư mục

```
voting-dapp/
├── contracts/
│   └── Voting.sol           # Smart contract chính
├── scripts/
│   └── deploy.js            # Script deploy + xuất ABI
├── test/
│   └── Voting.test.js       # Unit test
├── frontend/
│   ├── index.html           # Giao diện
│   ├── style.css            # CSS
│   ├── app.js               # Logic frontend + ethers.js
│   └── contract.js          # Địa chỉ + ABI (tự sinh)
├── hardhat.config.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## 🚧 Hạn chế & hướng phát triển

**Hạn chế hiện tại:**
- Chưa có cơ chế phân quyền cử tri (whitelist): bất kỳ ví nào cũng có thể bỏ phiếu.
- Chưa giới hạn thời gian phiên bỏ phiếu bằng block timestamp.
- Chưa hỗ trợ nhiều cuộc bầu cử song song (1 contract = 1 cuộc bầu).
- UI cơ bản, chưa có thống kê biểu đồ.

**Hướng phát triển:**
- Thêm whitelist cử tri (ví dụ merkle proof cho danh sách lớn).
- Thêm `startTime` và `endTime` cho phiên bỏ phiếu.
- Tách thành **Factory pattern**: 1 contract Factory tạo ra nhiều Election instance.
- Dùng IPFS lưu metadata ứng viên (ảnh đại diện, mô tả).
- Thêm biểu đồ trực quan (Chart.js).
- Tích hợp zk-SNARK để bỏ phiếu ẩn danh.

## 👥 Thành viên nhóm

| STT | Họ tên | MSSV | GitHub | Vai trò |
|-----|--------|------|--------|---------|
| 1 | Nguyen Duy Thanh Khuong | 2311020 | [@tkhuongforgit](https://github.com/tkhuongforgit) | Smart contract, deploy, backend |
| 2 | *(Họ tên bạn B)* | *(MSSV)* | [@github-ban-B](https://github.com/github-ban-B) | Frontend UI/UX |
| 3 | *(Họ tên bạn C)* | *(MSSV)* | [@github-ban-C](https://github.com/github-ban-C) | Tài liệu, test, demo |

Đồ án môn **Blockchain căn bản** - Trường Đại học Công nghệ Thông tin & Truyền thông.
