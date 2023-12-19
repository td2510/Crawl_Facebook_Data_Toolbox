import { useState } from "react";
import { Transition } from "@headlessui/react";
import { Player } from "@lottiefiles/react-lottie-player";
import axios from "axios";
import { useAllocatedAndroidToken } from "../../hooks/token";

const InteractionScanner = () => {
  const [subjectId, setSubjectId] = useState(undefined);
  const [scanType, setScanType] = useState("post");
  const [interactionType, setInteractionType] = useState("reaction");
  const [since, setSince] = useState("86400");
  const [result, setResult] = useState("");
  const [count, setCounted] = useState(0);
  const [isError, setError] = useState(false);
  const [isFetching, setFetching] = useState(false);
  const [isCompleted, setFinished] = useState(false);
  const [allocatedAndroidToken, getAllocatedAndroidToken] = useAllocatedAndroidToken();

  const textFile = {};
  const makeTextFile = (text, type) => {
    const data = new global.Blob([text], { type: "text/plain" });

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile[type] !== null) {
      window.URL.revokeObjectURL(textFile[type]);
    }
    textFile[type] = window.URL.createObjectURL(data);
    return textFile[type];
  };

  const getToken = async () => {
    try {
      let response = await axios.get(
        "https://business.facebook.com/adsmanager/manage/campaigns?nav_source=no_referrer"
      );
      const adAccountId = /adAccountId: \\"([\d]+)\\"\\n/gm.exec(
        response.data
      )[1];
      response = await axios.get(
        `https://www.facebook.com/adsmanager/manage/campaigns?act=${adAccountId}`
      );
      const token = /__accessToken="([^"]+)"/gm.exec(response.data)[1];
      return token;
    } catch (error) {
      const response = await axios.get(
        "https://business.facebook.com/business_locations"
      );
      const access_token = /\"(EAAGNO[^\"]+)\"/gm.exec(res.data)[1];
      console.log(access_token);
      return access_token;
    }
  };

  const getCsrfToken = async () => {
    const response = await axios.get("https://mbasic.facebook.com");
    const csrfToken = /name="fb_dtsg" value="([^"]+)"/gm.exec(response.data)[1];
    return csrfToken;
  };

  const standardizePostId = async (postId) => {
    const response = await axios.get(`https://mbasic.facebook.com/${postId}`);
    const standardPostId = /ft_ent_identifier:([\d]+)/.exec(response.data)[1];
    return standardPostId;
  };

  const getFanpageId = async (url) => {
    const endpoint = new URL(url);
    const response = await axios.get(
      `https://www.facebook.com${endpoint.pathname}`
    );
    try {
      const pageID = /\/pages\/transparency\/([\d]+)/m.exec(response.data)[1];
      return pageID;
    } catch (error) {
      try {
        const pageID = /pageID:"([\d]+)"/m.exec(response.data)[1];
        return pageID;
      } catch (error) {
        try {
          const pageID = /"pageID":"([\d]+)"/m.exec(response.data)[1];
          return pageID;
        } catch (error) {
          const userID = /"userID":"([\d]+)"/m.exec(response.data)[1];
          return userID;
          try {
            const userID = /userID:"([\d]+)"/m.exec(response.data)[1];
            return { id: userID, type: "trang cá nhân" };
          } catch (error) { }
        }
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
      id = /\/groups\/[^/]+\/permalink\/([\d]+)\/.*/g.exec(
        endpoint.pathname
      )[1];
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

      setCounted(list.length);

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
        response?.data?.data?.feedback?.display_comments?.edges !== undefined
      ) {
        response.data.data.feedback.display_comments.edges.map((item) => {
          if (!list.includes(item.node.author.id)) {
            list.push(item.node.author.id + "|name: " + item.node.author.name + "|gender: " + item.node.author.gender + "|text: " + item.node.body.text);
          }
        });
      }

      setCounted(list.length);

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

  const scanButtonOnClick = async () => {
    try {
      setError(false);
      setResult("");
      setFinished(false);
      setFetching(true);
      setCounted(0);

      const fb_dtsg = await getCsrfToken();

      switch (scanType) {
        case "post": {
          const postId = await getPostId(document.getElementById("url").value);
          setSubjectId(postId);

          switch (interactionType) {
            case "reaction": {
              const result = await getReactions(postId, [], fb_dtsg, null);
              setTimeout(() => setFetching(false), 3000);
              setFinished(true);
              setResult(result.join("\n"));
              break;
            }
            case "comment": {
              const result = await getComments(postId, [], fb_dtsg, null);
              setTimeout(() => setFetching(false), 3000);
              setFinished(true);
              setResult(result.join("\n"));
              break;
            }
            case "all": {
              let result = await getReactions(postId, [], fb_dtsg, null);
              result = await getComments(postId, result, fb_dtsg, null);
              setTimeout(() => setFetching(false), 3000);
              setFinished(true);
              setResult(result.join("\n"));
              break;
            }
          }
          break;
        }
        case "fanpage": {
          let postList;
          const fanpageId = await getFanpageId(
            document.getElementById("url").value
          );
          console.log(fanpageId);
          setSubjectId(fanpageId);
          //const token = await getToken();
          if (since === "0") {
            postList = await getFeed(
              `https://graph.facebook.com/v9.0/${fanpageId}/feed?fields=id&limit=100&access_token=${allocatedAndroidToken}`,
              []
            );
          } else {
            postList = await getFeed(
              `https://graph.facebook.com/v9.0/${fanpageId}/feed?fields=id&since=${Math.floor(new Date().getTime() / 1000) - parseInt(since)
              }&limit=100&access_token=${allocatedAndroidToken}`,
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

          setTimeout(() => setFetching(false), 3000);
          setFinished(true);
          setResult(result.join("\n"));
          break;
        }
        case "group": {
          let postList;
          const groupId = await getGroupId(
            document.getElementById("url").value
          );
          setSubjectId(groupId);
          const token = localStorage.token;
          if (since === "0") {
            postList = await getFeed(
              `https://graph.facebook.com/v9.0/${groupId}/feed?fields=id&limit=100&access_token=${token}`,
              []
            );
          } else {
            postList = await getFeed(
              `https://graph.facebook.com/v9.0/${groupId}/feed?fields=id&since=${Math.floor(new Date().getTime() / 1000) - parseInt(since)
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

          setTimeout(() => setFetching(false), 3000);
          setFinished(true);
          setResult(result.join("\n"));
          break;
        }
      }
    } catch (error) {
      console.log(error);
      setFetching(false);
      setError(true);
      setFinished(true);
      if (list !== undefined) setResult(list.join("\n"));
    }
  };

  return (
    <div className="container mt-8">
      <div className="rounded-md bg-green-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Chú ý</h3>
            <div className="mt-2 text-sm text-green-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Công cụ Toolbox sẽ sử dụng Facebook đang đăng nhập trên
                  cùng trình duyệt để thực hiện khai thác. Ngoài việc xin quyền
                  khai thác, Toolbox sẽ không gây ra bất cứ vấn đề gì. Bằng
                  cách sử dụng công cụ Toolbox, đồng nghĩa bạn đã chấp nhận
                  điều khoản này.
                </li>
                <li>
                  Đối với nhóm riêng tư, bạn cần phải tham gia vào nhóm trước
                  khi khai thác.
                </li>
                <li>
                  Đảm bảo tài khoản Facebook của bạn đang hoạt động bình thường
                  không giới hạn các chức năng
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-8">
        {/* Cột chọn kiểu quét */}
        <div className="container">
          <fieldset>
            <legend className="sr-only">Chọn kiểu quét</legend>
            <label className="block text-sm font-medium text-gray-700 p-2">
              Chọn kiểu quét
            </label>

            <div
              className="bg-white rounded-md -space-y-px"
              onChange={(e) => setScanType(e.target.value)}
            >
              {/* On: "bg-indigo-50 border-indigo-200 z-10", Off: "border-gray-200" */}
              <div
                className={`${scanType === "post"
                  ? "bg-indigo-50 border-indigo-200 z-10"
                  : "border-gray-200"
                  } relative border rounded-tl-md rounded-tr-md p-4 flex`}
              >
                <div className="flex items-center h-5">
                  <input
                    id="scan-settings-option-0"
                    name="scan_setting"
                    type="radio"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 cursor-pointer border-gray-300"
                    value="post"
                    defaultChecked
                  />
                </div>
                <label
                  htmlFor="scan-settings-option-0"
                  className="ml-3 flex flex-col cursor-pointer"
                >
                  {/* On: "text-indigo-900", Off: "text-gray-900" */}
                  <span className="block text-sm font-medium">
                    Quét bài viết
                  </span>
                  {/* On: "text-indigo-700", Off: "text-gray-500" */}
                  <span className="block text-sm">
                    Chỉ quét tương tác một bài viết được chỉ định
                  </span>
                </label>
              </div>

              {/* On: "bg-indigo-50 border-indigo-200 z-10", Off: "border-gray-200" */}
              <div
                className={`${scanType === "fanpage"
                  ? "bg-indigo-50 border-indigo-200 z-10"
                  : "border-gray-200"
                  } relative border border-gray-200 p-4 flex`}
              >
                <div className="flex items-center h-5">
                  <input
                    id="scan-settings-option-1"
                    name="scan_setting"
                    type="radio"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 cursor-pointer border-gray-300"
                    value="fanpage"
                  />
                </div>
                <label
                  htmlFor="scan-settings-option-1"
                  className="ml-3 flex flex-col cursor-pointer"
                >
                  {/* On: "text-indigo-900", Off: "text-gray-900" */}
                  <span className="block text-sm font-medium">
                    Quét fanpage
                  </span>
                  {/* On: "text-indigo-700", Off: "text-gray-500" */}
                  <span className="block text-sm">
                    Quét toàn bộ tương tác của Facebook fanpage
                  </span>
                </label>
              </div>

              {/* On: "bg-indigo-50 border-indigo-200 z-10", Off: "border-gray-200" */}
              <div
                className={`${scanType === "group"
                  ? "bg-indigo-50 border-indigo-200 z-10"
                  : "border-gray-200"
                  } relative border border-gray-200 rounded-bl-md rounded-br-md p-4 flex`}
              >
                <div className="flex items-center h-5">
                  <input
                    id="scan-settings-option-2"
                    name="scan_setting"
                    type="radio"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 cursor-pointer border-gray-300"
                    value="group"
                  />
                </div>
                <label
                  htmlFor="scan-settings-option-2"
                  className="ml-3 flex flex-col cursor-pointer"
                >
                  {/* On: "text-indigo-900", Off: "text-gray-900" */}
                  <span className="block text-sm font-medium">Quét group</span>
                  {/* On: "text-indigo-700", Off: "text-gray-500" */}
                  <span className="block text-sm">
                    Quét toàn bộ tương tác của Facebook group
                  </span>
                </label>
              </div>
            </div>
          </fieldset>
        </div>

        {/* Cột chọn loại tương tác */}
        <div className="container">
          <fieldset>
            <legend className="sr-only">Chọn kiểu tương tác</legend>
            <label className="block text-sm font-medium text-gray-700 p-2">
              Chọn kiểu tương tác
            </label>

            <div
              className="bg-white rounded-md -space-y-px"
              onChange={(e) => setInteractionType(e.target.value)}
            >
              {/* On: "bg-indigo-50 border-indigo-200 z-10", Off: "border-gray-200" */}
              <div
                className={`${interactionType === "reaction"
                  ? "bg-indigo-50 border-indigo-200 z-10"
                  : "border-gray-200"
                  } relative border rounded-tl-md rounded-tr-md p-4 flex`}
              >
                <div className="flex items-center h-5">
                  <input
                    id="interaction-settings-option-0"
                    name="interaction_setting"
                    type="radio"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 cursor-pointer border-gray-300"
                    value="reaction"
                    defaultChecked
                  />
                </div>
                <label
                  htmlFor="interaction-settings-option-0"
                  className="ml-3 flex flex-col cursor-pointer"
                >
                  {/* On: "text-indigo-900", Off: "text-gray-900" */}
                  <span className="block text-sm font-medium">Reaction</span>
                  {/* On: "text-indigo-700", Off: "text-gray-500" */}
                  <span className="block text-sm">
                    Lượt thích, thả tim, giận dữ...
                  </span>
                </label>
              </div>

              {/* On: "bg-indigo-50 border-indigo-200 z-10", Off: "border-gray-200" */}
              <div
                className={`${interactionType === "comment"
                  ? "bg-indigo-50 border-indigo-200 z-10"
                  : "border-gray-200"
                  } relative border border-gray-200 p-4 flex`}
              >
                <div className="flex items-center h-5">
                  <input
                    id="interaction-settings-option-1"
                    name="interaction_setting"
                    type="radio"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 cursor-pointer border-gray-300"
                    value="comment"
                  />
                </div>
                <label
                  htmlFor="interaction-settings-option-1"
                  className="ml-3 flex flex-col cursor-pointer"
                >
                  {/* On: "text-indigo-900", Off: "text-gray-900" */}
                  <span className="block text-sm font-medium">Comment</span>
                  {/* On: "text-indigo-700", Off: "text-gray-500" */}
                  <span className="block text-sm">Lượt bình luận</span>
                </label>
              </div>

              {/* On: "bg-indigo-50 border-indigo-200 z-10", Off: "border-gray-200" */}
              <div
                className={`${interactionType === "all"
                  ? "bg-indigo-50 border-indigo-200 z-10"
                  : "border-gray-200"
                  } relative border border-gray-200 rounded-bl-md rounded-br-md p-4 flex`}
              >
                <div className="flex items-center h-5">
                  <input
                    id="interaction-settings-option-2"
                    name="interaction_setting"
                    type="radio"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 cursor-pointer border-gray-300"
                    value="all"
                  />
                </div>
                <label
                  htmlFor="interaction-settings-option-2"
                  className="ml-3 flex flex-col cursor-pointer"
                >
                  {/* On: "text-indigo-900", Off: "text-gray-900" */}
                  <span className="block text-sm font-medium">Tất cả</span>
                  {/* On: "text-indigo-700", Off: "text-gray-500" */}
                  <span className="block text-sm">
                    Lấy tất cả lượt tương tác reaction và comment
                  </span>
                </label>
              </div>
            </div>
          </fieldset>
        </div>
      </ul>

      <Transition show={scanType === "post"}>
        <label
          htmlFor="url"
          className="block text-sm font-medium text-gray-700 mt-8"
        >
          Nhập URL của bài viết cần quét
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            name="url"
            id="url"
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
          />
          <button
            className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => scanButtonOnClick()}
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span>Quét</span>
          </button>
        </div>
      </Transition>

      <Transition show={scanType === "fanpage" || scanType === "group"}>
        <label
          htmlFor="url"
          className="block text-sm font-medium text-gray-700 mt-8"
        >
          Chọn khoảng thời gian và nhập URL của{" "}
          {scanType === "fanpage" ? "fanpage" : "group"} cần quét
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <div>
            <label htmlFor="since" className="sr-only">
              Khoảng thời gian cần quét
            </label>
            <select
              id="since"
              name="since"
              onChange={(e) => setSince(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 h-full py-0 pl-3 pr-7 border-gray-300 bg-transparent text-gray-500 sm:text-sm rounded-md"
            >
              <option value="86400">1 ngày</option>
              <option value="259200">3 ngày</option>
              <option value="604800">1 tuần</option>
              <option value="1209600">2 tuần</option>
              <option value="2629746">1 tháng</option>
              <option value="7889238">3 tháng</option>
              <option value="15778476">6 tháng</option>
              <option value="31556952">1 năm</option>
              <option value="94670856">3 năm</option>
              <option value="0">Toàn bộ</option>
            </select>
          </div>
          <input
            type="text"
            name="url"
            id="url"
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
          />
          <button
            className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => scanButtonOnClick()}
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span>Quét</span>
          </button>
        </div>
      </Transition>

      {/* Hiện khi có lỗi */}
      <Transition
        enter="transition-opacity ease-linear duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity ease-linear duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        aria-hidden="true"
        className="mt-10"
        show={isError === true}
      >
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Xử lý thất bại
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Hãy chắc rằng bạn nhập đúng URL Facebook bạn cần quét</li>
                  <li>
                    Đảm bảo bạn đang đăng nhập Facebook trên trình duyệt này
                  </li>
                  <li>
                    Đảm bảo tài khoản Facebook của bạn không bị khóa các chức
                    năng
                  </li>
                  <li>
                    Nếu thỏa mãn các điều kiện phía trên vui lòng kiểm tra lại
                    kết nối mạng và thử lại lần nữa
                  </li>
                  <li>
                    Danh sách xuất ra (nếu có) khi xử lý thất bại có thể không
                    đầy đủ
                  </li>
                  <li>
                    Nếu vẫn không thành công hãy gọi cho đội ngũ  để
                    được hỗ trợ
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      {/* Hiện khi đang xử lý nhưng chưa gặp lỗi */}
      <Transition
        enter="transition-opacity ease-linear duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        aria-hidden="true"
        className="mt-10"
        show={isFetching === true && isError === false}
      >
        {isCompleted === false ? (
          <Player
            autoplay
            loop
            src={require("../../assets/38287-scanning-searching-for-data.json")}
            style={{ height: "300px", width: "300px" }}
          ></Player>
        ) : (
          <Player
            autoplay
            src={require("../../assets/972-done.json")}
            style={{ height: "300px", width: "300px" }}
          ></Player>
        )}
        <div className="flex justify-center">
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {`Đang xử lý, đã lấy được ${count} UID`}
          </span>
        </div>
      </Transition>

      {/* Hiện khi xử lý thành công */}
      <Transition
        enter="transition-opacity ease-linear duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity ease-linear duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        aria-hidden="true"
        className="mt-10"
        show={isFetching === false && isError === false && isCompleted === true}
      >
        <label className="block text-sm font-medium text-gray-700">
          Tập tin của bạn đã sẵn sàng để tải xuống
        </label>
        <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div className="flex text-sm text-gray-600 justify-center">
              <a
                className="cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                href={makeTextFile(result, "UID_LIST")}
                download={`${subjectId}.txt`}
              >
                {`${subjectId}.txt`}
              </a>
            </div>
            <p className="text-xs text-gray-500">
              Đã khai thác được {count} người. Dữ liệu chia thành từng dòng, mỗi
              dòng là 1 UID người dùng
            </p>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default InteractionScanner;
