import {getStore} from "@netlify/blobs";

export default async function handler(req, context) {
    const store = getStore("main-store");

    await store.set('votedinpoll:001', '[444,4333]');
    await store.set('poll:001', '{"7559":2,"7703":1}');
    await store.delete('votedinpoll');

    const raw = await store.get("votedinpoll:001");
    const value = raw !== null ? JSON.parse(raw) : null;
    return new Response(JSON.stringify({message: 'Hello from server! ' + value}));
}