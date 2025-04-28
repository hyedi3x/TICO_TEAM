// ObjectUploader.jsx
import React from 'react';
import { Button } from 'rsuite';
import { FaTrash } from 'react-icons/fa';

const ObjectUploader = ({ uploadedFiles, onFileChange, onDelete, onSelect }) => {
  return (
    <div className="objectSelectPage-custom-upload-wrapper">
      <div
        className="objectSelectPage-custom-upload-button"
        onClick={() => document.getElementById('hiddenFileInput').click()}
      >
        <div className="objectSelectPage-upload-icon">📤</div>
        <div className="objectSelectPage-upload-label">파일 올리기</div>
      </div>

      <input
        id="hiddenFileInput"
        type="file"
        accept=".jpg,.jpeg,.png,.bmp,.svg,.webp"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />

      <div className="objectSelectPage-upload-preview-grid">
        {uploadedFiles.map(file => (
          <div key={file.id} className="objectSelectPage-upload-preview-item">
            <img
              src={`http://localhost:8081/uploads/${file.storedFilename}`}
              alt={file.originalFilename}
              className="objectSelectPage-upload-preview-img"
              onClick={() => onSelect({
                blocklyObjectId: file.id,
                blocklyObjectName: file.originalFilename,
                blocklyObjectFilePath: `uploads/${file.storedFilename}`,
              })}
            />
            <Button
              size="xs"
              color="red"
              appearance="ghost"
              onClick={() => onDelete(file.id)}
            >
              <FaTrash />
            </Button>
          </div>
        ))}
      </div>

      <div className="objectSelectPage-upload-warning">
        아래와 같은 그림은 이용약관 및 관련 법률에 의해 제재를 받을 수 있습니다.
        <ul>
          <li>폭력적이고 잔인한 그림</li>
          <li>선정적인 신체노출</li>
          <li>블랙감을 주거나 혐오감을 일으키는 그림</li>
          <li>
            무단 사용된 저작권 그림{' '}
            <a
              href="https://www.copyright.or.kr/education/educlass/learning/infringement-case/index.do"
              style={{ textDecoration: 'underline' }}
            >
              [저작권에 대해 알아보기]
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ObjectUploader;