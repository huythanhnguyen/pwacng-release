import React, { useRef, useState, useCallback } from "react";
import {
    AlertCircle as AlertCircleIcon,
    File as FileIcon,
    Image as ImageIcon,
    FileText as DocumentIcon,
    Download as ArchiveIcon,
    Video as VideoIcon,
    Music as AudioIcon,
    X as CloseIcon
} from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';
import {useToasts} from "@magento/peregrine";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from "./uploadFileField.module.scss";
import {FormattedMessage, useIntl} from "react-intl";

const errorIcon = <Icon src={AlertCircleIcon} size={20} />;
const closeIcon = <Icon src={CloseIcon} size={16} />;

const MAX_BYTES = 10 * 1024 * 1024; // 10MB default
const MAX_BYTES_IMAGE = 5 * 1024 * 1024; // 5MB for images

// Define file type categories and their icons
const FILE_TYPE_ICONS = {
    image: ImageIcon,
    document: DocumentIcon,
    archive: ArchiveIcon,
    video: VideoIcon,
    audio: AudioIcon,
    default: FileIcon
};

// Common blocked file types for security
const BLOCKED_MIME = new Set([
    "application/x-executable",
    "application/x-msdownload",
    "application/x-msdos-program",
    "application/x-ms-dos-executable",
    "application/x-winexe",
    "application/x-exe",
    "application/vnd.microsoft.portable-executable"
]);

const BLOCKED_EXT = new Set([
    ".exe",
    ".bat",
    ".cmd",
    ".com",
    ".pif",
    ".scr",
    ".vbs",
    ".js",
    ".jar",
    ".app",
    ".deb",
    ".pkg",
    ".dmg"
]);

// File type detection
const getFileType = (file) => {
    const mimeType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';

    if (mimeType.includes('pdf') ||
        mimeType.includes('document') ||
        mimeType.includes('text') ||
        mimeType.includes('spreadsheet') ||
        fileName.endsWith('.doc') ||
        fileName.endsWith('.docx') ||
        fileName.endsWith('.txt') ||
        fileName.endsWith('.pdf') ||
        fileName.endsWith('.xls') ||
        fileName.endsWith('.xlsx')) return 'document';

    if (mimeType.includes('zip') ||
        mimeType.includes('rar') ||
        mimeType.includes('tar') ||
        fileName.endsWith('.zip') ||
        fileName.endsWith('.rar') ||
        fileName.endsWith('.7z')) return 'archive';

    return 'default';
};

const getFileIcon = (fileType) => {
    return FILE_TYPE_ICONS[fileType] || FILE_TYPE_ICONS.default;
};

const fileTooLarge = (fileOrBlob, maxBytes) => {
    return (fileOrBlob?.size || 0) > maxBytes;
};

const fileToBase64 = (file, { maxBytes } = {}) => {
    if (!file) return null;

    if (fileTooLarge(file, maxBytes)) {
        const mb = (maxBytes / (1024 * 1024)).toFixed(0);
        throw new Error(`File is too large. Maximum size allowed is ${mb}MB.`);
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const res = String(reader.result || "");
            const idx = res.indexOf(",");
            resolve(idx >= 0 ? res.slice(idx + 1) : res);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const isBlockedFile = (file) => {
    const type = (file.type || "").toLowerCase();
    const name = (file.name || "").toLowerCase();

    if (BLOCKED_MIME.has(type)) return true;

    const dot = name.lastIndexOf(".");
    if (dot >= 0) {
        const ext = name.slice(dot);
        if (BLOCKED_EXT.has(ext)) return true;
    }
    return false;
};

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const UploadFileField = props => {
    const {
        onChange,
        onRemove,
        accept = "*/*", // Accept all file types by default
        name = "file",
        fileResetKey,
        maxSize = MAX_BYTES,
        multiple = false,
        showPreview = true,
        allowedTypes = [], // Empty array means all types allowed
        blockedTypes = [], // Additional blocked types
        uploadedFiles = [], // Array of uploaded files for preview
        placeholder = "Choose file or drag & drop here"
    } = props;

    const classes = useStyle(defaultClasses, props.classes);
    const { formatMessage } = useIntl();
    const [, { addToast }] = useToasts();
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const validateFile = useCallback((file) => {
        // Check if file is blocked for security reasons
        if (isBlockedFile(file)) {
            throw new Error(formatMessage({
                id: 'uploadFileField.blockedFile',
                defaultMessage: 'This file type is not allowed for security reasons.'
            }));
        }

        // Check file size
        const maxBytes = getFileType(file) === 'image' ? MAX_BYTES_IMAGE : maxSize;
        if (fileTooLarge(file, maxBytes)) {
            const maxMB = (maxBytes / (1024 * 1024)).toFixed(0);
            throw new Error(formatMessage({
                id: 'uploadFileField.fileTooLarge',
                defaultMessage: `File is too large. Maximum size allowed is ${maxMB}MB.`
            }));
        }

        // Check allowed types
        if (allowedTypes.length > 0) {
            const fileType = getFileType(file);
            const mimeType = file.type.toLowerCase();
            const isAllowed = allowedTypes.some(type =>
                fileType === type ||
                mimeType.startsWith(type) ||
                file.name.toLowerCase().endsWith(type)
            );
            if (!isAllowed) {
                throw new Error(formatMessage({
                    id: 'uploadFileField.typeNotAllowed',
                    defaultMessage: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
                }));
            }
        }

        // Check additional blocked types
        if (blockedTypes.length > 0) {
            const fileType = getFileType(file);
            const mimeType = file.type.toLowerCase();
            const isBlocked = blockedTypes.some(type =>
                fileType === type ||
                mimeType.startsWith(type) ||
                file.name.toLowerCase().endsWith(type)
            );
            if (isBlocked) {
                throw new Error(formatMessage({
                    id: 'uploadFileField.typeBlocked',
                    defaultMessage: `File type is not allowed: ${blockedTypes.join(', ')}`
                }));
            }
        }
    }, [allowedTypes, blockedTypes, maxSize, formatMessage]);

    const processFiles = useCallback(async (files) => {
        const fileList = Array.from(files);

        for (const file of fileList) {
            try {
                validateFile(file);

                const fileType = getFileType(file);
                const mb = (file.size / (1024 * 1024)).toFixed(2);
                const data = await fileToBase64(file, {
                    maxBytes: fileType === 'image' ? MAX_BYTES_IMAGE : maxSize
                });

                const fileData = {
                    [name]: {
                        data,
                        mime_type: file.type || "application/octet-stream",
                        name: file.name,
                        size: file.size,
                        type: fileType
                    }
                };

                onChange?.(fileData, `${file.name} - ${mb}MB`);

            } catch (error) {
                addToast({
                    type: 'error',
                    icon: errorIcon,
                    message: error.message,
                    dismissable: true,
                    timeout: 7000
                });
            }
        }
    }, [validateFile, onChange, name, maxSize, addToast]);

    const onFileSelect = useCallback(async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        await processFiles(files);
        e.target.value = ''; // Allow selecting the same file again
    }, [processFiles]);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await processFiles(e.dataTransfer.files);
        }
    }, [processFiles]);

    const handleRemoveFile = useCallback((index) => {
        onRemove?.(index);
    }, [onRemove]);

    return (
        <div className={classes.root}>
            {/* File Upload Area */}
            <div
                className={`${classes.uploadArea} ${dragActive ? classes.dragActive : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={onFileSelect}
                    key={fileResetKey}
                    className={classes.hiddenInput}
                />

                <label
                    className={classes.uploadLabel}
                    onClick={() => inputRef.current?.click()}
                >
                    <div className={classes.uploadContent}>
                        <Icon src={FileIcon} size={24} className={classes.uploadIcon} />
                        <span className={classes.uploadText}>
                            <FormattedMessage
                                id="uploadFileField.placeholder"
                                defaultMessage={placeholder}
                            />
                        </span>
                        <span className={classes.uploadHint}>
                            <FormattedMessage
                                id="uploadFileField.hint"
                                defaultMessage="Click to browse or drag files here"
                            />
                        </span>
                    </div>
                </label>
            </div>

            {/* File Preview */}
            {showPreview && uploadedFiles && uploadedFiles.length > 0 && (
                <div className={classes.filePreview}>
                    {uploadedFiles.map((file, index) => {
                        const fileType = file.type || getFileType(file);
                        const FileIconComponent = getFileIcon(fileType);

                        return (
                            <div key={index} className={classes.fileItem}>
                                <div className={classes.fileIcon}>
                                    <Icon src={FileIconComponent} size={20} />
                                </div>
                                <div className={classes.fileInfo}>
                                    <div className={classes.fileName}>{file.name}</div>
                                    <div className={classes.fileSize}>
                                        {formatFileSize(file.size)}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className={classes.removeButton}
                                    onClick={() => handleRemoveFile(index)}
                                    aria-label={formatMessage({
                                        id: 'uploadFileField.remove',
                                        defaultMessage: 'Remove file'
                                    })}
                                >
                                    {closeIcon}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default UploadFileField;
