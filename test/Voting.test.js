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

  it("Đặt đúng owner và trạng thái ban đầu", async function () {
    expect(await voting.owner()).to.equal(owner.address);
    expect(await voting.votingOpen()).to.equal(false);
    expect(await voting.candidatesCount()).to.equal(0n);
  });

  it("Owner có thể thêm ứng viên khi phiên đóng", async function () {
    await expect(voting.addCandidate("Alice"))
      .to.emit(voting, "CandidateAdded")
      .withArgs(1n, "Alice");
    expect(await voting.candidatesCount()).to.equal(1n);
  });

  it("Người không phải owner KHÔNG thể thêm ứng viên", async function () {
    await expect(voting.connect(alice).addCandidate("X")).to.be.revertedWith(
      "Chi owner moi co quyen nay"
    );
  });

  it("Không thể mở phiên khi có ít hơn 2 ứng viên", async function () {
    await voting.addCandidate("Alice");
    await expect(voting.startVoting()).to.be.revertedWith("Can it nhat 2 ung vien");
  });

  it("Có thể bỏ phiếu khi phiên mở và không thể bầu 2 lần", async function () {
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

  it("Không thể bầu khi phiên chưa mở hoặc đã đóng", async function () {
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

  it("Chặn id ứng viên không hợp lệ", async function () {
    await voting.addCandidate("Alice");
    await voting.addCandidate("Bob");
    await voting.startVoting();

    await expect(voting.connect(alice).vote(0)).to.be.revertedWith("Ung vien khong hop le");
    await expect(voting.connect(alice).vote(99)).to.be.revertedWith("Ung vien khong hop le");
  });

  it("Không thể thêm ứng viên khi phiên đang mở", async function () {
    await voting.addCandidate("Alice");
    await voting.addCandidate("Bob");
    await voting.startVoting();
    await expect(voting.addCandidate("Carol")).to.be.revertedWith(
      "Phien bo phieu dang mo, khong the thao tac"
    );
  });

  it("getCandidates() trả về danh sách đầy đủ", async function () {
    await voting.addCandidate("Alice");
    await voting.addCandidate("Bob");
    await voting.addCandidate("Carol");
    const list = await voting.getCandidates();
    expect(list.length).to.equal(3);
    expect(list[0].name).to.equal("Alice");
    expect(list[2].name).to.equal("Carol");
  });

  it("Owner có thể mở và đóng phiên bỏ phiếu", async function () {
    await voting.addCandidate("Alice");
    await voting.addCandidate("Bob");

    await expect(voting.startVoting()).to.emit(voting, "VotingStarted");
    expect(await voting.votingOpen()).to.equal(true);

    await expect(voting.endVoting()).to.emit(voting, "VotingEnded");
    expect(await voting.votingOpen()).to.equal(false);
  });
});
