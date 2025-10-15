import {getStore} from "@netlify/blobs";

export default async function handler(req, context) {
    const url = new URL(req.url);
    const store = getStore("main-store");
    const userid = parseInt(url.searchParams.get('userid') ?? '1234') ;
    const pollid = '001' // = parseInt(url.searchParams.get('pollid')) ?? '1234';
    const issueid = parseInt(url.searchParams.get('issueid')?? '7') ;

    const voters = JSON.parse(await store.get("votedinpoll:001"));
    if (voters.includes(userid)) return new Response(JSON.stringify({"status":"voted before"}));

    const poll = JSON.parse(await store.get("poll:001"));

    let voices = poll[issueid] ?? 0;

    voters.push(userid)
    await store.set("votedinpoll:001", JSON.stringify(voters));

    poll[issueid] = ++voices;
    await store.set("poll:001", JSON.stringify(poll));

    return new Response(JSON.stringify({
        message: "Hola, ",pollid, userid, issueid
    }));
}