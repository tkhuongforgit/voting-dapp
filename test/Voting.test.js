const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
  let Voting, voting, owner, alice, bob, carol;

  beforeEach(async function () {
    [owner, alice, bob, carol] = await ethers.getSigners();
    Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy();
    await voting.waitForDeployment();
  });

  it("Dat dung owner va trang thai ban dau", async function () {
    expect(await voting.owner()).to.equal(owner.address);
    expect(await voting.votingOpen()).to.equal(false);
    expect(await voting.candidatesCount()).to.equal(0n);
  });

  it("Owner co the them ung vien khi phien dong", async function () {
    await expect(voting.addCandidate("Alice"))
      .to.emit(voting, "CandidateAdded")
      .withArgs(1n, "Alice");
    expect(await voting.candidatesCount()).to.equal(1n);
  });

  it("Nguoi khong phai owner KHONG the them ung vien", async function () {
    await expect(voting.connect(alice).addCandidate("X")).to.be.revertedWith(
      "Chi owner moi co quyen nay"
    );
  });

  it("Khong the mo phien khi co it hon 2 ung vien", async function () {
    await voting.addCandidate("Alice");
    await expect(voting.startVoting()).to.be.revertedWith("Can it nhat 2 ung vien");
  });

  it("Co the bo phieu khi phien mo va khong the bau 2 lan", async function () {
    await voting.addCandidate("Alice");
    await voting.addCandidate("Bob");
    await voting.startVoting();

    await expect(voting.connect(alice).vote(1))
      .to.emit(voting, "Voted")
      .withArgs(alice.address, 1n);

    await expect(voting.connect(alice).vote(2)).to.be.revertedWith("Ban da bo phieu roi");

    const c1 = await voting.getCandidate(1);
    expect(c1.voteCount).to.equal(1n);
  });

  it("Khong the bau khi phien chua mo hoac da dong", async function () {
    await voting.addCandidate("Alice");
    await voting.addCandidate("Bob");

    await expect(voting.connect(alice).vote(1)).to.be.revertedWith(
      "Phien bo phieu chua mo hoac da dong"
    );

    await voting.startVoting();
    await voting.endVoting();

    await expect(voting.connect(bob).vote(1)).to.be.revertedWith(
      "Phien bo phieu chua mo hoac da dong"
    );
  });

  it("Chan id ung vien khong hop le", async function () {
    await voting.addCandidate("Alice");
    await voting.addCandidate("Bob");
    await voting.startVoting();

    await expect(voting.connect(alice).vote(0)).to.be.revertedWith("Ung vien khong hop le");
    await expect(voting.connect(alice).vote(99)).to.be.revertedWith("Ung vien khong hop le");
  });

  it("Khong the them ung vien khi phien dang mo", async function () {
    await voting.addCandidate("Alice");
    await voting.addCandidate("Bob");
    await voting.startVoting();
    await expect(voting.addCandidate("Carol")).to.be.revertedWith(
      "Phien bo phieu dang mo, khong the thao tac"
    );
  });

  it("getCandidates() tra ve danh sach day du", async function () {
await voting.addCandidate("Alice");
    await voting.addCandidate("Bob");
    await voting.addCandidate("Carol");
    const list = await voting.getCandidates();
    expect(list.length).to.equal(3);
    expect(list[0].name).to.equal("Alice");
    expect(list[2].name).to.equal("Carol");
  });

  it("Owner co the mo va dong phien bo phieu", async function () {
    await voting.addCandidate("Alice");
    await voting.addCandidate("Bob");

    await expect(voting.startVoting()).to.emit(voting, "VotingStarted");
    expect(await voting.votingOpen()).to.equal(true);

    await expect(voting.endVoting()).to.emit(voting, "VotingEnded");
    expect(await voting.votingOpen()).to.equal(false);
  });

  it("Khong cho bo phieu voi id = 0", async function () {
    const [owner, voter] = await ethers.getSigners();
    await voting.addCandidate("A");
    await voting.addCandidate("B");
    await voting.startVoting();
    await expect(
      voting.connect(voter).vote(0)
    ).to.be.revertedWith("Ung vien khong hop le");
  });

  it("Ten ung vien khong duoc rong", async function () {
    await expect(
      voting.addCandidate("")
    ).to.be.revertedWith("Ten ung vien khong duoc rong");
  });
});