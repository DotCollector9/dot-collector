import dynamic from "next/dynamic";

const GlobeClient = dynamic(() => import("./GlobeClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-950">
      <div className="text-gray-400 text-sm animate-pulse">Loading globe...</div>
    </div>
  ),
});

export default GlobeClient;
