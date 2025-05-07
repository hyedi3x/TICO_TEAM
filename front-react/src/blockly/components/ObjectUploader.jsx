import React, { useState, useEffect } from 'react';
import { Button } from 'rsuite';
import { FaTrash } from 'react-icons/fa';
import axiosInstance from '../../pages/login/social/utils/axiosInstance';

const ObjectUploader = ({ onSelect, fileInputId = 'uploadHiddenInput' }) => {
  const userUuid = localStorage.getItem("user_uuid");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  /** 업로드된 파일 목록 불러오기 */
  const fetchUploadedFiles = async () => {
    try {
      const res = await axiosInstance.get(`/api/blockly-upload-file/${userUuid}`);
      setUploadedFiles(res.data || []);
    } catch (err) {
      console.error("❌ 업로드 이미지 로딩 실패:", err);
      alert("업로드 목록을 불러오는 데 실패했습니다.");
    }
  };

  /** 파일 선택 핸들러 */
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_uuid", userUuid);

    try {
      await axiosInstance.post("/api/blockly-upload-file", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("✅ 파일 업로드 성공!");
      fetchUploadedFiles();
    } catch (err) {
      console.error("❌ 파일 업로드 실패:", err);
      const errorMessage = err.response?.data || "파일 업로드 중 오류가 발생했습니다.";
      alert(`❌ ${errorMessage}`);
    }
  };

  /** 파일 삭제 핸들러 */
  const handleDeleteUploadedFile = async (fileId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axiosInstance.delete(`/api/blockly-upload-file/${fileId}`);
      alert("🗑️ 삭제 완료!");
      setUploadedFiles(prev => prev.filter(f => f.fileId !== fileId));
    } catch (err) {
      console.error("❌ 삭제 실패:", err);
      alert("파일 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="objectSelectPage-custom-upload-wrapper">
      {/* 파일 선택 버튼 */}
      <div
        className="objectSelectPage-custom-upload-button"
        onClick={() => document.getElementById(fileInputId)?.click()}
      >
        <div className="objectSelectPage-upload-icon">📤</div>
        <div className="objectSelectPage-upload-label">파일 올리기</div>
      </div>

      <input
        id={fileInputId}
        type="file"
        accept=".jpg,.jpeg,.png,.bmp,.webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* 업로드된 파일 목록 */}
      <div className="objectSelectPage-upload-preview-grid">
        {uploadedFiles.map(file => (
          <div key={file.fileId} className="objectSelectPage-upload-preview-item">
            <img
              src={`https://tico.kro.kr/${file.filePath.startsWith('/') ? '' : '/'}${file.filePath}`}
              alt={file.originalFilename}
              className="objectSelectPage-upload-preview-img"
              onClick={() => onSelect({
                blocklyObjectId: file.fileId,
                blocklyObjectName: file.originalFilename,
                blocklyObjectFilePath: file.filePath,
              })}
            />
            <Button
              size="xs"
              color="red"
              appearance="ghost"
              onClick={() => handleDeleteUploadedFile(file.fileId)}
            >
              <FaTrash />
            </Button>
          </div>
        ))}
      </div>

      {/* 경고 문구 */}
      <div className="objectSelectPage-upload-warning">
        아래와 같은 그림은 이용약관 및 법률에 의해 제재될 수 있습니다:
        <ul>
          <li>폭력적이고 잔인한 그림</li>
          <li>선정적인 신체 노출</li>
          <li>혐오감을 주는 그림</li>
          <li>
            무단 저작권 그림 사용{' '}
            <a
              href="https://www.copyright.or.kr/education/educlass/learning/infringement-case/index.do"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'underline' }}
            >
              [저작권 알아보기]
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ObjectUploader;
