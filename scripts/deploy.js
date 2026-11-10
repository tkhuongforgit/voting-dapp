// Script deploy contract Voting và xuất địa chỉ + ABI vào frontend/contract.js
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploy bằng tài khoản:", deployer.address);

  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();
  await voting.waitForDeployment();

  const address = await voting.getAddress();
  console.log("Voting đã deploy tại:", address);

  // Đọc ABI từ artifacts
  const artifact = await hre.artifacts.readArtifact("Voting");

  // Ghi ra file để frontend dùng
  const outDir = path.join(__dirname, "..", "frontend");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const content =
    "// Tự động sinh bởi scripts/deploy.js – KHÔNG chỉnh thủ công\n" +
    `window.CONTRACT_ADDRESS = "${address}";\n` +
    `window.CONTRACT_ABI = ${JSON.stringify(artifact.abi, null, 2)};\n` +
    `window.NETWORK_NAME = "${hre.network.name}";\n`;

  fs.writeFileSync(path.join(outDir, "contract.js"), content);
  console.log("Đã ghi địa chỉ + ABI vào frontend/contract.js");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
