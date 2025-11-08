import React from "react";
import { useToasts } from "@magento/peregrine";
import { useIntl } from "react-intl";
import { AlertCircle as AlertCircleIcon } from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';

const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

const BLOCKED_MIME = new Set([
    "application/x-executable",
    "application/x-msdownload",
    "application/x-msdos-program",
    "application/x-ms-dos-executable",
    "application/x-winexe",
    "application/x-exe",
    "application/vnd.microsoft.portable-executable",
    "application/zip"
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
    ".dmg",
    ".zip"
]);

export const useFileUploadUtils = () => {
    const { formatMessage } = useIntl();
    const [, { addToast }] = useToasts();

    const fileTooLarge = (fileOrBlob, maxBytes = MAX_BYTES) => {
        return (fileOrBlob?.size || 0) > maxBytes;
    };

    const fileToBase64 = (file, { maxBytes = MAX_BYTES } = {}) => {
        if (!file) return null;

        if (fileTooLarge(file, maxBytes)) {
            throw new Error(
                formatMessage({
                    id: 'uploadFile.fileTooLarge',
                    defaultMessage: 'File is too large (5MB). Please select a file ≤ 5MB.'
                })
            );
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

    const isBlockedFile = file => {
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

    const processFile = async (file, handleFile) => {
        if (!file) return false;

        if (isBlockedFile(file)) {
            addToast({
                type: "error",
                icon: errorIcon,
                message: formatMessage({
                    id: 'uploadFileField.blockedFile',
                    defaultMessage: 'Unsupported formats (.exe, .bat, .cmd, .com, .pif, .scr, .vbs, .js, .jar, .app, .deb, .pkg, .dmg, .zip).'
                }),
                dismissable: true,
                timeout: 7000
            });
            return false;
        }

        try {
            const mb = (file.size / (1024 * 1024)).toFixed(2);
            const data = await fileToBase64(file, { maxBytes: MAX_BYTES });
            handleFile(
                {
                    file: {
                        data,
                        mime_type: file.type || "application/octet-stream"
                    }
                },
                `${file.name} - ${mb}MB`
            );
            return true;
        } catch (error) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message,
                dismissable: true,
                timeout: 7000
            });
            return false;
        }
    };

    const getFileFromDataTransfer = (dataTransfer) => {
        const files = dataTransfer.files;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            // Skip image files since they are handled by image upload
            if (file.type.indexOf('image') === -1) {
                return file;
            }
        }
        return null;
    };

    return {
        processFile,
        getFileFromDataTransfer,
        isBlockedFile,
        fileTooLarge
    };
};