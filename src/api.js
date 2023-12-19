import axios from "axios";
import { importJWK, compactDecrypt } from "jose";

async function getAllocatedAndroidToken() {
    const websocket = new WebSocket("wss://api.asvsoftware.vn/facebook/seeder");

    return new Promise((resolve, reject) => {
        websocket.onmessage = async (res) => {
            const privateKey = await importJWK(
                {
                    kty: "RSA",
                    n: "0YB011yXp4LR8nEdzYwZ2Zs3liENZxkA8B_VJ_xugRtXbb2c_mjd1ugzZ--G2zqphtCzg2Jew8a561g4rpgjvYH803Nna1gJTJwd2HJf5Cgq4cgVuFSPeJLfTeKL69ER4oRdV_9o_wJZrh5X5GKsZVm7MX9AtMs5qr8Mn8ByYp7ZUep0IapD_pncdVu7bL5aRtoZjMcnssVl-VJKhTtWKtcPpCrgZtlRRziYe0_4fGQzQdRnrBdpD_x6jKYT8FFUGbFYzeDfX2hyJm5GCkFNBy9sePJqPoCZn-wjb8NuZK5sfWhPLlq3FyFql4hCRs5gFU8bMGto1BJNosFjyxyTIQ",
                    e: "AQAB",
                    d: "CUeuZUfFs_bYg-u8zTkSgBAfEzhdlp6F6x0N3RqSboeehM7sYFyWzwk0FbuHdriPf9hIy14VIojv_VvIDvvQQXm7kEZBY4Df0JPtwoO2ea3J0HyDccnVHRssZw_M8OIu76C7XcWDiiA5hrvzWruANXEXGKcxX5DM-iJCVeU5a-LW0oxfNHNFnh6ElY9JFHEh2xW7jUtNebn1fnkMqm-oxugnpXDjdtHI42uz6e4ri6AjSf1ceZnlsTnLnU9aFne0QKcbRkoxLbwoNNA16JjZiIILt15D2hFzA7aFhHjBh4bex7vGbWRCxpZ_PO_ou-mshbCiDZqu1BqfnMvbbHnZ3Q",
                    p: "_yWm5x9tUx7mgkP_xkU6x03ZWnh4gggQKNVTZHhl6z83ZjBJ_rFg-QwMPgHlaDUNXtCuLitsocUaAsq2NHORelr7fAzQFjrovJX32xBYPzvRajtZ2e2ubkOWPT3mdaZojtm1l8ZRiVj3MQzQenwMR8BC5SJlNuA_GnViWHK57Dc",
                    q: "0jO-D6A5DgdIlj1dIsUUybdXdsP73LEE2aFYqIrotheLrvSrRha3Pv4CWRh-c4xqahR_g8HkEpdiymCViW9dG8OHZTqhiye7alhttk2H3OiX7SDC33njcj8v9aCv6MHD2sOpAH8q8Eqed6x6ySFoX3cSwmx-Q7JDknfB99O7P2c",
                    dp: "-LMxye13OeNP2r__a7sFfUnjyGzPQigr4DF4FOHKrpCzJleBeNJbbMaSlEpy262Ct93_Oh-3xsOCBCClk-Dmd_aBVbyDhHetbk1cCFsZOaHMEZmCjotAUFhu9IkGv70SA9QwTp3P0mo2oMgV2p5ZtgKw8foh4Gia-eZbk01Y7uc",
                    dq: "fAURT1DeONutRQ9hgyE6maU10pnhYR2EWg8rKw4CLWWJAanT39-JMH5Xzk94VB51rq73aTqdoSZ2oCcKM3NkQPxFR0GnjF3d4unXmWb3ESyebscUkxvsSTzkxAyRnUetkcY9UVC2ed3cz4kRTNgMJ78ub03p1XE5ExLbe6gN42M",
                    qi: "HuFaBbXrs49ySOdpiMbI7JcvPOW9GdKUsYw812u5xIHX5ssh8ex6N-JEw8yiOTrsx3WnLu7t6aco8SmkND5zLqUMHZZkyOxXW27JkFVXsHAEB7CM6kekmjNNquTQj8rp0Au638iwtIseVCa38aKjAMcBHsPonjct493essmBdyU",
                },
                "RSA-OAEP-256"
            );
            const decoder = new TextDecoder();
            const { plaintext } = await compactDecrypt(res.data, privateKey);
            resolve(decoder.decode(plaintext));
            websocket.close();
        };

        websocket.onerror = (error) => {
            reject(error);
            websocket.close();
        };
    });
}

const getToken = async () => {
    try {
        let response = await axios.get(
            "https://business.facebook.com/adsmanager/manage/campaigns?nav_source=no_referrer"
        );
        const adAccountId = /adAccountId": \\"([\d]+)\\"\\n/gm.exec(
            response.data
        )[1];
        response = await axios.get(
            `https://www.facebook.com/adsmanager/manage/campaigns?act=${adAccountId}`
        );
        console.log(response)
        const token = /__accessToken="([^"]+)"/gm.exec(response.data)[1];

        return token;
    } catch (error) {
        const response = await axios.get(
            "https://business.facebook.com/business_locations"
        );
        const access_token = /\"(EAAGNO[^\"]+)\"/gm.exec(res.data)[1];
        return access_token;
    }
};

const getCsrfToken = async () => {
    const response = await axios.get("https://m.facebook.com");
    const csrfToken = /name="fb_dtsg" value="([^"]+)"/gm.exec(response.data)[1];
    return csrfToken;
};

const standardizePostId = async (postId) => {
    const response = await axios.get(`https://m.facebook.com/${postId}`);
    const standardPostId = /ft_ent_identifier:([\d]+)/.exec(response.data)[1];
    return standardPostId;
};

const getFanpageId = async (url) => {
    const endpoint = new URL(url);
    const response = await axios.get(
        `https://m.facebook.com${endpoint.pathname}`
    );

    try {
        const pageID = /\/pages\/transparency\/([\d]+)/m.exec(response.data)[1];
        return pageID;
    } catch (error) {
        try {
            const pageID = /pageID:"([\d]+)"/m.exec(response.data)[1];
            return pageID;
        } catch (error) {
            const pageID = /"pageID":"([\d]+)"/m.exec(response.data)[1];
            return pageID;
        }
    }
};

const getGroupId = async (url) => {
    const response = await axios.get(url);
    const groupId = /"groupID":"([\d]+)"/m.exec(response.data)[1];
    return groupId;
};

const getFeed = async (url, postList) => {
    const lengthBeforeFetch = postList.length;
    const response = await axios.get(url);
    response.data.data.map((item) => {
        if (!postList.includes(item.id)) {
            postList.push(item.id);
        }
    });
    if (
        response.data?.paging?.next !== undefined &&
        response.data.data.length > 0 &&
        postList.length > lengthBeforeFetch
    ) {
        return await getFeed(response.data.paging.next, postList);
    } else {
        return postList;
    }
};

const getPostId = async (postUrl) => {
    let id;
    const endpoint = new URL(postUrl);
    const query = endpoint.searchParams;

    const STANDARD_GROUP_POST = /\/groups\/[^/]+\/permalink\/([\d]+)\/.*/g.test(
        endpoint.pathname
    );

    const STANDARD_PROFILE_POST = /\/[^/]+\/[\w]+\/([\w]+).*/g.test(
        endpoint.pathname
    );

    const PHOTOS_POST = /\/[^/]+\/photos\/[^/]+\/([\d]+).*/g.test(
        endpoint.pathname
    );

    const WATCH_POST = endpoint.pathname === "/watch/";

    const MEDIA_SET_POST =
        endpoint.pathname.includes("media_set") ||
        endpoint.pathname.includes("media/set");

    if (query.get("fbid") !== null) {
        try {
            id = await standardizePostId(query.get("fbid"));
        } catch (error) {
            id = query.get("fbid");
        }
    } else if (query.get("story_fbid") !== null) {
        id = query.get("story_fbid");
    } else if (query.get("album_id") !== null) {
        id = query.get("album_id");
    } else if (query.get("id") !== null) {
        id = query.get("id");
    } else if (STANDARD_GROUP_POST) {
        id = /\/groups\/[^/]+\/permalink\/([\d]+)\/.*/g.exec(endpoint.pathname)[1];
    } else if (STANDARD_PROFILE_POST) {
        try {
            id = /\/[^/]+\/[\w]+\/([\d]+).*/g.exec(endpoint.pathname)[1];
        } catch (error) {
            id = /\/[^/]+\/[\w]+\/([\w]+).*/g.exec(endpoint.pathname)[1];

            const response = await axios.post(
                "https://api.asvsoftware.vn/facebook/post/id/singular",
                {
                    url: postUrl,
                }
            );

            id = response.data.id;
        }
    } else if (PHOTOS_POST) {
        try {
            id = await standardizePostId(
                /\/[^/]+\/photos\/[^/]+\/([\d]+).*/g.exec(endpoint.pathname)[1]
            );
        } catch (error) {
            id = /\/[^/]+\/photos\/[^/]+\/([\d]+).*/g.exec(endpoint.pathname)[1];
        }
    } else if (WATCH_POST) {
        id = query.get("v");
    } else if (MEDIA_SET_POST) {
        id = query.get("set").replace("a.", "");
    }

    return id;
};

const getReactions = async (postId, list, fb_dtsg, cursor) => {
    try {
        let params;

        if (cursor === null) {
            params = new URLSearchParams({
                fb_dtsg: fb_dtsg,
                fb_api_caller_class: "RelayModern",
                fb_api_req_friendly_name: "CometUFIReactionsDialogQuery",
                variables: JSON.stringify({
                    count: 10,
                    feedbackTargetID: btoa(`feedback:${postId}`),
                    reactionType: "NONE",
                    scale: 1,
                }),
                doc_id: "4378501418843611",
            });
        } else {
            params = new URLSearchParams({
                fb_dtsg: fb_dtsg,
                fb_api_caller_class: "RelayModern",
                fb_api_req_friendly_name:
                    "CometUFIReactionsDialogTabContentRefetchQuery",
                variables: JSON.stringify({
                    count: 10,
                    cursor: cursor,
                    feedbackTargetID: btoa(`feedback:${postId}`),
                    reactionType: "NONE",
                    id: btoa(`feedback:${postId}`),
                    scale: 1,
                }),
                doc_id: "3809394989181095",
            });
        }

        const response = await axios({
            method: "post",
            url: "https://www.facebook.com/api/graphql/",
            data: params.toString(),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            withCredentials: true,
        });

        if (response?.data?.data?.node?.reactors?.edges !== undefined) {
            response.data.data.node.reactors.edges.map((item) => {
                if (!list.includes(item.node.id)) {
                    list.push(item.node.id);
                }
            });
        }

        if (
            response?.data?.data?.node?.reactors?.page_info?.has_next_page &&
            response?.data?.data?.node?.reactors?.page_info?.end_cursor !== cursor
        ) {
            return await getReactions(
                postId,
                list,
                fb_dtsg,
                response.data.data.node.reactors.page_info.end_cursor
            );
        } else {
            return list;
        }
    } catch (error) {
        console.error(error);
        return list;
    }
};

const getComments = async (postId, list, fb_dtsg, cursor) => {
    try {
        let params;

        if (cursor === null) {
            params = new URLSearchParams({
                fb_dtsg: fb_dtsg,
                fb_api_caller_class: "RelayModern",
                fb_api_req_friendly_name: "CometUFICommentsProviderPaginationQuery",
                variables: JSON.stringify({
                    feedbackID: btoa(`feedback:${postId}`),
                    includeNestedComments: true,
                    topLevelViewOption: "RANKED_UNFILTERED",
                    isPaginating: true,
                    first: 50,
                    scale: 1,
                }),
                doc_id: "4712008195539492",
            });
        } else {
            params = new URLSearchParams({
                fb_dtsg: fb_dtsg,
                fb_api_caller_class: "RelayModern",
                fb_api_req_friendly_name: "CometUFICommentsProviderPaginationQuery",
                variables: JSON.stringify({
                    after: cursor,
                    feedbackID: btoa(`feedback:${postId}`),
                    includeNestedComments: true,
                    topLevelViewOption: "RANKED_UNFILTERED",
                    isPaginating: true,
                    first: 50,
                    scale: 1,
                }),
                doc_id: "4712008195539492",
            });
        }

        const response = await axios({
            method: "post",
            url: "https://www.facebook.com/api/graphql/",
            data: params.toString(),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            withCredentials: true,
        });

        if (
            response?.data?.data?.feedback?.display_comments?.page_info
                ?.has_next_page &&
            response?.data?.data?.feedback?.display_comments?.page_info
                ?.end_cursor !== cursor
        ) {
            return await getComments(
                postId,
                list,
                fb_dtsg,
                response.data.data.feedback.display_comments.page_info.end_cursor
            );
        } else {
            return list;
        }
    } catch (error) {
        console.error(error);
        return list;
    }
};

const getProfileId = async (url) => {
    const endpoint = new URL(url);
    const response = await axios.get(
        `https://www.facebook.com${endpoint.pathname}`
    );
    try {
        const pageID = /\/pages\/transparency\/([\d]+)/m.exec(response.data)[1];
        return { id: pageID, type: "fanpage" };
    } catch (error) {
        try {
            const pageID = /pageID:"([\d]+)"/m.exec(response.data)[1];
            return { id: pageID, type: "fanpage" };
        } catch (error) {
            try {
                const pageID = /"pageID":"([\d]+)"/m.exec(response.data)[1];
                return { id: pageID, type: "fanpage" };
            } catch (error) {
                const userID = /"userID":"([\d]+)"/m.exec(response.data)[1];
                return { id: userID, type: "trang cá nhân" };
                try {
                    const userID = /userID:"([\d]+)"/m.exec(response.data)[1];
                    return { id: userID, type: "trang cá nhân" };
                } catch (error) { }
            }
        }
    }
};

chrome.runtime.onMessageExternal.addListener(async function (
    message,
    sender,
    sendResponse
) {
    try {
        const fb_dtsg = await getCsrfToken();

        if (message.requestFor === "token") {
            sendResponse({
                data: {
                    token: await getToken()
                }
            });

            return;
        }

        if (message.requestFor === "credentials") {
            chrome.cookies.getAll({ url: "https://www.facebook.com/" }, (cookies) => {
                let cookiestring = "";
                cookies.forEach((item) => {
                    cookiestring = cookiestring + item.name + "=" + item.value + ";";
                });

                sendResponse({
                    data: {
                        fb_dtsg: fb_dtsg,
                        cookies: cookiestring,
                    },
                });
            });

            return;
        }

        if (message.requestFor === "profile-id") {
            const result = await getProfileId(message.value);
            sendResponse({ data: result });

            return;
        }

        switch (message.scanType) {
            case "post": {
                const postId = await getPostId(message.value);

                switch (message.interactionType) {
                    case "reaction": {
                        const result = await getReactions(postId, [], fb_dtsg, null);
                        console.log(result);
                        sendResponse({ data: result });
                        break;
                    }
                    case "comment": {
                        const result = await getComments(postId, [], fb_dtsg, null);
                        sendResponse({ data: result });
                        break;
                    }
                    case "all": {
                        let result = await getReactions(postId, [], fb_dtsg, null);
                        result = await getComments(postId, result, fb_dtsg, null);
                        sendResponse({ data: result });
                        break;
                    }
                }
                break;
            }

            case "fanpage": {
                let postList;
                const fanpageId = message.value;
                const token = await getAllocatedAndroidToken();
                if (message.since === "0") {
                    postList = await getFeed(
                        `https://graph.facebook.com/v9.0/${fanpageId}/feed?fields=id&limit=100&access_token=${token}`,
                        []
                    );
                } else {
                    postList = await getFeed(
                        `https://graph.facebook.com/v9.0/${fanpageId}/feed?fields=id&since=${Math.floor(new Date().getTime() / 1000) - parseInt(message.since)}&limit=100&access_token=${token}`,
                        []
                    );
                }

                // Count the number of posts
                const totalPosts = postList.length;

                let interactionList = [];

                for (let i = 0; i < postList.length; i++) {
                    const currentPostId = postList[i];
                    const postId = currentPostId.includes("_") ? currentPostId.split("_")[1] : currentPostId;

                    switch (message.interactionType) {
                        case "reaction": {
                            interactionList = interactionList.concat(await getReactions(postId, [], fb_dtsg, null));
                            break;
                        }
                        case "comment": {
                            interactionList = interactionList.concat(await getComments(postId, [], fb_dtsg, null));
                            break;
                        }
                        case "all": {
                            interactionList = interactionList.concat(await getReactions(postId, [], fb_dtsg, null));
                            interactionList = interactionList.concat(await getComments(postId, [], fb_dtsg, null));
                            break;
                        }
                    }

                    // Calculate the progress
                    const progress = Math.floor(((i + 1) / totalPosts) * 100);

                    // Send the progress to https://audinsights.app/
                    chrome.tabs.query({ url: 'https://audinsights.app/*' }, (tabs) => {
                        // Send message to every tab found
                        tabs.forEach((tab) => {
                            chrome.tabs.executeScript(tab.id, {
                                code: `window.postMessage({ type: '', progress: ${progress} }, '*');`
                            });
                        });
                    });
                }

                sendResponse({ data: interactionList });
                break;
            }

            case "group": {
                let postList;
                const groupId = await getGroupId(message.value);
                const token = await getToken();
                if (message.since === "0") {
                    postList = await getFeed(
                        `https://graph.facebook.com/v9.0/${groupId}/feed?fields=id&limit=100&access_token=${token}`,
                        []
                    );
                } else {
                    postList = await getFeed(
                        `https://graph.facebook.com/v9.0/${groupId}/feed?fields=id&since=${Math.floor(new Date().getTime() / 1000) - parseInt(message.since)
                        }&limit=100&access_token=${token}`,
                        []
                    );
                }

                const result = await postList.reduce(
                    async (accPromise, currentPostId) => {
                        const postId = currentPostId.includes("_")
                            ? currentPostId.split("_")[1]
                            : currentPostId;
                        switch (interactionType) {
                            case "reaction": {
                                const acc = await accPromise;
                                const interactionList = await getReactions(
                                    postId,
                                    acc,
                                    fb_dtsg,
                                    null
                                );
                                return interactionList;
                                break;
                            }
                            case "comment": {
                                const acc = await accPromise;
                                const interactionList = await getComments(
                                    postId,
                                    acc,
                                    fb_dtsg,
                                    null
                                );
                                return interactionList;
                                break;
                            }
                            case "all": {
                                const acc = await accPromise;
                                let interactionList = await getReactions(
                                    postId,
                                    acc,
                                    fb_dtsg,
                                    null
                                );
                                interactionList = await getComments(
                                    postId,
                                    interactionList,
                                    fb_dtsg,
                                    null
                                );
                                return interactionList;
                                break;
                            }
                        }
                    },
                    Promise.resolve([])
                );

                sendResponse({ data: result });
                break;
            }
        }
    } catch (error) {
        console.error(error);
        sendResponse({ error: error.message });
    }
});
