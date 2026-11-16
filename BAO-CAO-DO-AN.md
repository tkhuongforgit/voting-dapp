# BAO CAO DO AN: BLOCKVOTE - DAPP BO PHIEU PHI TAP TRUNG

**Mon hoc:** Blockchain can ban
**Truong:** Dai hoc Ky thuat Cong nghe Can Tho (CTUT)
**Nhom:** 3 thanh vien
**GitHub:** https://github.com/tkhuongforgit/voting-dapp
**Contract Sepolia:** 0xef270c61e5ADE805BEC1B2c9fEB5Cd8bb814336B
**Etherscan:** https://sepolia.etherscan.io/address/0xef270c61e5ADE805BEC1B2c9fEB5Cd8bb814336B

---

## PHAN 1: TONG QUAN DO AN

### 1.1 Mo ta

BlockVote la ung dung bo phieu phi tap trung (Decentralized Voting Application) xay dung tren blockchain Ethereum. Nguoi dung ket noi vi MetaMask, xem danh sach ung vien va bo phieu cho ung vien minh chon. Moi dia chi vi chi duoc bo phieu 1 lan. Ket qua duoc luu truc tiep tren blockchain — minh bach, bat bien, chong gian lan.

### 1.2 Muc tieu

- Xay dung smart contract quan ly bo phieu tren Solidity
- Tao giao dien web tuong tac voi blockchain qua ethers.js va MetaMask
- Deploy contract len mang testnet Sepolia
- Dam bao tinh minh bach: moi nguoi deu co the xac minh ket qua tren Etherscan
- Dam bao tinh bao mat: chi owner quan ly, moi vi chi bau 1 lan

### 1.3 Cong nghe su dung

| Thanh phan       | Cong nghe              | Muc dich                              |
|------------------|------------------------|---------------------------------------|
| Smart contract   | Solidity ^0.8.20       | Viet logic bo phieu tren blockchain   |
| Framework        | Hardhat                | Compile, test, deploy smart contract  |
| Mang blockchain  | Ethereum Sepolia       | Mang testnet de deploy va thu nghiem  |
| Frontend         | HTML + CSS + JS thuan  | Giao dien nguoi dung                  |
| Thu vien Web3    | ethers.js v6 (CDN)     | Ket noi frontend voi blockchain       |
| Vi dien tu       | MetaMask               | Ky giao dich, xac thuc nguoi dung    |
| RPC Provider     | Alchemy                | Truy cap node Ethereum Sepolia        |
| Test framework   | Mocha + Chai           | Viet va chay unit test                |
| HTTP Server      | http-server (npx)      | Serve frontend tren localhost         |
| Version control  | Git + GitHub           | Quan ly source code va hop tac nhom   |

---

## PHAN 2: CHUC NANG CUA TRANG WEB

### 2.1 Chuc nang nguoi dung (voter)

| STT | Chuc nang                    | Mo ta                                                        |
|-----|------------------------------|--------------------------------------------------------------|
| 1   | Ket noi vi MetaMask          | Bam nut "Ket noi vi", MetaMask popup yeu cau cap quyen       |
| 2   | Xem danh sach ung vien       | Hien thi ten, so phieu, progress bar ty le phieu             |
| 3   | Bo phieu                     | Chon ung vien, ky giao dich qua MetaMask, 1 vi = 1 phieu    |
| 4   | Xem trang thai phien         | Hien thi "Dang mo" hoac "Da dong"                            |
| 5   | Xem dia chi contract         | Hien thi dia chi contract dang ket noi                       |
| 6   | Xem mang hien tai            | Hien thi ten mang va chainId                                 |
| 7   | Thong bao toast              | Hien thong bao thanh cong/that bai/canh bao                  |
| 8   | Tu dong cap nhat             | Lang nghe event tren blockchain, cap nhat UI realtime         |

### 2.2 Chuc nang admin (owner - nguoi deploy contract)

| STT | Chuc nang              | Mo ta                                                          |
|-----|------------------------|----------------------------------------------------------------|
| 1   | Them ung vien          | Nhap ten, gui giao dich addCandidate() len blockchain          |
| 2   | Mo phien bo phieu      | Goi startVoting(), can it nhat 2 ung vien                      |
| 3   | Dong phien bo phieu    | Goi endVoting(), khong ai co the bo phieu sau khi dong         |

*Khu vuc admin chi hien thi khi nguoi ket noi vi la owner (nguoi da deploy contract).*

### 2.3 Chuc nang bao mat cua smart contract

| STT | Co che bao mat                              | Cach thuc hien                          |
|-----|---------------------------------------------|-----------------------------------------|
| 1   | Chi owner moi them ung vien                 | Modifier onlyOwner                      |
| 2   | Moi vi chi bau 1 lan                        | mapping(address => bool) hasVoted       |
| 3   | Khong the bau khi phien dong                | Modifier whenVotingOpen                 |
| 4   | Khong the them ung vien khi phien dang mo   | Modifier whenVotingClosed               |
| 5   | Kiem tra id ung vien hop le                 | require(candidateId > 0 && <= count)    |
| 6   | Ten ung vien khong duoc rong                | require(bytes(name).length > 0)         |
| 7   | Can it nhat 2 ung vien de mo phien          | require(candidatesCount >= 2)           |

---

## PHAN 3: CAU TRUC SMART CONTRACT (Voting.sol)

### 3.1 Kieu du lieu

```
struct Candidate {
    uint256 id;         // Ma dinh danh (tu tang tu 1)
    string name;        // Ten hien thi
    uint256 voteCount;  // Tong so phieu nhan duoc
}
```

### 3.2 Bien trang thai

| Bien             | Kieu                          | Mo ta                              |
|------------------|-------------------------------|------------------------------------|
| owner            | address public                | Dia chi nguoi deploy (quan tri)    |
| votingOpen       | bool public                   | Trang thai phien: true/false       |
| candidatesCount  | uint256 public                | Tong so ung vien                   |
| candidates       | mapping(uint256 => Candidate) | Danh sach ung vien theo id         |
| hasVoted         | mapping(address => bool)      | Danh dau da bo phieu chua          |

### 3.3 Event

| Event            | Tham so                        | Khi nao emit                    |
|------------------|--------------------------------|---------------------------------|
| CandidateAdded   | id (indexed), name             | Khi them ung vien moi           |
| Voted            | voter (indexed), candidateId   | Khi co nguoi bo phieu           |
| VotingStarted    | timestamp                      | Khi owner mo phien              |
| VotingEnded      | timestamp                      | Khi owner dong phien            |

### 3.4 Modifier

| Modifier         | Dieu kien                    | Dung o dau                    |
|------------------|------------------------------|-------------------------------|
| onlyOwner        | msg.sender == owner          | addCandidate, start, end      |
| whenVotingOpen   | votingOpen == true           | vote                          |
| whenVotingClosed | votingOpen == false          | addCandidate                  |

### 3.5 Cac ham chinh

| Ham              | Loai     | Mo ta                                          |
|------------------|----------|-------------------------------------------------|
| constructor()    | Deploy   | Gan owner = nguoi deploy, votingOpen = false    |
| addCandidate()   | Write    | Them ung vien moi (chi owner, khi phien dong)   |
| vote()           | Write    | Bo phieu cho ung vien (1 lan duy nhat)          |
| startVoting()    | Write    | Mo phien (can >= 2 ung vien)                    |
| endVoting()      | Write    | Dong phien                                      |
| getCandidate()   | Read     | Lay thong tin 1 ung vien theo id                |
| getCandidates()  | Read     | Lay toan bo danh sach ung vien                  |

---

## PHAN 4: CAU TRUC DU AN

```
voting-dapp/
├── contracts/
│   └── Voting.sol              # Smart contract chinh
├── scripts/
│   └── deploy.js               # Script deploy + tu dong xuat ABI
├── test/
│   └── Voting.test.js          # 12 unit test cases
├── frontend/
│   ├── index.html              # Giao dien HTML
│   ├── style.css               # CSS dark theme
│   ├── loading.css             # Hieu ung loading spinner
│   ├── app.js                  # Logic frontend + ethers.js
│   └── contract.js             # Dia chi + ABI (tu dong sinh boi deploy.js)
├── docs/
│   ├── screenshot-main.png     # Anh demo trang chinh
│   ├── screenshot-admin.png    # Anh demo khu vuc admin
│   └── screenshot-etherscan.png # Anh Etherscan
├── hardhat.config.js           # Cau hinh Hardhat + mang
├── package.json                # Dependencies
├── .env.example                # Mau file bien moi truong
├── .gitignore                  # Loai tru .env, node_modules, artifacts
└── README.md                   # Tai lieu huong dan
```

---

## PHAN 5: KET QUA TEST

Tong cong **12 test cases**, tat ca **PASS**.

| STT | Test case                                              | Ket qua |
|-----|--------------------------------------------------------|---------|
| 1   | Dat dung owner va trang thai ban dau                   | PASS    |
| 2   | Owner co the them ung vien khi phien dong              | PASS    |
| 3   | Nguoi khong phai owner KHONG the them ung vien         | PASS    |
| 4   | Khong the mo phien khi co it hon 2 ung vien            | PASS    |
| 5   | Co the bo phieu khi phien mo va khong the bau 2 lan    | PASS    |
| 6   | Khong the bau khi phien chua mo hoac da dong           | PASS    |
| 7   | Chan id ung vien khong hop le                          | PASS    |
| 8   | Khong the them ung vien khi phien dang mo              | PASS    |
| 9   | getCandidates() tra ve danh sach day du                | PASS    |
| 10  | Owner co the mo va dong phien bo phieu                 | PASS    |
| 11  | Khong cho bo phieu voi id = 0                          | PASS    |
| 12  | Ten ung vien khong duoc rong                           | PASS    |

---

## PHAN 6: LUONG HOAT DONG

```
Nguoi dung mo web
    |
    v
Bam "Ket noi vi" --> MetaMask popup --> Cap quyen --> Hien dia chi vi
    |
    v
Frontend doc du lieu tu contract --> Hien danh sach ung vien + so phieu
    |
    v
Nguoi dung bam "Bo phieu" --> MetaMask popup ky giao dich
    |
    v
Giao dich gui len mang Sepolia --> Contract kiem tra dieu kien
    |
    v
Hop le: cong 1 phieu + emit event Voted --> Frontend lang nghe event --> Cap nhat UI
Khong hop le: revert voi thong bao loi --> Frontend hien toast loi
```

**Luong cua Owner:**
```
Owner ket noi vi --> Hien khu vuc Admin
    |
    v
Them ung vien (nhap ten, ky giao dich) --> Contract luu ung vien moi
    |
    v
Mo phien bo phieu (can >= 2 ung vien) --> Moi nguoi co the bau
    |
    v
Dong phien bo phieu --> Ket qua cuoi cung, khong ai bau them duoc
```

---

## PHAN 7: CONG VIEC CUA TUNG THANH VIEN

### 7.1 Nguyen Dau Tue Khuong (2311020) - Smart contract, Deploy, Backend

| STT | Cong viec                                                    |
|-----|--------------------------------------------------------------|
| 1   | Viet smart contract Voting.sol bang Solidity                 |
| 2   | Viet script deploy.js (tu dong xuat dia chi + ABI)          |
| 3   | Cau hinh Hardhat (hardhat.config.js) cho local va Sepolia   |
| 4   | Tao tai khoan Alchemy de lay RPC URL Sepolia                |
| 5   | Xin ETH testnet tu PoW Faucet                               |
| 6   | Deploy contract len mang Sepolia testnet                     |
| 7   | Viet logic frontend app.js (ket noi vi, bo phieu, admin)    |
| 8   | Tao GitHub repository, quan ly branch, review va merge PR   |
| 9   | Viet file .gitignore, .env.example                           |
| 10  | Viet 10 test cases ban dau                                   |

### 7.2 Le Ho Quang Thong (2311008) - Frontend UI/UX

| STT | Cong viec                                                    |
|-----|--------------------------------------------------------------|
| 1   | Cai thien giao dien style.css (hover effects, animations)   |
| 2   | Them progress bar hien thi ty le phieu bau                   |
| 3   | Them loading spinner (loading.css) cho hieu ung cho          |
| 4   | Them gradient cho tieu de BlockVote                          |
| 5   | Them tooltip khi hover vao card ung vien                     |
| 6   | Them favicon cho trang web                                   |
| 7   | Them meta description cho SEO                                |
| 8   | Tao branch feature/improve-ui va Pull Request #1             |

### 7.3 Kha Minh Khang (2311063) - Tai lieu, Test, Demo

| STT | Cong viec                                                    |
|-----|--------------------------------------------------------------|
| 1   | Bo sung 2 test cases moi (id = 0, ten rong)                 |
| 2   | Chup 3 anh demo (trang chinh, admin, Etherscan)             |
| 3   | Tao thu muc docs/ chua anh demo                              |
| 4   | Cap nhat README.md voi thong tin thanh vien nhom             |
| 5   | Viet lai README gon hon, ro rang hon                         |
| 6   | Tao branch feature/docs-and-tests va Pull Request #2         |

---

## PHAN 8: CAU HOI VAN DAP

### 8.1 Cau hoi chung (ca nhom)

**Q1: Tai sao chon blockchain de lam ung dung bo phieu?**
A: Vi blockchain dam bao tinh minh bach (ai cung xem duoc), bat bien (khong ai sua duoc ket qua), va phi tap trung (khong co ben thu 3 kiem soat). Rat phu hop voi bai toan bo phieu can su tin cay.

**Q2: Tai sao chon mang Sepolia ma khong phai Mainnet?**
A: Sepolia la testnet mien phi, co the xin ETH tu faucet de test. Mainnet can ETH that (ton tien). Doi voi do an hoc tap, testnet la du.

**Q3: Smart contract da deploy co sua duoc khong?**
A: Khong. Mot khi deploy len blockchain, code khong the thay doi. Day la tinh bat bien (immutability) cua blockchain. Muon sua phai deploy contract moi voi dia chi moi.

**Q4: Lam sao biet ai da bo phieu cho ai?**
A: Event Voted luu tren blockchain: dia chi nguoi bau + id ung vien. Ai cung co the xem tren Etherscan. Tuy nhien, danh tinh that ngoai doi cua dia chi vi thi khong biet (pseudonymous).

**Q5: Mot nguoi co the tao nhieu vi de bau nhieu lan khong?**
A: Co the, day la han che cua he thong hien tai (chua co whitelist). De khac phuc co the them co che xac minh danh tinh (KYC) hoac whitelist cac dia chi duoc phep bau.

**Q6: Gas fee la gi? Ai tra?**
A: Gas fee la phi xu ly giao dich tren Ethereum. Nguoi gui giao dich (nguoi bo phieu) tra gas fee bang ETH. Tren Sepolia dung ETH test mien phi.

### 8.2 Cau hoi cho Khuong (Smart contract + Backend)

**Q7: Giai thich modifier onlyOwner hoat dong nhu the nao?**
A: Modifier la doan code chay truoc ham chinh. onlyOwner kiem tra msg.sender == owner. Neu khong phai owner, require() se revert giao dich voi thong bao loi. Dau `_;` la cho noi code cua ham chinh duoc chay tiep.

**Q8: Tai sao dung mapping ma khong dung array cho candidates?**
A: Mapping truy cap theo key (O(1)), khong can duyet mang. Tuy nhien mapping khong the duyet tat ca, nen them ham getCandidates() tao array tam de tra ve cho frontend.

**Q9: Event dung de lam gi?**
A: Event la nhat ky ghi tren blockchain. Frontend lang nghe event de tu dong cap nhat UI ma khong can reload trang. Vi du khi co nguoi bo phieu, event Voted phat ra, frontend bat duoc va cap nhat so phieu ngay.

**Q10: Tai sao can modifier whenVotingClosed cho addCandidate?**
A: De dam bao cong bang. Neu cho them ung vien khi dang bo phieu, owner co the "chen" ung vien moi vao giua cuoc bau, lam anh huong ket qua.

**Q11: ethers.js v6 khac gi v5?**
A: v6 dung BrowserProvider thay vi Web3Provider. Cu phap gon hon, ho tro BigInt (n), va cach xu ly error tot hon. Vi du: `new ethers.BrowserProvider(window.ethereum)` thay vi `new ethers.providers.Web3Provider(window.ethereum)`.

**Q12: Script deploy.js lam gi sau khi deploy?**
A: Sau khi deploy, script tu dong ghi dia chi contract + ABI vao file frontend/contract.js. Frontend doc file nay de biet ket noi den contract nao. Khong can copy-paste thu cong.

**Q13: Giai thich require() trong Solidity.**
A: require(dieu_kien, "thong_bao") kiem tra dieu kien. Neu false, giao dich bi revert (huy), trang thai khong thay doi, gas con lai duoc tra ve. Dung de validate dau vao va kiem tra quyen.

**Q14: Constructor chay khi nao?**
A: Constructor chi chay DUY NHAT 1 LAN khi deploy contract. Sau do khong bao gio chay lai. Dung de khoi tao trang thai ban dau (gan owner, votingOpen = false).

### 8.3 Cau hoi cho Thong (Frontend UI/UX)

**Q15: Lam sao ket noi frontend voi MetaMask?**
A: Dung ethers.js goi `window.ethereum` (doi tuong MetaMask inject vao trinh duyet). Goi `eth_requestAccounts` de yeu cau nguoi dung cap quyen. Sau do tao BrowserProvider va Signer de ky giao dich.

**Q16: Progress bar tinh ty le nhu the nao?**
A: Tinh tong phieu tat ca ung vien (totalVotes). Moi ung vien co ty le = voteCount / totalVotes * 100. Dung CSS width: X% de hien thi thanh.

**Q17: Tai sao can http-server ma khong mo file HTML truc tiep?**
A: MetaMask yeu cau trang web chay tren giao thuc http:// hoac https://. Mo file truc tiep (file://) se bi MetaMask tu choi ket noi vi ly do bao mat.

**Q18: Hieu ung hover va transition lam gi?**
A: Tao trai nghiem nguoi dung tot hon. Khi hover vao card, card nang len (translateY) va co bong (box-shadow). Transition lam chuyen dong muot, khong giat.

**Q19: Tai sao dung CSS variables (--primary, --bg, ...)?**
A: De thay doi mau sac toan bo trang web chi can sua 1 cho (o :root). Cung de dang them dark/light mode sau nay.

**Q20: Loading spinner CSS hoat dong nhu the nao?**
A: Dung animation @keyframes spin quay tu 0 den 360 do lien tuc. Border 3 mat trong suot, 1 mat co mau tao hieu ung quay tron.

### 8.4 Cau hoi cho Khang (Tai lieu, Test, Demo)

**Q21: Tai sao can viet unit test?**
A: De dam bao smart contract hoat dong dung truoc khi deploy len blockchain. Vi contract khong sua duoc sau deploy, test la buoc bat buoc de phat hien loi som.

**Q22: beforeEach() trong test dung de lam gi?**
A: beforeEach() chay truoc MOI test case. No deploy 1 contract moi, dam bao moi test doc lap, khong anh huong lan nhau. Tuong tu nhu "reset" trang thai truoc moi bai test.

**Q23: Giai thich "revertedWith" trong test.**
A: revertedWith kiem tra giao dich co bi revert voi thong bao loi cu the khong. Vi du: expect(...).to.be.revertedWith("Ban da bo phieu roi") kiem tra giao dich bi tu choi dung voi thong bao do.

**Q24: Test case "id = 0" kiem tra gi?**
A: Kiem tra rang nguoi dung khong the bo phieu cho ung vien co id = 0 (id bat dau tu 1). Day la kiem tra boundary/edge case de dam bao contract khong co lo hong.

**Q25: Etherscan dung de lam gi?**
A: Etherscan la block explorer — cong cu xem thong tin tren blockchain. Co the xem: code contract, danh sach giao dich, ai da bo phieu, so du ETH, event logs. Dung de xac minh tinh minh bach.

**Q26: Pull Request (PR) la gi va tai sao can?**
A: PR la yeu cau merge code tu branch nay sang branch khac tren GitHub. Owner review code truoc khi merge. PR giup: code review, ghi nhan dong gop cua tung nguoi, giu branch main luon on dinh.

---

## PHAN 9: QUY TRINH TRINH BAY SAN PHAM VOI GIANG VIEN

### 9.1 Chuan bi truoc khi trinh bay

| STT | Viec can lam                                    | Ai chuan bi    |
|-----|-------------------------------------------------|----------------|
| 1   | Cai MetaMask tren trinh duyet (Brave/Chrome)    | Khuong         |
| 2   | Chuyen MetaMask sang mang Sepolia               | Khuong         |
| 3   | Dam bao co ETH test trong vi (xin tu faucet)    | Khuong         |
| 4   | Mo san terminal tai thu muc du an               | Khuong         |
| 5   | Mo san tab GitHub repo                          | Thong          |
| 6   | Mo san tab Etherscan cua contract               | Khang          |
| 7   | Chuan bi file bao cao (file nay)                | Khang          |

### 9.2 Trinh tu trinh bay (khoang 15-20 phut)

**BUOC 1: GIOI THIEU (2 phut) — Ca nhom**

- Gioi thieu ten do an: BlockVote — DApp Bo phieu Phi tap trung
- Gioi thieu thanh vien nhom va vai tro
- Mo ta van de: bo phieu truyen thong co the bi gian lan, ket qua khong minh bach
- Giai phap: dung blockchain dam bao minh bach, bat bien, phi tap trung

**BUOC 2: DEMO TRANG WEB (5-7 phut) — Khuong trinh bay**

1. Mo terminal, chay server:
   ```
   cd C:\laragon\www\voting-dapp\voting-dapp
   npx http-server frontend -p 5500 -c-1
   ```

2. Mo trinh duyet vao http://localhost:5500
   - Chi cho giang vien thay giao dien trang chinh (dark theme, danh sach ung vien)

3. Bam "Ket noi vi" — MetaMask popup hien len
   - Giai thich: MetaMask la vi dien tu, dung de ky giao dich tren blockchain

4. Sau khi ket noi:
   - Chi dia chi vi da rut gon tren goc phai
   - Chi trang thai phien (Dang mo / Da dong)
   - Chi dia chi contract

5. Demo chuc nang Owner (vi Khuong la owner):
   - Them 2 ung vien moi (vi du: "Ung vien A", "Ung vien B")
   - Mo phien bo phieu — giai thich can it nhat 2 ung vien
   - MetaMask popup ky giao dich moi lan

6. Demo bo phieu:
   - Bam "Bo phieu" cho 1 ung vien
   - MetaMask popup ky giao dich
   - Cho giao dich xac nhan — so phieu tang len
   - Chi progress bar ty le phieu
   - Bam bo phieu lan 2 — hien loi "Ban da bo phieu roi" (1 vi = 1 phieu)

7. Dong phien bo phieu — khong ai bau them duoc

**BUOC 3: XAC MINH TREN ETHERSCAN (2 phut) — Khang trinh bay**

1. Mo Etherscan: https://sepolia.etherscan.io/address/0xef270c61e5ADE805BEC1B2c9fEB5Cd8bb814336B
2. Chi cho giang vien thay:
   - Danh sach giao dich (transactions) — moi lan them ung vien, bo phieu deu la 1 giao dich
   - Event logs — ghi lai ai bo phieu cho ai
   - Contract code (neu da verify)
3. Giai thich: bat ky ai cung co the xac minh ket qua tren Etherscan — day la tinh minh bach cua blockchain

**BUOC 4: GIAI THICH CODE (3-4 phut) — Chia theo tung nguoi**

*Khuong giai thich Smart Contract:*
- Mo file Voting.sol — chi struct Candidate, mapping, modifier
- Giai thich luong: addCandidate -> startVoting -> vote -> endVoting
- Nhan manh cac co che bao mat: onlyOwner, hasVoted, whenVotingOpen

*Thong giai thich Frontend:*
- Mo file app.js — chi ham connectWallet(), refreshCandidates()
- Giai thich cach dung ethers.js ket noi voi smart contract
- Chi style.css — dark theme, progress bar, hover effects

*Khang giai thich Test:*
- Mo file Voting.test.js — chi 12 test cases
- Chay `npx hardhat test` cho giang vien thay 12/12 PASS
- Giai thich beforeEach() va revertedWith

**BUOC 5: GITHUB VA DONG GOP NHOM (2 phut) — Thong trinh bay**

1. Mo GitHub repo: https://github.com/tkhuongforgit/voting-dapp
2. Chi tab Insights > Contributors — 3 nguoi deu co dong gop
3. Chi tab Pull Requests (Closed) — 2 PR da merge
4. Chi commit history — moi nguoi co commit rieng

**BUOC 6: KET LUAN VA TRA LOI CAU HOI (3-5 phut) — Ca nhom**

- Tom tat ket qua dat duoc
- Neu han che va huong phat trien
- Tra loi cau hoi cua giang vien (xem Phan 8 — Cau hoi van dap)

### 9.3 Luu y khi trinh bay

- Tat ca thanh vien deu phai noi, khong de 1 nguoi noi het
- Moi nguoi giai thich phan minh lam — giang vien co the hoi bat ky ai
- Neu giang vien hoi cau ngoai danh sach, binh tinh tra loi theo hieu biet
- Neu khong biet, noi "Em chua tim hieu phan nay, se nghien cuu them"
- Khong doc bao cao, hay giai thich bang loi cua minh
- Demo truc tiep tren may, khong dung slide/video

### 9.4 Checklist truoc khi trinh bay

- [ ] MetaMask da cai va dang nhap
- [ ] MetaMask dang o mang Sepolia
- [ ] Co ETH test trong vi (it nhat 0.01 ETH)
- [ ] Terminal san sang chay http-server
- [ ] Trinh duyet mo san localhost:5500
- [ ] Tab Etherscan mo san
- [ ] Tab GitHub mo san
- [ ] File bao cao in ra hoac mo san tren may
- [ ] Tat cac thong bao, ung dung khong lien quan

---

## PHAN 10: HUONG PHAT TRIEN

| STT | Chuc nang                          | Mo ta                                               |
|-----|------------------------------------|------------------------------------------------------|
| 1   | Whitelist cu tri                   | Chi cac dia chi duoc phep moi co the bo phieu        |
| 2   | Gioi han thoi gian phien           | Them startTime va endTime tu dong dong phien          |
| 3   | Factory pattern                    | 1 contract Factory tao nhieu cuoc bau cu              |
| 4   | Bieu do truc quan                  | Dung Chart.js hien thi ket qua dang bieu do           |
| 5   | Dark/Light mode toggle             | Cho nguoi dung chon giao dien sang/toi                |
| 6   | IPFS cho metadata                  | Luu anh dai dien, mo ta ung vien tren IPFS            |
| 7   | zk-SNARK                          | Bo phieu an danh (zero-knowledge proof)               |
| 8   | Multi-language                     | Ho tro tieng Anh va tieng Viet                        |

---

## PHAN 11: THONG TIN NHOM

| STT | Ho ten                 | MSSV    | GitHub            | Vai tro                         |
|-----|------------------------|---------|-------------------|----------------------------------|
| 1   | Nguyen Dau Tue Khuong  | 2311020 | @tkhuongforgit    | Smart contract, deploy, backend  |
| 2   | Le Ho Quang Thong      | 2311008 | @Thonghttt2311008 | Frontend UI/UX                   |
| 3   | Kha Minh Khang         | 2311063 | @kmkhang          | Tai lieu, test, demo             |

**Do an mon Blockchain can ban - Truong Dai hoc Ky thuat Cong nghe Can Tho (CTUT)**
