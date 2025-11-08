import { handleMessageFromClient } from './Utilities/messageHandler';
import setupWorkbox from './setupWorkbox';
import registerRoutes from './registerRoutes';
import registerMessageHandlers from './registerMessageHandlers';

importScripts('https://st-a.cdp.asia/antsomiSDKsw.js');

setupWorkbox();

registerRoutes();

registerMessageHandlers();

self.addEventListener('message', e => {
    const { type, payload } = e.data;

    handleMessageFromClient(type, payload, e);
});
