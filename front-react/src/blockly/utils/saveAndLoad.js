// saveAndLoad.js
import * as Blockly from 'blockly';

// Blockly 작업 공간을 JSON 형식으로 저장하는 함수
export const saveBlocklyWorkspaceAsJSON = (workspace) => {
    const workspaceJSON = Blockly.serialization.workspaces.save(workspace);  // 작업공간을 JSON 형식으로 저장
    localStorage.setItem('blocklyWorkspaceJSON', JSON.stringify(workspaceJSON)); // JSON을 로컬 스토리지에 저장
    console.log("워크스페이스 JSON 저장 완료");
};

// Blockly 작업 공간을 JSON 형식으로 불러오는 함수
export const loadBlocklyWorkspaceFromJSON = (workspace) => {
    const savedWorkspaceJSON = localStorage.getItem('blocklyWorkspaceJSON'); // 저장된 JSON 가져오기
    if (savedWorkspaceJSON) {
        const workspaceJSON = JSON.parse(savedWorkspaceJSON); // JSON 문자열을 객체로 변환
        Blockly.serialization.workspaces.load(workspaceJSON, workspace); // 작업공간에 JSON 복원
        console.log("워크스페이스 JSON 불러오기 완료");
    }
};
