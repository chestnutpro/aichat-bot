import {replyMessage} from './chatgpt';

async function onMessage() {

    const contactId = '123';
    let content = 'hello ';
    const result = await replyMessage(
        content,
        contactId
    );
}


onMessage().catch((err) => {
    console.error(err)
    process.exit(1)
})