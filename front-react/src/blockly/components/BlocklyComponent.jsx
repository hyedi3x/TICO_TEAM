import React, { useEffect, useRef } from 'react';
import * as Blockly from "blockly";
import { saveBlocklyWorkspaceAsJSON, loadBlocklyWorkspaceFromJSON } from '../utils/saveAndLoad';
import * as ko from "blockly/msg/ko";
import { defineCustomBlocks } from '../blocks/customBlocks';
import { registerBlockGenerators } from '../blocks/blockGenerators';
import { runGeneratedCode } from '../utils/codeRunner';
import toolboxXML from "../utils/toolbox";
import "./BlocklyComponent.css";

const BlocklyComponent = () => {
    const blocklyDiv = useRef(null);  // Blockly가 삽입될 div 요소 참조
    const workspace = useRef(null);   // Blockly 워크스페이스 참조

    // 컴포넌트가 렌더링된 후 실행
    useEffect(() => {
        defineCustomBlocks();  // 사용자 정의 블록 등록
        registerBlockGenerators();  // 블록 생성 로직 등록

        if (blocklyDiv.current) {

            // 기존 workspace가 존재하면 삭제 후 새로 생성
            if (workspace.current) {
                workspace.current.dispose();
            }

            workspace.current = Blockly.inject(blocklyDiv.current, {
                // 툴박스 설정
                toolbox: toolboxXML(),  

                // 이동 설정
                move:{
                    scrollbars: {
                      horizontal: false,
                      vertical: false
                    },
                    drag: false,
                    wheel: false
                },
                
                // 확대/축소 설정
                zoom: {
                    controls: true,
                    wheel: false,
                    startScale: 1.0,
                    maxScale: 3,
                    minScale: 0.3,
                    scaleSpeed: 1.2,
                    pinch: true
                }
            });

            Blockly.setLocale(ko);  // 한국어 설정

            // 저장된 작업공간 불러오기
            loadBlocklyWorkspaceFromJSON(workspace.current);
        }
    }, []);

    return (
        <div className='blockly-container'>
            <div className='blockly-workspace'>
                <img src='entrybot(1).png' id="sprite" alt='object'/>
                <div className='blockly-div' ref={blocklyDiv} />
                <button className='run-button' onClick={() => runGeneratedCode(workspace.current)}>
                    실행하기
                </button>
                <button className='save-button' onClick={() => saveBlocklyWorkspaceAsJSON(workspace.current)}>
                    저장하기
                </button>
            </div>
        </div>
    );
};

export default BlocklyComponent;
