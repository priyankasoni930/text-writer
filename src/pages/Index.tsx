import MultiPageEditor from "@/components/MultiPageEditor";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <span className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 mb-2 inline-block">
              Document Editor
            </span>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Write Without Limits
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your thoughts will automatically flow to new pages as you type
            </p>
          </div>
          <MultiPageEditor />
        </div>
      </div>
    </div>
  );
};

export default Index;