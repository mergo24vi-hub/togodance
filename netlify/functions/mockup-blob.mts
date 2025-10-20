import {getStore} from "@netlify/blobs";

export default async function handler(req, context) {
    const store = getStore("main-store");
    await store.delete('votedinpoll');

    await store.set('votedinpoll:001', '[111,222]');
    await store.set('poll:001', '{"7559":1,"7703":0}');

    await store.set('votedinpoll:002', '[111,222]');
    await store.set('poll:002', '{"bg346dft5":1,"feyko563":1}');

    const raw = await store.get("poll:002");
    const value = raw !== null ? JSON.parse(raw) : null;
    return new Response(JSON.stringify({message: 'Hello from server! ' + value}));
}