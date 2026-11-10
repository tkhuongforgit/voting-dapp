require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Đọc các biến môi trường; nếu thiếu thì dùng giá trị rỗng để tránh crash khi chỉ chạy local.
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    // Mạng Hardhat chạy nội bộ – dùng cho `hardhat test`
    hardhat: {},
    // Node local do `npx hardhat node` khởi chạy ở cổng 8545
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    // Mạng test Sepolia – cần RPC URL (Alchemy/Infura) và private key trong .env
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};
