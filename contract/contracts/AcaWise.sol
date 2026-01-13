// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AcaWise
 * @dev Lightweight Decentralized Academic & Developer Assistant Platform
 * @notice Only critical data stored on-chain, content stored off-chain (IPFS)
 */
contract AcaWise {
    
    // STATE VARIABLES
    
    address public owner;
    address public aiOracleAddress; //AI Oracle Address
    uint256 public totalUsers;
    uint256 public totalResearchPapers;
    uint256 public totalCodeSubmissions;
    uint256 public totalAIAnalyses;

    // STRUCTS (Minimal on-chain data)
    
    struct User {
        bool isRegistered;
        uint256 registrationDate;
        uint256 researchCount;
        uint256 codeSubmissionCount;
    }
    
    struct ResearchPaper {
        uint256 id;
        address author;
        string ipfsHash; // Full content stored on IPFS
        uint256 timestamp;
        bool exists;
    }
    
    struct CodeSubmission {
        uint256 id;
        address developer;
        string ipfsHash; // Code + feedback stored on IPFS
        uint256 qualityScore; // Only score on-chain
        uint256 timestamp;
        bool exists;
    }
    

    // MAPPINGS
    mapping(address => User) public users;
    mapping(uint256 => ResearchPaper) public researchPapers;
    mapping(uint256 => CodeSubmission) public codeSubmissions;
    mapping(address => uint256[]) public userResearchIds;
    mapping(address => uint256[]) public userCodeIds;
    
  
    // EVENTS (For off-chain indexing)
    event UserRegistered(address indexed user, uint256 timestamp);
    event ResearchCreated(uint256 indexed id, address indexed author, string ipfsHash, uint256 timestamp);
    event CodeSubmitted(uint256 indexed id, address indexed developer, string ipfsHash, uint256 score, uint256 timestamp);
    
 
    // MODIFIERS 
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered, "Not registered");
        _;
    }
    

    // CONSTRUCTOR

    constructor() {
        owner = msg.sender;
    }
    

    // USER FUNCTIONS
    
    /**
     * @dev Register user (free, just marks address as registered)
     */
    function register() external {
        require(!users[msg.sender].isRegistered, "Already registered");
        
        users[msg.sender] = User({
            isRegistered: true,
            registrationDate: block.timestamp,
            researchCount: 0,
            codeSubmissionCount: 0
        });
        
        totalUsers++;
        emit UserRegistered(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Check if user is registered
     */
    function isRegistered(address _user) external view returns (bool) {
        return users[_user].isRegistered;
    }
    

    // RESEARCH FUNCTIONS
    
    /**
     * @dev Create research paper (only IPFS hash stored on-chain)
     * @param _ipfsHash IPFS hash containing: title, content, category, metadata
     */
    function createResearch(string memory _ipfsHash) external onlyRegistered returns (uint256) {
        require(bytes(_ipfsHash).length > 0, "Invalid IPFS hash");
        
        totalResearchPapers++;
        uint256 id = totalResearchPapers;
        
        researchPapers[id] = ResearchPaper({
            id: id,
            author: msg.sender,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            exists: true
        });
        
        userResearchIds[msg.sender].push(id);
        users[msg.sender].researchCount++;
        
        emit ResearchCreated(id, msg.sender, _ipfsHash, block.timestamp);
        return id;
    }
    
    /**
     * @dev Get research paper by ID
     */
    function getResearch(uint256 _id) external view returns (
        address author,
        string memory ipfsHash,
        uint256 timestamp
    ) {
        require(researchPapers[_id].exists, "Research not found");
        ResearchPaper memory paper = researchPapers[_id];
        return (paper.author, paper.ipfsHash, paper.timestamp);
    }
    
    /**
     * @dev Get all research IDs by user
     */
    function getUserResearch(address _user) external view returns (uint256[] memory) {
        return userResearchIds[_user];
    }


    // CODE GRADING FUNCTIONS
  
    /**
     * @dev Submit code (only score on-chain, full feedback in IPFS)
     * @param _ipfsHash IPFS hash containing: code, errors, suggestions, strengths
     * @param _score Quality score 0-100
     */
    function submitCode(string memory _ipfsHash, uint256 _score) external onlyRegistered returns (uint256) {
        require(bytes(_ipfsHash).length > 0, "Invalid IPFS hash");
        require(_score <= 100, "Score must be 0-100");
        
        totalCodeSubmissions++;
        uint256 id = totalCodeSubmissions;
        
        codeSubmissions[id] = CodeSubmission({
            id: id,
            developer: msg.sender,
            ipfsHash: _ipfsHash,
            qualityScore: _score,
            timestamp: block.timestamp,
            exists: true
        });
        
        userCodeIds[msg.sender].push(id);
        users[msg.sender].codeSubmissionCount++;
        
        emit CodeSubmitted(id, msg.sender, _ipfsHash, _score, block.timestamp);
        return id;
    }
    
    /**
     * @dev Get code submission by ID
     */
    function getCodeSubmission(uint256 _id) external view returns (
        address developer,
        string memory ipfsHash,
        uint256 score,
        uint256 timestamp
    ) {
        require(codeSubmissions[_id].exists, "Submission not found");
        CodeSubmission memory submission = codeSubmissions[_id];
        return (submission.developer, submission.ipfsHash, submission.qualityScore, submission.timestamp);
    }
    
    /**
     * @dev Get all code submission IDs by user
     */
    function getUserCodeSubmissions(address _user) external view returns (uint256[] memory) {
        return userCodeIds[_user];
    }
    
    /**
     * @dev Get average code score for user (calculated on-demand)
     */
    function getUserAverageScore(address _user) external view returns (uint256) {
        uint256[] memory ids = userCodeIds[_user];
        if (ids.length == 0) return 0;
        
        uint256 total = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            total += codeSubmissions[ids[i]].qualityScore;
        }
        return total / ids.length;
    }
    

    // STATS FUNCTIONS
    
    /**
     * @dev Get user statistics
     */
    function getUserStats(address _user) external view returns (
        bool registered,
        uint256 registrationDate,
        uint256 researchCount,
        uint256 codeCount
    ) {
        User memory user = users[_user];
        return (
            user.isRegistered,
            user.registrationDate,
            user.researchCount,
            user.codeSubmissionCount
        );
    }
    
    /**
     * @dev Get platform statistics
     */
    function getPlatformStats() external view returns (
        uint256 users_,
        uint256 research_,
        uint256 code_
    ) {
        return (totalUsers, totalResearchPapers, totalCodeSubmissions);
    }
    

    // ADMIN FUNCTIONS

    /**
     * @dev Transfer ownership
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
}