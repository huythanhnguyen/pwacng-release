import React, { useRef } from "react";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';
import {useToasts} from "@magento/peregrine";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from "./uploadFileField.module.scss";
import {useIntl} from "react-intl";
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

const UploadFileField = props => {
    const {
        onChange,
        accept = "*/*",
        name = "file",
        fileResetKey,
        absolute = false
    } = props
    const classes = useStyle(defaultClasses, props.classes);
    const { formatMessage } = useIntl();
    const [, { addToast }] = useToasts();
    const inputRef = useRef(null);

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

    const onFile = async e => {
        const file = e.target.files?.[0];
        if (!file) return;
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
            e.target.value = "";
            return;
        }
        try {
            const mb = (file.size / (1024 * 1024)).toFixed(2);
            const data = await fileToBase64(file, { maxBytes: MAX_BYTES });
            onChange?.(
                {
                    [name]: {
                        data,
                        mime_type: file.type || "application/octet-stream"
                    }
                },
                `${file.name} - ${mb}MB`
            );
        } catch (error) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message,
                dismissable: true,
                timeout: 7000
            });
        } finally {
            e.target.value = ''; // cho phép chọn lại cùng file
        }
    };
    return (
        <label className={absolute ? `${classes.root} ${classes.rootAbsolute}` : classes.root}>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={onFile}
                key={fileResetKey}
            />
            <span className={classes.inputTrigger} title={formatMessage({ id: 'uploadFile.trigger', defaultMessage: 'Upload File' })}><span>Upload File</span></span> {/* File Preview */}
        </label>
    );
}
export default UploadFileField
