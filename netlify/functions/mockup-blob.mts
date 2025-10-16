import {getStore} from "@netlify/blobs";

export default async function handler(req, context) {
    const store = getStore("main-store");

    await store.set('votedinpoll:001', '[111,222]');
    await store.set('poll:001', '{"7559":1,"7703":0}');
    await store.delete('votedinpoll');

    const raw = await store.get("votedinpoll:001");
    const value = raw !== null ? JSON.parse(raw) : null;
    return new Response(JSON.stringify({message: 'Hello from server! ' + value}));
}