// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Voting - Smart contract bỏ phiếu phi tập trung
 * @notice Mỗi địa chỉ ví chỉ được bỏ phiếu 1 lần. Owner quản lý ứng viên và phiên bỏ phiếu.
 * @dev Viết cho mục đích học tập môn Blockchain căn bản. Có comment tiếng Việt chi tiết.
 */
contract Voting {
    // ===== KIỂU DỮ LIỆU =====

    /// @notice Thông tin một ứng viên
    struct Candidate {
        uint256 id;         // Mã định danh (tự tăng từ 1)
        string name;        // Tên hiển thị
        uint256 voteCount;  // Tổng số phiếu nhận được
    }

    // ===== BIẾN TRẠNG THÁI =====

    /// @notice Địa chỉ chủ sở hữu (người deploy contract)
    address public owner;

    /// @notice Trạng thái phiên bỏ phiếu: true = đang mở, false = đã đóng
    bool public votingOpen;

    /// @notice Tổng số ứng viên hiện có
    uint256 public candidatesCount;

    /// @notice Lưu danh sách ứng viên theo id
    mapping(uint256 => Candidate) private candidates;

    /// @notice Đánh dấu một địa chỉ đã bỏ phiếu hay chưa
    mapping(address => bool) public hasVoted;

    // ===== EVENT =====

    event CandidateAdded(uint256 indexed id, string name);
    event Voted(address indexed voter, uint256 indexed candidateId);
    event VotingStarted(uint256 timestamp);
    event VotingEnded(uint256 timestamp);

    // ===== MODIFIER =====

    /// @dev Chỉ cho phép owner gọi hàm
    modifier onlyOwner() {
        require(msg.sender == owner, "Chi owner moi co quyen nay");
        _;
    }

    /// @dev Chỉ cho phép khi phiên bỏ phiếu đang mở
    modifier whenVotingOpen() {
        require(votingOpen, "Phien bo phieu chua mo hoac da dong");
        _;
    }

    /// @dev Chỉ cho phép khi phiên bỏ phiếu đang đóng (để tránh thêm/sửa ứng viên giữa lúc bầu)
    modifier whenVotingClosed() {
        require(!votingOpen, "Phien bo phieu dang mo, khong the thao tac");
        _;
    }

    // ===== CONSTRUCTOR =====

    /// @notice Người deploy sẽ trở thành owner. Phiên bỏ phiếu bắt đầu ở trạng thái ĐÓNG.
    constructor() {
        owner = msg.sender;
        votingOpen = false;
    }

    // ===== HÀM GHI =====

    /**
     * @notice Thêm một ứng viên mới.
     * @dev Chỉ cho phép thêm khi phiên bỏ phiếu ĐANG ĐÓNG để đảm bảo công bằng:
     *      không ai có thể thêm ứng viên "chen vào" khi đang bỏ phiếu.
     */
    function addCandidate(string calldata name) external onlyOwner whenVotingClosed {
        require(bytes(name).length > 0, "Ten ung vien khong duoc rong");
        candidatesCount += 1;
        candidates[candidatesCount] = Candidate({
            id: candidatesCount,
            name: name,
            voteCount: 0
        });
        emit CandidateAdded(candidatesCount, name);
    }

    /**
     * @notice Bỏ phiếu cho một ứng viên.
     * @param candidateId Mã ứng viên muốn bầu.
     */
    function vote(uint256 candidateId) external whenVotingOpen {
        require(!hasVoted[msg.sender], "Ban da bo phieu roi");
        require(candidateId > 0 && candidateId <= candidatesCount, "Ung vien khong hop le");

        hasVoted[msg.sender] = true;
        candidates[candidateId].voteCount += 1;

        emit Voted(msg.sender, candidateId);
    }

    /// @notice Mở phiên bỏ phiếu. Phải có ít nhất 2 ứng viên để cuộc bầu có ý nghĩa.
    function startVoting() external onlyOwner {
        require(!votingOpen, "Phien da mo");
        require(candidatesCount >= 2, "Can it nhat 2 ung vien");
        votingOpen = true;
        emit VotingStarted(block.timestamp);
    }

    /// @notice Đóng phiên bỏ phiếu.
    function endVoting() external onlyOwner {
        require(votingOpen, "Phien chua mo");
        votingOpen = false;
        emit VotingEnded(block.timestamp);
    }

    // ===== HÀM ĐỌC =====

    /// @notice Lấy thông tin 1 ứng viên theo id.
    function getCandidate(uint256 candidateId) external view returns (Candidate memory) {
        require(candidateId > 0 && candidateId <= candidatesCount, "Ung vien khong hop le");
        return candidates[candidateId];
    }

    /// @notice Lấy toàn bộ danh sách ứng viên (tiện cho frontend gọi 1 lần).
    function getCandidates() external view returns (Candidate[] memory) {
        Candidate[] memory list = new Candidate[](candidatesCount);
        for (uint256 i = 1; i <= candidatesCount; i++) {
            list[i - 1] = candidates[i];
        }
        return list;
    }
}
