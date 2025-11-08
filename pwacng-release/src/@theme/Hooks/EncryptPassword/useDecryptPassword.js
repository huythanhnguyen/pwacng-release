import CryptoJS from 'crypto-js';
const UseDecryptPassword = (encryptedPassword) => {
    const secretKey = '3f6d8d3b528bb8cfad731c75cfd82e2f99ec45f3456d1239';

    const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}

export default UseDecryptPassword
