import {getStore} from "@netlify/blobs";

export default async function handler(req, context) {
    const store = getStore("main-store");
    const raw1 = JSON.parse(await store.get("votedinpoll:001"));
    const raw2 = JSON.parse(await store.get("poll:001"));

    //const value = raw1 !== null ? JSON.parse(raw1) : null;

    return new Response(JSON.stringify({
        message: "Hola, ",
        voted: raw1,
        poll: raw2
    }));
}