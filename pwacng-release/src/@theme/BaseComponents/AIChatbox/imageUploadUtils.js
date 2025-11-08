import React from "react";
import { useToasts } from "@magento/peregrine";
import { useIntl } from "react-intl";
import { AlertCircle as AlertCircleIcon } from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';

const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

const BLOCKED_MIME = new Set([
    "image/gif",
    "application/pdf",
    "image/heic",
    "image/heif",
    "image/heic-sequence",
    "image/heif-sequence",
    "image/x-canon-cr2",
    "image/x-canon-cr3",
    "image/x-nikon-nef",
    "image/x-sony-arw",
    "image/x-adobe-dng",
    "image/dng",
    "image/x-panasonic-rw2",
    "image/x-olympus-orf",
    "image/x-fuji-raf",
    "image/x-samsung-srw",
    "image/x-pentax-pef",
    "image/x-epson-erf",
    "image/x-kodak-dcr",
    "image/x-hasselblad-3fr",
    "image/x-leica-rwl",
    "image/x-raw"
]);

const BLOCKED_EXT = new Set([
    ".gif",
    ".pdf",
    ".heic",
    ".heif",
    ".raw",
    ".arw",
    ".cr2",
    ".cr3",
    ".nef",
    ".orf",
    ".rw2",
    ".raf",
    ".dng",
    ".srw",
    ".pef",
    ".erf",
    ".kdc",
    ".mrw",
    ".3fr",
    ".rwl",
    ".dcr",
    ".rwz"
]);

export const useImageUploadUtils = () => {
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

    const processImageFile = async (file, handleImage) => {
        if (!file) return false;

        if (isBlockedFile(file)) {
            addToast({
                type: "error",
                icon: errorIcon,
                message: formatMessage({
                    id: 'uploadImageField.blockedFile',
                    defaultMessage: 'Unsupported formats (GIF, HEIC/RAW, PDF). Only JPG/PNG/WEBP ≤ 5MB are accepted.'
                }),
                dismissable: true,
                timeout: 7000
            });
            return false;
        }

        try {
            const mb = (file.size / (1024 * 1024)).toFixed(2);
            const data = await fileToBase64(file, { maxBytes: MAX_BYTES });
            handleImage(
                {
                    image: {
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

    const getImageFromClipboard = async (clipboardData) => {
        const items = clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.indexOf('image') !== -1) {
                return item.getAsFile();
            }
        }
        return null;
    };

    const getImageFromDataTransfer = (dataTransfer) => {
        const files = dataTransfer.files;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.indexOf('image') !== -1) {
                return file;
            }
        }
        return null;
    };

    return {
        processImageFile,
        getImageFromClipboard,
        getImageFromDataTransfer,
        isBlockedFile,
        fileTooLarge
    };
};
