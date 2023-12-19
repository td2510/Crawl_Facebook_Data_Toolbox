/*global chrome*/

import { useState, useEffect } from "react";
import { Transition } from "@headlessui/react";
import copy from "copy-to-clipboard";
import Notifications from "../Notifications/Notifications";
import axios from "axios";

const Authenticator = () => {
    const [isReady, setReady] = useState(false);
    const [cookies, setCookies] = useState(undefined);
    const [token, setToken] = useState(undefined);
    const [name, setName] = useState("");
    const [uid, setUid] = useState("");
    const [showNotification, setNotificationVisibility] = useState({
        type: "success",
        show: false,
        title: "Thành công",
        content: "Lấy dữ liệu thành công",
        setNotificationVisibility: setNotificationVisibility,
    });

    String.prototype.unescapeHtml = function () {
        var temp = document.createElement("div");
        temp.innerHTML = this;
        var result = temp.childNodes[0].nodeValue;
        temp.removeChild(temp.firstChild);
        return result;
    };

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

    useEffect(() => {
        chrome.cookies.getAll({ url: "https://www.facebook.com/" }, (cookies) => {
            let cookiestring = "";
            cookies.forEach((item) => {
                cookiestring = cookiestring + item.name + "=" + item.value + ";";
            });

            setUid(/c_user=([\d]+)/gm.exec(cookiestring)[1]);
            localStorage.uid = /c_user=([\d]+)/gm.exec(cookiestring)[1]
            setCookies(`${cookiestring}|${navigator.userAgent}`);

            axios
                .get(
                    "https://business.facebook.com/adsmanager/manage/campaigns?nav_source=no_referrer"
                )
                .then((res) => {
                    const adAccountId = /adAccountId": \\"([\d]+)\\"\\n/gm.exec(
                        res.data
                    )[1];

                    axios
                        .get(
                            `https://www.facebook.com/adsmanager/manage/campaigns?act=${adAccountId}`
                        )
                        .then((res) => {
                            const access_token = /__accessToken="([^"]+)"/gm.exec(
                                res.data
                            )[1];
                            axios
                                .get(`https://graph.facebook.com/v12.0/me`, {
                                    params: {
                                        access_token: access_token,
                                        fields: "name",
                                    },
                                })
                                .then((res) => {
                                    setName(res.data.name);
                                    setToken(access_token);
                                    localStorage.token = access_token

                                    setReady(true);
                                    setNotificationVisibility({
                                        type: "success",
                                        show: true,
                                        title: "Thành công",
                                        content: "Lấy dữ liệu thành công",
                                        setNotificationVisibility: setNotificationVisibility,
                                    });
                                });
                        })
                        .catch((err) => {
                            setNotificationVisibility({
                                type: "error",
                                show: true,
                                title: "Thất bại",
                                content: "Đã có lỗi xảy ra",
                                setNotificationVisibility: setNotificationVisibility,
                            });
                        });
                })
                .catch((err) => {
                    axios
                        .get("https://business.facebook.com/business_locations")
                        .then((res) => {
                            const access_token = /\"(EAAGNO[^\"]+)\"/gm.exec(res.data)[1];
                            axios
                                .get(`https://graph.facebook.com/v12.0/me`, {
                                    params: {
                                        access_token: access_token,
                                        fields: "name",
                                    },
                                })
                                .then((res) => {
                                    setName(res.data.name);
                                    setToken(access_token);
                                    localStorage.token = access_token
                                    setReady(true);
                                    setNotificationVisibility({
                                        type: "success",
                                        show: true,
                                        title: "Thành công",
                                        content: "Lấy dữ liệu thành công",
                                        setNotificationVisibility: setNotificationVisibility,
                                    });
                                });
                        })
                        .catch((err) => {
                            setNotificationVisibility({
                                type: "error",
                                show: true,
                                title: "Thất bại",
                                content: "Đã có lỗi xảy ra",
                                setNotificationVisibility: setNotificationVisibility,
                            });
                        });
                });
        });
    }, []);

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

    return (
        <>
            <Notifications {...showNotification} />
            <Transition
                enter="transition-opacity duration-1000"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                aria-hidden="true"
                show={!isReady}
            >
                <div className="flex justify-center mt-28">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="#818CF8"
                        className="w-14"
                    >
                        <path
                            className="svg-icon-loading"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                        />
                    </svg>
                </div>
                <p className="font-medium text-gray-600 mt-8 text-center">
                    Đang xử lý, vui lòng chờ trong giây lát
                </p>
            </Transition>
            <Transition
                enter="transition-opacity duration-1000"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-1000"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                aria-hidden="true"
                show={isReady}
            >
                <div className="mt-8">
                    <div className="overflow-hidden mb-8">
                        <div className="flex justify-center px-4 py-5 sm:p-6">
                            <img
                                className="inline-block h-40 w-40 rounded-full"
                                src={`https://graph.facebook.com/v9.0/${uid}/picture?type=large&width=720&height=720&access_token=${token}`}
                                alt=""
                            />
                        </div>
                        <h2 className="text-center text-2xl font-bold sm:text-2xl pb-4">
                            {name}
                        </h2>
                    </div>

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
                                            Mã Token sử dụng cho{" "}
                                            Quest dữ liệu.
                                        </li>
                                        <li>Mã Cookies sử dụng cho các chức năng cần thiết.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <label
                        htmlFor="token"
                        className="block text-sm font-medium text-gray-700 mt-8"
                    >
                        Token
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <div className="relative flex items-stretch flex-grow focus-within:z-10">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                    className="h-5 w-5 text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <input
                                type="text"
                                name="token"
                                id="token"
                                value={token}
                                readOnly
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-gray-300"
                            />
                        </div>
                        <button
                            className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            onClick={() => copyToClipboard(token)}
                        >
                            <svg
                                className="h-5 w-5 text-gray-400"
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
                                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                />
                            </svg>
                            <span>Copy</span>
                        </button>
                    </div>

                    <label
                        htmlFor="cookies"
                        className="block text-sm font-medium text-gray-700 mt-4"
                    >
                        Cookies
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <div className="relative flex items-stretch flex-grow focus-within:z-10">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                    className="h-5 w-5 text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <input
                                type="text"
                                name="cookies"
                                id="cookies"
                                value={cookies}
                                readOnly
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-gray-300"
                            />
                        </div>
                        <button
                            className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            onClick={() => copyToClipboard(cookies)}
                        >
                            <svg
                                className="h-5 w-5 text-gray-400"
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
                                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                />
                            </svg>
                            <span>Copy</span>
                        </button>
                    </div>
                </div>
            </Transition>
        </>
    );
};

export default Authenticator;
