import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("\n🚀 Deploying AcaWise to Mantle Sepolia Testnet...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "MNT");

  if (balance === 0n) {
    console.log("\n❌ ERROR: No MNT tokens!");
    console.log("👉 Get test tokens from: https://faucet.sepolia.mantle.xyz/");
    process.exit(1);
  }

  console.log("\n⏳ Deploying AcaWise contract...");

  const AcaWise = await ethers.getContractFactory("AcaWise");
  const acawise = await AcaWise.deploy();

  await acawise.waitForDeployment();
  const address = await acawise.getAddress();

  console.log("\n✅ AcaWise deployed to:", address);
  console.log("🔗 View on explorer: https://explorer.sepolia.mantle.xyz/address/" + address);

  console.log("\n⏳ Waiting for block confirmations...");
  await acawise.deploymentTransaction()?.wait(3);
  console.log("✅ Confirmed!");

  // Save deployment info
  const deployment = {
    network: "Mantle Sepolia Testnet",
    contractAddress: address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    chainId: 5003,
    explorerUrl: "https://explorer.sepolia.mantle.xyz/address/" + address,
  };

  fs.writeFileSync("deployment.json", JSON.stringify(deployment, null, 2));
  console.log("\n💾 Deployment info saved to deployment.json");

  // Save ABI for backend
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/AcaWise.sol/AcaWise.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const backendPath = path.join(__dirname, "../../backend");
  if (fs.existsSync(backendPath)) {
    fs.writeFileSync(
      path.join(backendPath, "contract_abi.json"),
      JSON.stringify(artifact.abi, null, 2)
    );
    console.log("📄 ABI saved to backend/contract_abi.json");
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Details:");
  console.log("   Address:", address);
  console.log("   Network: Mantle Sepolia Testnet");
  console.log("   Chain ID: 5003");
  console.log("\n📝 Next Steps:");
  console.log("1. Add to backend/.env:");
  console.log("   CONTRACT_ADDRESS=" + address);
  console.log("   RPC_URL=https://rpc.sepolia.mantle.xyz");
  console.log("   BLOCKCHAIN_PRIVATE_KEY=<your_private_key>");
  console.log("\n2. Install Python dependencies:");
  console.log("   cd backend && pip install web3 eth-account");
  console.log("\n3. Add blockchain_service.py to backend");
  console.log("\n4. Update api_server.py to use blockchain");
  console.log("\n🔗 View on Mantle Explorer:");
  console.log("   https://explorer.sepolia.mantle.xyz/address/" + address);
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });