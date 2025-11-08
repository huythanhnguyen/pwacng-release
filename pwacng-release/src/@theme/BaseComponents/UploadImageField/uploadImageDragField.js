import React, { useRef, useState, useCallback } from "react";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';
import {useToasts} from "@magento/peregrine";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from "./uploadImageDragField.module.scss";
import {FormattedMessage, useIntl} from "react-intl";
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

const UploadImageDragField = props => {
    const {
        onChange,
        accept = "image/*",
        name = "image",
        imageResetKey
    } = props
    const classes = useStyle(defaultClasses, props.classes);
    const { formatMessage } = useIntl();
    const [, { addToast }] = useToasts();
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const fileTooLarge = (fileOrBlob, maxBytes = MAX_BYTES) => {
        return (fileOrBlob?.size || 0) > maxBytes;
    }

    const fileToBase64 = (file, { maxBytes = MAX_BYTES } = {}) => {
        if (!file) return null;

        if (fileTooLarge(file, maxBytes)) {
            // const mb = (file.size / (1024 * 1024)).toFixed(2);
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
    }

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

    const validateFile = useCallback(
        file => {
            if (!file) return formatMessage({ id: "uploadImageField.noFile", defaultMessage: "No file selected." });
            if (isBlockedFile(file))
                return formatMessage({
                    id: "uploadImageField.blockedFile",
                    defaultMessage: "Unsupported formats (GIF, HEIC/RAW, PDF). Only JPG/PNG/WEBP ≤ 5MB are accepted."
                });
            if ((file.size || 0) > MAX_BYTES)
                return formatMessage({
                    id: "uploadFile.fileTooLarge",
                    defaultMessage: "File is too large (5MB). Please select a file ≤ 5MB."
                });
            return null;
        },
        [formatMessage]
    );

    const processFile = useCallback(
        async file => {
            const err = validateFile(file);
            if (err) {
                addToast({ type: "error", icon: errorIcon, message: err, dismissable: true, timeout: 7000 });
                return;
            }
            const mb = (file.size / (1024 * 1024)).toFixed(2);
            const data = await fileToBase64(file);
            onChange?.({ [name]: { data, mime_type: file.type || "application/octet-stream" } }, `${file.name} - ${mb}MB`);
        },
        [validateFile, addToast, onChange, name]
    );

    const onFile = async e => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            await processFile(file);
        } finally {
            e.target.value = "";
        }
    };

    const onDragOver = e => {
        e.preventDefault();
        e.stopPropagation();
        if (!dragging) setDragging(true);
    };

    const onDragLeave = e => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const onDrop = async e => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        const dt = e.dataTransfer;
        const file = dt?.files && dt.files.length > 0 ? dt.files[0] : null;
        if (file) await processFile(file);
    };

    return (
        <label
            className={`${classes.root} ${dragging ? classes.dragActive : ""}`}
            onDragOver={onDragOver}
            onDragEnter={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={onFile}
                key={imageResetKey}
            />
            <span className={classes.inputTrigger}>
                <span>
                    <FormattedMessage
                        id={'uploadImage.dragImage'}
                        defaultMessage={'Drag image here or'}
                    />
                    {' '}
                    <span className={classes.trigger}>
                        <FormattedMessage
                            id={'uploadImage.uploadImage'}
                            defaultMessage={'upload image'}
                        />
                    </span>
                </span>
            </span>
        </label>
    );
}
export default UploadImageDragField
