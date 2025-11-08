import CryptoJS from 'crypto-js';
const UseEncryptPassword = (password) => {
    const secretKey = '3f6d8d3b528bb8cfad731c75cfd82e2f99ec45f3456d1239';

    return CryptoJS.AES.encrypt(password, secretKey).toString();
}

export default UseEncryptPassword
