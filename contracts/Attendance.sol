// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";


contract Attendance is AccessControl {

   
    bytes32 public constant TEACHER_ROLE = keccak256("TEACHER_ROLE");

    
    uint256 private _sessionCounter;

    
    struct Session {
        bytes32 locationHash; 
        address teacher;      
        uint256 startTime;    
        bool active;        
    }

    
    mapping(uint256 => Session) public sessions;

    
    mapping(uint256 => mapping(address => bool)) public attendanceRecords;

    
    mapping(uint256 => address[]) public attendeeList;

    
    event SessionStarted(uint256 indexed sessionId, address indexed teacher, bytes32 locationHash);
    
   
    event CheckedIn(uint256 indexed sessionId, address indexed student, uint256 timestamp);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
      
        _grantRole(TEACHER_ROLE, msg.sender);
    }

   
    function startSession(bytes32 _locationHash) public onlyRole(TEACHER_ROLE) returns (uint256) {
        
        _sessionCounter++;
        uint256 newSessionId = _sessionCounter;

        sessions[newSessionId] = Session({
            locationHash: _locationHash,
            teacher: msg.sender,
            startTime: block.timestamp,
            active: true
        });

        emit SessionStarted(newSessionId, msg.sender, _locationHash);
        return newSessionId;
    }

    
    function checkIn(uint256 _sessionId, string memory _locationProof) public {
        Session storage session = sessions[_sessionId];

        
        require(_sessionId > 0 && session.active, "Session is not active or does not exist");

        
        bytes32 proofHash = keccak256(abi.encodePacked(_locationProof));
        require(proofHash == session.locationHash, "Location proof is invalid");

        
        require(!attendanceRecords[_sessionId][msg.sender], "Student already checked in");

       
        attendanceRecords[_sessionId][msg.sender] = true;
        attendeeList[_sessionId].push(msg.sender);

        emit CheckedIn(_sessionId, msg.sender, block.timestamp);
    }

    function getAttendees(uint256 _sessionId) public view returns (address[] memory) {
        return attendeeList[_sessionId];
    }

    

   
    function grantTeacherRole(address _teacher) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(TEACHER_ROLE, _teacher);
    }

    
    function revokeTeacherRole(address _teacher) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(TEACHER_ROLE, _teacher);
    }
}