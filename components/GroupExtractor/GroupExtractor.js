import { useState } from "react";
import cheerio from "cheerio";
import qs from "querystring";
import { Transition } from "@headlessui/react";
import { Player } from "@lottiefiles/react-lottie-player";
import axios from "axios";

const GroupExtractor = () => {
  const [groupUid, setUID] = useState("");
  const [result, setResult] = useState("");
  const [count, setCounted] = useState(0);
  const [isError, setError] = useState(false);
  const [isFetching, setFetching] = useState(false);
  const [isCompleted, setFinished] = useState(false);

  const getUid = async () => {
    const endpoint = new URL(document.getElementById("group_url").value);
    const path = endpoint.pathname;
    let groupUid;

    const GROUP_NO_USERNAME = /^\/groups\/([\d]+)\/?$/g.test(path);

    if (GROUP_NO_USERNAME) {
      groupUid = /\/groups\/([\d]+)\/?/.exec(path)[1];
      return groupUid;
    } else {
      const response = await axios.get(
        document.getElementById("group_url").value
      );

      groupUid = /property="al:android:url" content="fb:\/\/group\/([\d]+)"/.exec(
        response.data
      )[1];
      return groupUid;
    }
    // return 242195169144002;
  };

  const getMembers = async (fb_dtsg, group_uid, start, uid, cursor, list) => {
    try {
      const data = {
        fb_dtsg: fb_dtsg,
        gid: group_uid,
        order: "default",
        view: "list",
        limit: "100",
        sectiontype: "all_members",
        cursor: cursor,
        start: start,
        av: uid,
        "nctr[_mod]": "pagelet_group_members",
        __user: uid,
        __a: "1",
        __req: "88",
        __be: "1",
        __pc: "PHASED:ufi_home_page_pkg",
        dpr: "1",
      };

      const options = {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        data: qs.stringify(data),
        url:
          "https://www.facebook.com/ajax/browser/list/group_confirmed_members/",
      };

      const body = await axios(options);
      const jsonstring = body.data.replace("for (;;);", "");
      const htmlpayload = JSON.parse(jsonstring)["domops"][0][3]["__html"];
      const $ = cheerio.load(htmlpayload);

      for (let i = 0; i < $("div[id^='all_members_']").length; i++) {
        let y = $("div[id^='all_members_']")
          .eq(i)
          .attr("id")
          .replace("all_members_", "");
        let x = y + "|" + $("a")
          .eq(i * 2)
          .attr("title");
        list.push(
          x
        );
        console.log(x);
      }

      setCounted(list.length);

      if (/cursor=([^&]+)&amp/gm.exec(htmlpayload) === null) {
        setTimeout(() => setFetching(false), 3000);
        setFinished(true);
        setResult(list.join("\n"));
      } else {
        console.log("s")
        getMembers(
          fb_dtsg,
          group_uid,
          start + 100,
          uid,
          /cursor=([^&]+)&amp/gm.exec(htmlpayload)[1],
          list
        );
      }
    } catch (error) {
      console.log(error)
      setFetching(false);
      setError(true);
      setFinished(true);
      setResult(list.join("\n"));
    }
  };

  const groupExtractor = async () => {
    try {
      setError(false);
      setResult("");
      setFinished(false);
      setFetching(true);
      setCounted(0);
      const group_uid = await getUid();
      setUID(group_uid);
      const profilePage = await axios.get("https://mbasic.facebook.com/profile.php");
      const fb_dtsg = /<input type="hidden" name="fb_dtsg" value="([^"]+)" autocomplete="off" \/>/m.exec(
        profilePage.data
      )[1];
      console.log(fb_dtsg);
      const uid = localStorage.uid;

      getMembers(fb_dtsg, group_uid, 0, uid, "", []);
    } catch (error) {
      console.log("sss")
      setError(true);
    }
  };

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
                  Đối với nhóm riêng tư, bạn cần phải tham gia vào nhóm trước
                  khi cào.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <label
        htmlFor="group_url"
        className="block text-sm font-medium text-gray-700 mt-8"
      >
        Nhập URL của nhóm cần quét
      </label>
      <div className="mt-1 flex rounded-md shadow-sm">
        <input
          type="text"
          name="group_url"
          id="group_url"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
          placeholder="https://www.facebook.com/groups/asvcommunity"
        />
        <button
          className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => groupExtractor()}
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
                    Hãy chắc rằng bạn nhập đúng URL của nhóm Facebook bạn cần
                    quét
                  </li>
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
                download={`${groupUid}.txt`}
              >
                {`${groupUid}.txt`}
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

export default GroupExtractor;
