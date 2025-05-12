import React from 'react';

function Loader() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#121212] to-[#191414]">
      <div className="animate-pulse text-white text-2xl font-bold mb-4">
        Loading...
      </div>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  );
}

export default Loader;