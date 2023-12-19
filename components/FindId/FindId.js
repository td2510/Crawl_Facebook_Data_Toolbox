import { useState, useEffect } from "react";
import { Transition } from "@headlessui/react";
import { Player } from "@lottiefiles/react-lottie-player";
import Notifications from "../Notifications/Notifications";
import copy from "copy-to-clipboard";
import axios from "axios";

const FindId = () => {
  const [result, setResult] = useState({});
  const [isError, setError] = useState(false);
  const [isFetching, setFetching] = useState(false);
  const [isCompleted, setFinished] = useState(false);
  const [showNotification, setNotificationVisibility] = useState({
    type: "success",
    show: false,
    title: "Thành công",
    content: "Đã copy vào clipboard",
    setNotificationVisibility: setNotificationVisibility,
  });

  useEffect(() => {
    if (showNotification.show) {
      setTimeout(
        () =>
          setNotificationVisibility(
            Object.assign({}, showNotification, { show: false })
          ),
        5000
      );
    }
  }, [showNotification]);

  const copyToClipboard = (content) => {
    try {
      copy(content);
      setNotificationVisibility({
        type: "success",
        show: true,
        title: "Thành công",
        content: "Đã copy vào clipboard",
        setNotificationVisibility: setNotificationVisibility,
      });
    } catch (err) {
      setNotificationVisibility({
        type: "error",
        show: true,
        title: "Thất bại",
        content: "Đã xảy ra lỗi khi copy vào clipboard",
        setNotificationVisibility: setNotificationVisibility,
      });
    }
  };

  const standardizePostId = async (postId) => {
    const response = await axios.get(`https://m.facebook.com/${postId}`);
    const standardPostId = /ft_ent_identifier:([\d]+)/.exec(response.data)[1];
    return standardPostId;
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

  const getGroupId = async (url) => {
    try {
      const response = await axios.get(url);
      const groupId = /"groupID":"([\d]+)"/m.exec(response.data)[1];
      return { id: groupId, type: "group" };
    } catch (error) {
      const response = await axios.get(url);
      const groupId = /groupID:"([\d]+)"/m.exec(response.data)[1];
      return { id: groupId, type: "group" };
    }
  };

  const getPostId = async (postUrl) => {
    let id;
    const endpoint = new URL(postUrl);
    const query = endpoint.searchParams;

    const NEW_STANDARD_PHOTOS_POST_TYPE_1 =
      query.get("set") !== null && query.get("set").includes("pcb.");

    const NEW_STANDARD_PHOTOS_POST_TYPE_2 =
      endpoint.pathname.includes("/photos/pcb.");

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

    if (NEW_STANDARD_PHOTOS_POST_TYPE_1) {
      id = query.get("set").split(".")[1];
    } else if (NEW_STANDARD_PHOTOS_POST_TYPE_2) {
      id = /^\/[^/]+\/photos\/pcb\.([\d]+)\/[\d]+\/?.*/g.exec(
        endpoint.pathname
      )[1];
    } else if (query.get("fbid") !== null) {
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

    if (id === undefined) {
      throw "Không tìm thấy id bài viết";
    }

    return { id: id, type: "bài viết" };
  };

  const findId = async () => {
    try {
      setError(false);
      setResult({});
      setFinished(false);
      setFetching(true);

      const endpoint = new URL(document.getElementById("url").value);
      const STANDARD_PROFILE_URL =
        /^\/[^\/]+\/?$/g.test(endpoint.pathname) &&
        endpoint.pathname !== "/permalink.php" &&
        endpoint.pathname !== "/photo" &&
        endpoint.pathname !== "/photo/" &&
        endpoint.pathname !== "/watch" &&
        endpoint.pathname !== "/watch/";
      const STANDARD_GROUP_URL = /^\/groups\/[^\/]+\/?$/g.test(
        endpoint.pathname
      );

      if (STANDARD_PROFILE_URL) {
        const response = await getProfileId(
          document.getElementById("url").value
        );
        setTimeout(() => setFetching(false), 3000);
        setFinished(true);
        setResult(response);
      } else if (STANDARD_GROUP_URL) {
        const response = await getGroupId(document.getElementById("url").value);
        setTimeout(() => setFetching(false), 3000);
        setFinished(true);
        setResult(response);
      } else {
        const response = await getPostId(document.getElementById("url").value);
        setTimeout(() => setFetching(false), 3000);
        setFinished(true);
        setResult(response);
      }
    } catch (error) {
      setFetching(false);
      setError(true);
    }
  };

  return (
    <>
      <Notifications {...showNotification} />
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
                    Mọi dạng URL đều được hỗ trợ, hệ thống tự phát hiện và trả
                    kết quả dựa vào đó.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <label
          htmlFor="url"
          className="block text-sm font-medium text-gray-700 mt-8"
        >
          Nhập Facebook URL cần tìm ID
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
            onClick={() => findId()}
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
            <span>Tìm</span>
          </button>
        </div>

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
                    <li>
                      Hãy chắc rằng bạn nhập đúng URL Facebook bạn cần tìm ID
                    </li>
                    <li>
                      Đảm bảo bạn đang đăng nhập Facebook trên trình duyệt này
                    </li>
                    <li>Đảm bảo bạn không bị chặn</li>
                    <li>
                      Đảm bảo tài khoản Facebook của bạn không bị khóa các chức
                      năng
                    </li>
                    <li>
                      Nếu thỏa mãn các điều kiện phía trên vui lòng kiểm tra lại
                      kết nối mạng và thử lại lần nữa
                    </li>
                    <li>
                      Nếu vẫn không thành công hãy gọi cho đội ngũ 
                      để được hỗ trợ
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
              {`Đang xử lý`}
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
          show={
            isFetching === false && isError === false && isCompleted === true
          }
        >
          <div className="bg-gray-50 pt-12 sm:pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                  Chúc mừng, hệ thống đã tìm thấy ID
                </h2>
                <p className="mt-3 text-xl text-gray-500 sm:mt-4">
                  Facebook ID là một chuỗi định danh không đổi bằng dãy số, dùng
                  để xác định người dùng, fanpage, group hay bài viết.
                </p>
              </div>
            </div>
            <div className="mt-10 pb-12 bg-white sm:pb-16">
              <div className="relative">
                <div className="absolute inset-0 h-1/2 bg-gray-50"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="max-w-4xl mx-auto">
                    <dl className="rounded-lg bg-white shadow-lg grid">
                      <div className="flex flex-col border-b border-gray-100 p-6 text-center sm:border-0 sm:border-r">
                        <dt className="order-3 mt-2 leading-6">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(result.id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Copy ID
                          </button>
                        </dt>
                        <dt className="order-2 mt-2 text-sm sm:text-lg leading-6 font-medium text-gray-500">
                          {`Hệ thống nhận dạng ID thuộc kiểu ${result.type}`}
                        </dt>
                        <dd className="order-1 text-xl sm:text-5xl font-extrabold text-indigo-600">
                          {result.id}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </>
  );
};

export default FindId;
