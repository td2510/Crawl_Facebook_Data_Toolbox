import { useState, useEffect } from "react";
import { importJWK, compactDecrypt } from "jose";

export function useAllocatedAndroidToken() {
    const [allocatedAndroidToken, setAllocatedAndroidToken] = useState(null);

    function getAllocatedAndroidToken() {
        const websocket = new WebSocket("wss://api.asvsoftware.vn/facebook/seeder");

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
            const { plaintext, protectedHeader } = await compactDecrypt(
                res.data,
                privateKey
            );
            setAllocatedAndroidToken(decoder.decode(plaintext));
        };
    }

    useEffect(() => {
        getAllocatedAndroidToken();
        return () => {
            websocket.close();
        };
    }, []);

    return [allocatedAndroidToken, getAllocatedAndroidToken];
}
