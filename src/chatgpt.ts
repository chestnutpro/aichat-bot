import {ChatGPTAPI} from 'chatgpt';
import pTimeout from 'p-timeout';
import config from './config';
import {retryRequest} from './utils';

const conversationMap = new Map();
const chatGPT = new ChatGPTAPI({sessionToken: config.chatGPTSessionToken});
console.log(config.chatGPTSessionToken);

// 重置对话
function resetConversation(contactId: string) {
    if (conversationMap.has(contactId)) {
        conversationMap.delete(contactId);
    }
}

function getConversation(contactId: string) {
    if (conversationMap.has(contactId)) {
        return conversationMap.get(contactId);
    }
    const conversation = chatGPT.getConversation();
    conversationMap.set(contactId, conversation);
    return conversation;
}

async function getChatGPTReply(content: string, contactId: string) {
    const currentConversation = getConversation(contactId);
    // send a message and wait for the response
    const threeMinutesMs = 3 * 60 * 1000;
    console.log(111111111111111)
    const response = await pTimeout(currentConversation.sendMessage(content), {
        milliseconds: threeMinutesMs,
        message: 'ChatGPT timed out waiting for response',
    });
    console.log('response: ', response);
    // response is a markdown-formatted string
    return response;
}

export async function replyMessage(content: string, contactId: string) {
    try {
        if (
            content.trim().toLocaleLowerCase() === config.resetKey.toLocaleLowerCase()
        ) {
            resetConversation(contactId);
            return;
        }
        const message = await retryRequest(
            () => getChatGPTReply(content, contactId),
            config.retryTimes,
            500
        );

        return message
    } catch (e: any) {
        console.error(e);
        if (e.message.includes('timed out')) {

            return content +
                '\n-----------\nERROR: Please try again, ChatGPT timed out for waiting response.'
        }
        conversationMap.delete(contactId);
    }
}
