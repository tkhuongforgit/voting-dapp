# BlockVote - DApp Bo phieu Phi tap trung

Do an mon **Blockchain can ban** - Truong Dai hoc Ky thuat Cong nghe Can Tho (CTUT).

Ung dung bo phieu phi tap trung tren blockchain Ethereum. Nguoi dung ket noi vi MetaMask, xem danh sach ung vien va bo phieu. Moi vi chi duoc bo phieu 1 lan. Ket qua luu tren blockchain, minh bach va bat bien.

## Cong nghe

| Thanh phan | Cong nghe |
|---|---|
| Smart contract | Solidity ^0.8.20 |
| Framework | Hardhat |
| Mang test | Sepolia testnet |
| Frontend | HTML + CSS + JS |
| Thu vien Web3 | ethers.js v6 (CDN) |
| Vi | MetaMask |

## Cai dat va chay

```bash
git clone https://github.com/tkhuongforgit/voting-dapp.git
cd voting-dapp
npm install
npx hardhat compile
npx hardhat test
```

### Chay local

```bash
npx hardhat node                                          # Terminal 1
npx hardhat run scripts/deploy.js --network localhost     # Terminal 2
npx http-server frontend -p 5500 -c-1                    # Terminal 3
```

Mo trinh duyet: http://localhost:5500

### Deploy len Sepolia

```bash
cp .env.example .env    # Dien SEPOLIA_RPC_URL va PRIVATE_KEY
npx hardhat run scripts/deploy.js --network sepolia
```

> **PRIVATE_KEY** la chia khoa dieu khien tai san vi. **KHONG BAO GIO** commit file `.env` len GitHub.

## Contract da deploy

> **Sepolia:** `0xef270c61e5ADE805BEC1B2c9fEB5Cd8bb814336B`
>
> Etherscan: https://sepolia.etherscan.io/address/0xef270c61e5ADE805BEC1B2c9fEB5Cd8bb814336B

## Anh demo

| Trang chinh | Khu vuc Owner | Etherscan |
|---|---|---|
| ![main](docs/screenshot-main.png) | ![admin](docs/screenshot-admin.png) | ![etherscan](docs/screenshot-etherscan.png) |

## Cau truc thu muc

```
voting-dapp/
├── contracts/Voting.sol        # Smart contract
├── scripts/deploy.js           # Script deploy + xuat ABI
├── test/Voting.test.js         # Unit test
├── frontend/
│   ├── index.html              # Giao dien
│   ├── style.css               # CSS
│   ├── loading.css             # Hieu ung loading
│   ├── app.js                  # Logic frontend
│   └── contract.js             # Dia chi + ABI (tu sinh)
├── hardhat.config.js
├── package.json
├── .env.example
└── README.md
```

## Thanh vien nhom

| STT | Ho ten | MSSV | GitHub | Vai tro |
|-----|--------|------|--------|---------|
| 1 | Nguyen Dau Tue Khuong | 2311020 | [@tkhuongforgit](https://github.com/tkhuongforgit) | Smart contract, deploy, backend |
| 2 | Le Ho Quang Thong | 2311008 | [@Thonghttt2311008](https://github.com/Thonghttt2311008) | Frontend UI/UX |
| 3 | Kha Minh Khang | 2311063 | [@kmkhang](https://github.com/kmkhang) | Tai lieu, test, demo |

Do an mon **Blockchain can ban** - CTUT.
