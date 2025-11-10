import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contract...");
  const attendance = await ethers.deployContract("Attendance");
  await attendance.waitForDeployment();
  console.log("Attendance contract deployed to:", await attendance.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
