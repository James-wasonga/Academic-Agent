// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AcaWise - AI-Enhanced Academic Platform
 * @dev Integrates with off-chain AI for automated grading and verification
 * @notice For Mantle Global Hackathon 2025 - AI & Oracles Track
 */
contract AcaWise {
    
    // STATE VARIABLES
    address public owner;
    address public aiServiceAddress;
    uint256 public totalUsers;
    uint256 public totalResearchPapers;
    uint256 public totalCodeSubmissions;
    uint256 public totalAIVerifications;
    
    // STRUCTS
    struct User {
        bool isRegistered;
        uint256 registrationDate;
        uint256 researchCount;
        uint256 codeSubmissionCount;
        uint256 reputationScore;
    }
    
    struct ResearchPaper {
        uint256 id;
        address author;
        string ipfsHash;
        uint256 timestamp;
        bool exists;
        bool aiVerified;
        uint256 qualityScore;
    }
    
    struct CodeSubmission {
        uint256 id;
        address developer;
        string ipfsHash;
        uint256 qualityScore;
        uint256 timestamp;
        bool exists;
        bool aiGraded;
        uint256 aiScore;
    }
    
    // MAPPINGS
    mapping(address => User) public users;
    mapping(uint256 => ResearchPaper) public researchPapers;
    mapping(uint256 => CodeSubmission) public codeSubmissions;
    mapping(address => uint256[]) public userResearchIds;
    mapping(address => uint256[]) public userCodeIds;
    
    // EVENTS
    event UserRegistered(address indexed user, uint256 timestamp);
    event ResearchCreated(uint256 indexed id, address indexed author, string ipfsHash);
    event ResearchVerified(uint256 indexed id, uint256 qualityScore, uint256 timestamp);
    event CodeSubmitted(uint256 indexed id, address indexed developer, string ipfsHash);
    event CodeGraded(uint256 indexed id, uint256 aiScore, uint256 timestamp);
    event ReputationUpdated(address indexed user, uint256 newScore);
    event AIServiceUpdated(address indexed newService);
    
    // MODIFIERS
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered, "Not registered");
        _;
    }
    
    modifier onlyAIService() {
        require(msg.sender == aiServiceAddress || msg.sender == owner, "Only AI service");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        aiServiceAddress = msg.sender;
    }
    
    // USER FUNCTIONS
    function register() external {
        require(!users[msg.sender].isRegistered, "Already registered");
        
        users[msg.sender] = User({
            isRegistered: true,
            registrationDate: block.timestamp,
            researchCount: 0,
            codeSubmissionCount: 0,
            reputationScore: 50
        });
        
        totalUsers++;
        emit UserRegistered(msg.sender, block.timestamp);
    }
    
    function isRegistered(address _user) external view returns (bool) {
        return users[_user].isRegistered;
    }
    
    function getUserReputation(address _user) external view returns (uint256) {
        return users[_user].reputationScore;
    }
    
    // RESEARCH FUNCTIONS
    function createResearch(string memory _ipfsHash) external onlyRegistered returns (uint256) {
        require(bytes(_ipfsHash).length > 0, "Invalid IPFS hash");
        
        totalResearchPapers++;
        uint256 id = totalResearchPapers;
        
        researchPapers[id] = ResearchPaper({
            id: id,
            author: msg.sender,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            exists: true,
            aiVerified: false,
            qualityScore: 0
        });
        
        userResearchIds[msg.sender].push(id);
        users[msg.sender].researchCount++;
        
        emit ResearchCreated(id, msg.sender, _ipfsHash);
        return id;
    }
    
    function verifyResearch(uint256 _id, uint256 _qualityScore) external onlyAIService {
        require(researchPapers[_id].exists, "Research not found");
        require(_qualityScore <= 100, "Invalid score");
        require(!researchPapers[_id].aiVerified, "Already verified");
        
        ResearchPaper storage paper = researchPapers[_id];
        paper.aiVerified = true;
        paper.qualityScore = _qualityScore;
        
        totalAIVerifications++;
        _updateReputation(paper.author, _qualityScore);
        
        emit ResearchVerified(_id, _qualityScore, block.timestamp);
    }
    
    function getResearch(uint256 _id) external view returns (
        address author,
        string memory ipfsHash,
        uint256 timestamp,
        bool aiVerified,
        uint256 qualityScore
    ) {
        require(researchPapers[_id].exists, "Research not found");
        ResearchPaper memory paper = researchPapers[_id];
        return (paper.author, paper.ipfsHash, paper.timestamp, paper.aiVerified, paper.qualityScore);
    }
    
    function getUserResearch(address _user) external view returns (uint256[] memory) {
        return userResearchIds[_user];
    }
    
    // CODE GRADING FUNCTIONS
    function submitCode(string memory _ipfsHash, uint256 _initialScore) external onlyRegistered returns (uint256) {
        require(bytes(_ipfsHash).length > 0, "Invalid IPFS hash");
        require(_initialScore <= 100, "Score must be 0-100");
        
        totalCodeSubmissions++;
        uint256 id = totalCodeSubmissions;
        
        codeSubmissions[id] = CodeSubmission({
            id: id,
            developer: msg.sender,
            ipfsHash: _ipfsHash,
            qualityScore: _initialScore,
            timestamp: block.timestamp,
            exists: true,
            aiGraded: false,
            aiScore: 0
        });
        
        userCodeIds[msg.sender].push(id);
        users[msg.sender].codeSubmissionCount++;
        
        emit CodeSubmitted(id, msg.sender, _ipfsHash);
        return id;
    }
    
    function gradeCode(uint256 _id, uint256 _aiScore) external onlyAIService {
        require(codeSubmissions[_id].exists, "Submission not found");
        require(_aiScore <= 100, "Invalid score");
        require(!codeSubmissions[_id].aiGraded, "Already graded");
        
        CodeSubmission storage submission = codeSubmissions[_id];
        submission.aiGraded = true;
        submission.aiScore = _aiScore;
        
        totalAIVerifications++;
        _updateReputation(submission.developer, _aiScore);
        
        emit CodeGraded(_id, _aiScore, block.timestamp);
    }
    
    function getCodeSubmission(uint256 _id) external view returns (
        address developer,
        string memory ipfsHash,
        uint256 score,
        uint256 timestamp,
        bool aiGraded,
        uint256 aiScore
    ) {
        require(codeSubmissions[_id].exists, "Submission not found");
        CodeSubmission memory submission = codeSubmissions[_id];
        return (
            submission.developer,
            submission.ipfsHash,
            submission.qualityScore,
            submission.timestamp,
            submission.aiGraded,
            submission.aiScore
        );
    }
    
    function getUserCodeSubmissions(address _user) external view returns (uint256[] memory) {
        return userCodeIds[_user];
    }
    
    function getUserAverageScore(address _user) external view returns (uint256) {
        uint256[] memory ids = userCodeIds[_user];
        if (ids.length == 0) return 0;
        
        uint256 total = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            CodeSubmission memory submission = codeSubmissions[ids[i]];
            uint256 scoreToUse = submission.aiGraded ? submission.aiScore : submission.qualityScore;
            total += scoreToUse;
        }
        return total / ids.length;
    }
    
    function _updateReputation(address _user, uint256 _score) internal {
        User storage user = users[_user];
        uint256 totalSubmissions = user.researchCount + user.codeSubmissionCount;
        
        if (totalSubmissions > 0) {
            user.reputationScore = (user.reputationScore * (totalSubmissions - 1) + _score) / totalSubmissions;
        } else {
            user.reputationScore = _score;
        }
        
        emit ReputationUpdated(_user, user.reputationScore);
    }
    
    // STATS FUNCTIONS
    function getUserStats(address _user) external view returns (
        bool registered,
        uint256 registrationDate,
        uint256 researchCount,
        uint256 codeCount,
        uint256 reputation
    ) {
        User memory user = users[_user];
        return (
            user.isRegistered,
            user.registrationDate,
            user.researchCount,
            user.codeSubmissionCount,
            user.reputationScore
        );
    }
    
    function getPlatformStats() external view returns (
        uint256 users_,
        uint256 research_,
        uint256 code_,
        uint256 aiVerifications_
    ) {
        return (totalUsers, totalResearchPapers, totalCodeSubmissions, totalAIVerifications);
    }
    
    // ADMIN FUNCTIONS
    function setAIServiceAddress(address _newService) external onlyOwner {
        require(_newService != address(0), "Invalid address");
        aiServiceAddress = _newService;
        emit AIServiceUpdated(_newService);
    }
    
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
    
    function manualVerify(uint256 _researchId, uint256 _score) external onlyOwner {
        require(researchPapers[_researchId].exists, "Research not found");
        researchPapers[_researchId].aiVerified = true;
        researchPapers[_researchId].qualityScore = _score;
        totalAIVerifications++;
    }
    
    function manualGrade(uint256 _codeId, uint256 _score) external onlyOwner {
        require(codeSubmissions[_codeId].exists, "Submission not found");
        codeSubmissions[_codeId].aiGraded = true;
        codeSubmissions[_codeId].aiScore = _score;
        totalAIVerifications++;
    }
}