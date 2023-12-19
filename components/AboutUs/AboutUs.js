const AboutUs = () => {
    return (
      <div className="container mt-8">
        <div className="relative bg-gray-800 rounded-lg">
          <div className="h-56 bg-white sm:h-72 md:absolute md:left-0 md:h-full md:w-1/2 rounded-l-lg shadow-lg">
            <img
              className="w-full h-full object-contain"
              src="teamwork.svg"
              alt=""
            />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="md:ml-auto md:w-1/2 md:pl-10">
              <h2 className="text-base font-semibold uppercase tracking-wider text-gray-300">
                Nhóm 46
              </h2>
              <p className="mt-2 text-white text-3xl font-extrabold tracking-tight sm:text-4xl">
                Tiện ích Google Chrome crawl thông tin từ FaceBook
              </p>
              <p className="mt-3 text-lg text-gray-300">
                Trịnh Hữu Tùng - 20204805
              </p>
              <p className="mt-3 text-lg text-gray-300">
                Trần Minh Tuấn - 20205137
              </p>
              <p className="mt-3 text-lg text-gray-300">
                Đinh Thanh Tùng - 20200570
              </p>
              <p className="mt-3 text-lg text-gray-300">
                Cao Thanh Tùng - 20200569
              </p>
              <div className="mt-8">
                <div className="inline-flex rounded-md shadow">
                  <a
                    target="_blank"
                    href="https://github.com/tuana8tmtt/btl-web.git"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50"
                  >
                    Link Github
                    <svg
                      className="-mr-1 ml-3 h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default AboutUs;
  
