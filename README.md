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
| 1 | Nguyen Dau Tue Khuong | 2311020 | [@tkhuongforgit](https://github.com/tkhuongforgit) | Smart contract, deploy, backend |
| 2 | Le Ho Quang Thong | 2311008 | [@Thonghttt2311008](https://github.com/Thonghttt2311008) | Frontend UI/UX |
| 3 | Kha Minh Khang | 2311063 | [@kmkhang](https://github.com/kmkhang) | Tài liệu, test, demo |

Đồ án môn Blockchain căn bản - CTUT
